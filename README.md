# 📚 ResearchMate - Your AI Research Assistant Chrome Extension

![ResearchMate Banner](https://github.com/Pranaykarvi/researchMate/blob/main/banners/Screenshot%202025-06-11%20190509%20(1).jpg) <!-- Optional: Replace with actual image -->

**ResearchMate** is an AI-powered Chrome extension that helps students, researchers, and curious minds decode academic papers effortlessly. Get explanations, summaries, definitions, and ask follow-up questions — all while reading online!

---

## ✨ Features

🔍 **Context-Aware Explanation**  
Select academic text and get instant, concise explanations from state-of-the-art LLMs.

💬 **AI Chatbot with Memory**  
Open the sidebar for a full-featured research chatbot that understands context and supports follow-ups.

📑 **Smart Summarizer**  
Quickly generate summaries of long paragraphs or research abstracts.

🧠 **Definition & Term Clarification**  
Break down complex technical terms with simplified explanations and examples.

🔗 **Link Pasting**  
Paste arXiv/DOI links or drop content — the assistant will analyze and explain.

🚀 **Powered by LangChain + OpenAI/Groq**  
Uses specialized agents like:  
- `qa_agent` for detailed answers  
- `explainer_agent` for term clarification  
- `question_agent` for refining user input

💾 **Persistent Memory**  
Backed by Redis to maintain chat memory across sessions (in production).

---

## 🌍 Live Backend

The backend API is live and deployed here:  
**🔗 https://researchmate.onrender.com**

> No setup needed for backend — just install the Chrome extension and start using it!

---

## 🧪 How to Use

1. **Download or clone** this repo.
2. Open Chrome and go to `chrome://extensions`.
3. **Enable Developer Mode** (top right).
4. Click **"Load Unpacked"** and select the `extension/` folder.
5. Select any research text on a webpage or PDF.
6. **Right-click** or use a **keyboard shortcut** to get assistance.
7. Use the **chatbot sidebar** to ask questions and explore concepts.

---

## 🧠 Tech Stack

### 💻 Frontend (Chrome Extension)
- Manifest V3
- HTML + JavaScript
- Context Menu, Sidebar, and Popup UIs
- Keyboard shortcut support

### 🛠 Backend (Already Deployed)
- **FastAPI** for API endpoints
- **LangChain** for LLM agent routing
- **OpenAI** and **Groq** APIs for processing
- **Redis** for chat memory (in production)

---

## 🔐 Permissions & Security

ResearchMate uses only safe permissions:

```json
"permissions": ["activeTab", "contextMenus", "storage", "scripting"]
```
---
## 📦 Packaging for Release
```bash
cd extension/
zip -r researchmate.zip .
```
---
## 🧑‍💻 Author
Pranay Kumar Karvi

Contributions welcome!
Feel free to fork, raise issues, or open pull requests.
---
##📄 License
This project is licensed under the MIT License.

## ⭐ Show Your Support
If you find this project helpful:

- 🌟 Star the repo

- 🗣️ Share with friends and labmates

- 🧠 Use it in your next research sprint

