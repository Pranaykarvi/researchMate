"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Zap,
  FileText,
  MessageSquare,
  Shield,
  Github,
  Star,
  ExternalLink,
  Sparkles,
  Bot,
  Search,
  Bookmark,
  Database,
  Wifi,
  Plus,
} from "lucide-react"
import Link from "next/link"

function InteractiveDemo() {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [showContextMenu, setShowContextMenu] = React.useState(false)
  const [showSidebar, setShowSidebar] = React.useState(false)
  const [typedText, setTypedText] = React.useState("")
  const [selectedText, setSelectedText] = React.useState("")

  const demoSteps = [
    { action: "select", text: "Transformer models have revolutionized natural language processing" },
    { action: "contextMenu", text: "" },
    {
      action: "summary",
      text: "📝 Transformer models are neural networks that use attention mechanisms to process sequential data, becoming the foundation for modern NLP breakthroughs like GPT and BERT.",
    },
    { action: "reset", text: "" },
  ]

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prevStep) => {
        const step = demoSteps[prevStep]

        switch (step.action) {
          case "select":
            setSelectedText(step.text)
            setTimeout(() => setShowContextMenu(true), 1000)
            break
          case "contextMenu":
            setTimeout(() => {
              setShowContextMenu(false)
              setShowSidebar(true)
            }, 2000)
            break
          case "summary":
            let i = 0
            const typeInterval = setInterval(() => {
              if (i < step.text.length) {
                setTypedText(step.text.slice(0, i + 1))
                i++
              } else {
                clearInterval(typeInterval)
              }
            }, 50)
            break
          case "reset":
            setTimeout(() => {
              setSelectedText("")
              setShowSidebar(false)
              setTypedText("")
            }, 2000)
            break
        }

        return (prevStep + 1) % demoSteps.length
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      {/* Paper Content */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Attention Is All You Need: Understanding Transformer Architecture
        </h2>

        <p className="text-gray-700 leading-relaxed">
          The field of natural language processing has undergone significant transformation in recent years.
          <span
            className={`${selectedText ? "bg-blue-200 px-1 rounded transition-all duration-500" : ""} cursor-pointer`}
          >
            Transformer models have revolutionized natural language processing
          </span>{" "}
          by introducing the attention mechanism as the primary building block for sequence-to-sequence tasks.
        </p>

        <p className="text-gray-700 leading-relaxed">
          Unlike traditional recurrent neural networks, transformers can process sequences in parallel, leading to
          significant improvements in training efficiency and model performance across various tasks.
        </p>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="absolute bg-white border border-gray-300 rounded-lg shadow-xl p-2 z-10 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{ top: "120px", left: "300px" }}
        >
          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm text-left">
              <FileText className="w-4 h-4 text-blue-500" />
              Summarize with ResearchMate
            </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm text-left">
              <Brain className="w-4 h-4 text-green-500" />
              Explain this concept
            </button>
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm text-left">
              <MessageSquare className="w-4 h-4 text-purple-500" />
              Generate questions
            </button>
          </div>
        </div>
      )}

      {/* AI Sidebar */}
      {showSidebar && (
        <div className="absolute right-0 top-0 w-80 h-full bg-gray-50 border-l border-gray-200 p-4 animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">ResearchMate AI</span>
            <div className="ml-auto flex gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Summary</div>
              <div className="text-sm text-gray-800 leading-relaxed">
                {typedText}
                <span className="animate-pulse">|</span>
              </div>
            </div>

            {typedText.length > 50 && (
              <div className="space-y-2 animate-in fade-in-0 duration-500">
                <div className="text-xs text-gray-500">Suggested follow-ups:</div>
                <div className="space-y-1">
                  <button className="w-full text-left text-xs bg-blue-50 hover:bg-blue-100 p-2 rounded border border-blue-200 text-blue-700 transition-colors">
                    How do attention mechanisms work?
                  </button>
                  <button className="w-full text-left text-xs bg-green-50 hover:bg-green-100 p-2 rounded border border-green-200 text-green-700 transition-colors">
                    Compare transformers to RNNs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

      {/* Floating GitHub Star Button */}
      <Link
        href="https://github.com/Pranaykarvi/researchMate"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="sm"
          className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/80 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <Star className="w-4 h-4 mr-2" />
          Star on GitHub
        </Button>
      </Link>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 transition-colors">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Research Assistant
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              ResearchMate
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">Your AI Research Companion</p>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Summarize, explain, and explore academic content faster with intelligent AI assistance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="https://chromewebstore.google.com/detail/mcnjdbkckgggfapkkjkpjinlobbhapic"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Chrome
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>
                Shortcut to launch: <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Ctrl + Shift + E</kbd>
              </span>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6">
                  {/* Browser Mock */}
                  <div className="bg-gray-700 rounded-t-lg p-3 flex items-center gap-2 mb-0">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-gray-600 rounded px-3 py-1 text-xs text-gray-300 ml-4">
                      https://arxiv.org/abs/2024.12345
                    </div>
                  </div>

                  {/* Demo Content */}
                  <div className="bg-white text-black p-6 rounded-b-lg relative min-h-[400px]">
                    <InteractiveDemo />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Powerful Features
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Right-click any paragraph to unlock intelligent research capabilities
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Summaries</h3>
                  <p className="text-gray-400">
                    Get concise, intelligent summaries of complex academic content in seconds.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Clear Explanations</h3>
                  <p className="text-gray-400">Break down complex concepts into easy-to-understand explanations.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Follow-up Questions</h3>
                  <p className="text-gray-400">
                    Generate relevant questions to deepen your understanding of the topic.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Sidebar Assistant</h3>
                  <p className="text-gray-400">
                    Powered by LangChain agents for intelligent, context-aware assistance.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Universal Compatibility</h3>
                  <p className="text-gray-400">Works seamlessly with arXiv, Semantic Scholar, and PDF viewers.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                  <p className="text-gray-400">100% privacy-respecting with no tracking or data collection.</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border-gray-600 inline-block">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>FastAPI Backend</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>OpenAI/Cohere/Groq Fallback</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Upcoming Features */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Coming Soon
              </h2>
              <p className="text-gray-400 text-lg">
                Exciting features in development to enhance your research workflow
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-600 border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Bookmark className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold">PDF Annotation & Highlight Memory</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Save and sync your annotations across all research papers.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-600 border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Database className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold">Save Chat History & Sessions</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Never lose your research conversations and insights.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-600 border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <ExternalLink className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold">Notion + Zotero Integration</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Seamlessly export findings to your favorite research tools.</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/60 backdrop-blur-sm border-gray-600 border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Wifi className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold">Offline Paper Caching</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Access your research papers even without an internet connection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <img 
                  src="/WhatsApp%20Image%202025-06-10%20at%2021.09.48_8f10f4dc.jpg" 
                  alt="Pranay Karvi" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h2 className="text-3xl font-bold mb-4">Created by Pranay Karvi</h2>
              <p className="text-gray-400 text-lg mb-8">
                Passionate AI & research tool developer dedicated to making academic research more accessible and
                efficient.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="https://github.com/pranaykarvi" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </Link>

              <Link href="https://linkedin.com/in/pranaykarvi" target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                  <ExternalLink className="w-3 h-3 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-gray-800">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 ResearchMate. Built with ❤️ for researchers worldwide.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
