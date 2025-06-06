from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import AsyncOpenAI
from groq import AsyncGroq
import os
import logging
import json
import redis
from datetime import datetime, timedelta
import asyncio
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis setup
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        db=0,
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Redis connected successfully")
except:
    logger.warning("Redis not available, using memory storage")
    redis_client = None

memory_conversations = {}

class APIManager:
    def __init__(self):
        self.openai_client = None
        self.groq_client = None
        self.current_provider = "openai"
        self.quota_exceeded = {"openai": False, "groq": False}
        self.rate_limits = {"openai": [], "groq": []}
        self._init_clients()
    
    def _init_clients(self):
        if OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
            logger.info("OpenAI client initialized")
        if GROQ_API_KEY:
            self.groq_client = AsyncGroq(api_key=GROQ_API_KEY)
            logger.info("Groq client initialized")

    def _check_rate_limit(self, provider: str) -> bool:
        now = datetime.now()
        self.rate_limits[provider] = [
            ts for ts in self.rate_limits[provider] if now - ts < timedelta(minutes=1)
        ]
        return len(self.rate_limits[provider]) < 50

    def _record_request(self, provider: str):
        self.rate_limits[provider].append(datetime.now())

    async def _make_openai_request(self, messages: List[Dict], **kwargs):
        if not self.openai_client:
            raise Exception("OpenAI client not initialized")
        if not self._check_rate_limit("openai"):
            raise Exception("Rate limit exceeded for OpenAI")
        self._record_request("openai")
        try:
            response = await self.openai_client.chat.completions.create(
                model=kwargs.get("model", "gpt-3.5-turbo"),
                messages=messages,
                max_tokens=kwargs.get("max_tokens", 1000),
                temperature=kwargs.get("temperature", 0.7)
            )
            return response.choices[0].message.content
        except Exception as e:
            if "quota" in str(e).lower():
                self.quota_exceeded["openai"] = True
            raise e

    async def _make_groq_request(self, messages: List[Dict], **kwargs):
        if not self.groq_client:
            raise Exception("Groq client not initialized")
        if not self._check_rate_limit("groq"):
            raise Exception("Rate limit exceeded for Groq")
        self._record_request("groq")
        try:
            response = await self.groq_client.chat.completions.create(
                model=kwargs.get("model", "llama3-8b-8192"),
                messages=messages,
                max_tokens=kwargs.get("max_tokens", 1000),
                temperature=kwargs.get("temperature", 0.7)
            )
            return response.choices[0].message.content
        except Exception as e:
            if "quota" in str(e).lower():
                self.quota_exceeded["groq"] = True
            raise e

    async def make_request(self, messages: List[Dict], **kwargs):
        if self.current_provider == "openai" and not self.quota_exceeded["openai"]:
            primary, secondary = "openai", "groq"
        elif not self.quota_exceeded["groq"]:
            primary, secondary = "groq", "openai"
        elif not self.quota_exceeded["openai"]:
            primary, secondary = "openai", "groq"
        else:
            raise Exception("All API quotas exceeded")

        try:
            if primary == "openai":
                return await self._make_openai_request(messages, **kwargs), "openai"
            else:
                kwargs["model"] = "llama3-8b-8192"
                return await self._make_groq_request(messages, **kwargs), "groq"
        except Exception as e:
            logger.warning(f"Primary provider ({primary}) failed: {e}")
            try:
                if secondary == "openai" and not self.quota_exceeded["openai"]:
                    return await self._make_openai_request(messages, **kwargs), "openai"
                elif secondary == "groq" and not self.quota_exceeded["groq"]:
                    kwargs["model"] = "llama3-8b-8192"
                    return await self._make_groq_request(messages, **kwargs), "groq"
                else:
                    raise Exception(f"Secondary provider ({secondary}) unavailable")
            except Exception as e2:
                logger.error(f"Both providers failed. Primary: {e}, Secondary: {e2}")
                raise Exception("All API providers failed")

api_manager = APIManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ResearchMate API server")
    yield
    logger.info("Shutting down ResearchMate API server")

app = FastAPI(
    title="ResearchMate API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExplainRequest(BaseModel):
    text: str
    context: Optional[str] = "academic_research"

class ChatRequest(BaseModel):
    query: str
    context: Optional[str] = ""
    conversation_id: Optional[str] = None

class KeyTerm(BaseModel):
    term: str
    definition: str

class ExplainResponse(BaseModel):
    explanation: str
    summary: str
    keyTerms: List[KeyTerm]
    provider_used: str

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    provider_used: str

def get_conversation_history(cid: str) -> List[Dict]:
    try:
        if redis_client:
            history = redis_client.get(f"conv:{cid}")
            return json.loads(history) if history else []
        return memory_conversations.get(cid, [])
    except:
        return []

def save_conversation_history(cid: str, history: List[Dict]):
    try:
        if redis_client:
            redis_client.setex(f"conv:{cid}", 3600, json.dumps(history))
        else:
            memory_conversations[cid] = history
    except Exception as e:
        logger.error(f"Failed to save conversation: {e}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "current_provider": api_manager.current_provider,
        "quota_status": api_manager.quota_exceeded,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/explain", response_model=ExplainResponse)
async def explain_text(request: ExplainRequest):
    try:
        system_prompt = """You are ResearchMate, an AI assistant specialized in explaining academic and research content.
        Your task is to provide clear, comprehensive explanations of complex text.

        For the given text, provide:
        1. A detailed explanation (2-3 paragraphs)
        2. A concise TL;DR summary (1-2 sentences)
        3. Key terms with definitions (3-5 important terms)

        Format your response as JSON with exactly these fields:
        {
            "explanation": "...",
            "summary": "...", 
            "keyTerms": [{"term": "...", "definition": "..." }]
        }"""

        user_prompt = f"""Please explain this text in the context of {request.context}:

        "{request.text}"

        Remember to format your response as valid JSON."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        response_text, provider = await api_manager.make_request(
            messages, temperature=0.3, max_tokens=1200
        )

        try:
            data = json.loads(response_text)
        except json.JSONDecodeError:
            data = {
                "explanation": response_text,
                "summary": "Summary unavailable",
                "keyTerms": []
            }

        return ExplainResponse(
            explanation=data.get("explanation", ""),
            summary=data.get("summary", ""),
            keyTerms=[KeyTerm(**term) for term in data.get("keyTerms", [])],
            provider_used=provider
        )

    except Exception as e:
        logger.error(f"Error in explain_text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    try:
        cid = request.conversation_id or f"conv_{datetime.now().timestamp()}"
        history = get_conversation_history(cid)

        system_msg = {
            "role": "system",
            "content": """You are ResearchMate, an AI research assistant. Help users understand academic papers, research concepts, and scientific topics in a clear and simple way."""
        }

        messages = [system_msg] + history[-10:]
        if request.context:
            messages.append({"role": "system", "content": f"Context: {request.context}"})
        messages.append({"role": "user", "content": request.query})

        response_text, provider = await api_manager.make_request(
            messages, temperature=0.7, max_tokens=800
        )

        history += [
            {"role": "user", "content": request.query},
            {"role": "assistant", "content": response_text}
        ]
        save_conversation_history(cid, history)

        return ChatResponse(
            response=response_text,
            conversation_id=cid,
            provider_used=provider
        )
    except Exception as e:
        logger.error(f"Error in chat_query: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{cid}")
async def get_conversation(cid: str):
    try:
        return {"conversation_id": cid, "history": get_conversation_history(cid)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/conversations/{cid}")
async def delete_conversation(cid: str):
    try:
        if redis_client:
            redis_client.delete(f"conv:{cid}")
        else:
            memory_conversations.pop(cid, None)
        return {"message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_api_stats():
    return {
        "current_provider": api_manager.current_provider,
        "quota_status": api_manager.quota_exceeded,
        "rate_limits": {k: len(v) for k, v in api_manager.rate_limits.items()}
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
