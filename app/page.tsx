"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PWAInstall } from "@/components/pwa-install"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SwipeableCard } from "@/components/swipeable-card"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import {
  Home,
  Wrench,
  Compass,
  User,
  Plus,
  Menu,
  Settings,
  Sparkles,
  FileText,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Search,
  Star,
  Clock,
  Zap,
  Copy,
  Share,
  History,
  Trash2,
  RefreshCw,
} from "lucide-react"

type Page = "home" | "tools" | "explore" | "profile"

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  placeholder: string
}

interface HistoryItem {
  id: string
  tool: string
  input: string
  output: string
  timestamp: Date
}

export default function CapyUniversePWA() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [apiKey, setApiKey] = useState("")
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")
  const [inputText, setInputText] = useState("")
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const mainRef = useTouchGestures({
    onSwipeLeft: () => {
      const pages: Page[] = ["home", "tools", "explore", "profile"]
      const currentIndex = pages.indexOf(currentPage)
      if (currentIndex < pages.length - 1) {
        setCurrentPage(pages[currentIndex + 1])
      }
    },
    onSwipeRight: () => {
      const pages: Page[] = ["home", "tools", "explore", "profile"]
      const currentIndex = pages.indexOf(currentPage)
      if (currentIndex > 0) {
        setCurrentPage(pages[currentIndex - 1])
      }
    },
    threshold: 100,
  })

  // Load API key and history from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini-api-key")
    const savedHistory = localStorage.getItem("capy-history")

    if (savedApiKey) {
      setApiKey(savedApiKey)
    } else {
      setShowApiKeyInput(true)
    }

    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
        setHistory(parsedHistory)
      } catch (error) {
        console.log("[v0] Error parsing history:", error)
      }
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[PWA] New content available, please refresh")
                  // Could show update notification here
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error)
        })
    }
  }, [])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini-api-key", apiKey.trim())
      setShowApiKeyInput(false)
    }
  }

  const saveToHistory = (tool: string, input: string, output: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      tool,
      input,
      output,
      timestamp: new Date(),
    }

    const updatedHistory = [newItem, ...history].slice(0, 50) // Keep only last 50 items
    setHistory(updatedHistory)
    localStorage.setItem("capy-history", JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("capy-history")
  }

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("capy-history", JSON.stringify(updatedHistory))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (error) {
      console.log("[v0] Copy failed:", error)
    }
  }

  const shareResult = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "CapyUniverse - Resultado IA",
          text: text,
        })
      } catch (error) {
        console.log("[v0] Share failed:", error)
      }
    } else {
      copyToClipboard(text)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate refresh delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Refresh current page data
      if (currentPage === "home") {
        // Could refresh home data
      } else if (currentPage === "tools") {
        // Could refresh tools or clear current result
        setResult("")
      }
    } catch (error) {
      console.log("[v0] Refresh failed:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const tools: Tool[] = [
    {
      id: "summarize",
      name: "Resumir Texto",
      description: "Crie resumos concisos de textos longos",
      icon: <FileText className="w-6 h-6" />,
      category: "Produtividade",
      placeholder: "Cole aqui o texto que você deseja resumir...",
    },
    {
      id: "explain",
      name: "Explicar Conceito",
      description: "Obtenha explicações claras sobre qualquer tópico",
      icon: <Lightbulb className="w-6 h-6" />,
      category: "Educação",
      placeholder: "Digite o conceito que você quer entender melhor...",
    },
    {
      id: "flashcards",
      name: "Criar Flashcards",
      description: "Gere flashcards para estudar",
      icon: <BookOpen className="w-6 h-6" />,
      category: "Educação",
      placeholder: "Digite o tópico para criar flashcards de estudo...",
    },
    {
      id: "chat",
      name: "Chat IA",
      description: "Converse com a IA sobre qualquer assunto",
      icon: <MessageSquare className="w-6 h-6" />,
      category: "Geral",
      placeholder: "Faça uma pergunta ou inicie uma conversa...",
    },
    {
      id: "translate",
      name: "Traduzir",
      description: "Traduza textos para diferentes idiomas",
      icon: <Zap className="w-6 h-6" />,
      category: "Produtividade",
      placeholder: "Digite o texto que você quer traduzir...",
    },
    {
      id: "improve",
      name: "Melhorar Texto",
      description: "Aprimore a qualidade e clareza do seu texto",
      icon: <RefreshCw className="w-6 h-6" />,
      category: "Produtividade",
      placeholder: "Cole o texto que você quer melhorar...",
    },
  ]

  const callGeminiAPI = async (prompt: string, toolId: string) => {
    if (!apiKey) {
      setShowApiKeyInput(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      const data = await response.json()

      if (data.candidates && data.candidates[0]) {
        const output = data.candidates[0].content.parts[0].text
        setResult(output)
        saveToHistory(toolId, inputText, output)
      } else if (data.error) {
        setResult(`Erro: ${data.error.message}. Verifique sua chave API.`)
      } else {
        setResult("Erro ao processar a solicitação. Verifique sua chave API.")
      }
    } catch (error) {
      console.log("[v0] API Error:", error)
      setResult("Erro de conexão. Verifique sua internet e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToolAction = (toolId: string) => {
    if (!inputText.trim()) return

    let prompt = ""
    switch (toolId) {
      case "summarize":
        prompt = `Resuma o seguinte texto de forma concisa e clara, mantendo os pontos principais: ${inputText}`
        break
      case "explain":
        prompt = `Explique de forma didática e clara o seguinte conceito, usando exemplos quando apropriado: ${inputText}`
        break
      case "flashcards":
        prompt = `Crie 5 flashcards no formato "Pergunta: [pergunta] | Resposta: [resposta]" sobre o seguinte tópico: ${inputText}`
        break
      case "chat":
        prompt = inputText
        break
      case "translate":
        prompt = `Traduza o seguinte texto para inglês (se estiver em português) ou para português (se estiver em inglês): ${inputText}`
        break
      case "improve":
        prompt = `Melhore a qualidade, clareza e fluidez do seguinte texto, mantendo o significado original: ${inputText}`
        break
    }

    callGeminiAPI(prompt, toolId)
  }

  const loadHistoryItem = (item: HistoryItem) => {
    setInputText(item.input)
    setResult(item.output)
    setSelectedTool(item.tool)
    setShowHistory(false)
  }

  const renderHomePage = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">CapyUniverse</h1>
        <p className="text-muted-foreground">Sua plataforma de ferramentas IA</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Card
            key={tool.id}
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setCurrentPage("tools")}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                {tool.icon}
              </div>
              <h3 className="font-semibold text-sm">{tool.name}</h3>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
              <Badge variant="secondary" className="text-xs">
                {tool.category}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <div className="flex items-center space-x-3">
          <Zap className="w-8 h-8 text-purple-600" />
          <div>
            <h3 className="font-semibold">Dica do Dia</h3>
            <p className="text-sm text-muted-foreground">
              Use o chat IA para fazer perguntas complexas e obter respostas detalhadas!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderToolsPage = () => {
    const currentTool = selectedTool ? tools.find((t) => t.id === selectedTool) : null

    return (
      <div className="space-y-6">
        {!selectedTool ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Escolha uma Ferramenta</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="flex items-center space-x-1"
              >
                <History className="w-4 h-4" />
                <span>Histórico</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {tools.map((tool) => (
                <Card
                  key={tool.id}
                  className="p-4 hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-purple-500"
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTool(null)
                    setInputText("")
                    setResult("")
                  }}
                >
                  ← Voltar
                </Button>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                  {currentTool?.icon}
                </div>
                <h2 className="text-lg font-semibold">{currentTool?.name}</h2>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4" />
              </Button>
            </div>

            <Textarea
              ref={textareaRef}
              placeholder={currentTool?.placeholder || "Digite seu texto aqui..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] resize-none"
            />

            <div className="flex space-x-2">
              <Button
                onClick={() => handleToolAction(selectedTool)}
                disabled={isLoading || !inputText.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processando...</span>
                  </div>
                ) : (
                  "Processar"
                )}
              </Button>

              {inputText && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setInputText("")
                    setResult("")
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {result && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Resultado:</h3>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => shareResult(result)}>
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-lg">{result}</div>
          </Card>
        )}

        {showHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[70vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Histórico</h3>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={clearHistory} disabled={history.length === 0}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                    ✕
                  </Button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-96">
                {history.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Nenhum histórico ainda</div>
                ) : (
                  <div className="space-y-2 p-4">
                    {history.map((item) => {
                      const tool = tools.find((t) => t.id === item.tool)
                      return (
                        <SwipeableCard
                          key={item.id}
                          onDelete={() => deleteHistoryItem(item.id)}
                          onShare={() => shareResult(item.output)}
                          className="p-3 cursor-pointer hover:bg-muted/50"
                        >
                          <div onClick={() => loadHistoryItem(item)}>
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                                {tool?.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{tool?.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.timestamp.toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {item.input.substring(0, 50)}...
                                </p>
                              </div>
                            </div>
                          </div>
                        </SwipeableCard>
                      )
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    )
  }

  const renderExplorePage = () => (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar ferramentas..." className="pl-10" />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold">Educação</h3>
            <p className="text-xs text-muted-foreground">2 ferramentas</p>
          </Card>
          <Card className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold">Produtividade</h3>
            <p className="text-xs text-muted-foreground">1 ferramenta</p>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Populares</h2>
        {tools.slice(0, 3).map((tool) => (
          <Card key={tool.id} className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
                {tool.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm">4.8</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderProfilePage = () => (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-xl font-semibold">Usuário CapyUniverse</h2>
        <p className="text-muted-foreground">Membro desde hoje</p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ferramentas Usadas</h3>
              <p className="text-2xl font-bold text-purple-600">{history.length}</p>
            </div>
            <Wrench className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Tempo de Uso</h3>
              <p className="text-2xl font-bold text-blue-600">0h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configurações</h3>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Chave API Gemini</h4>
              <p className="text-sm text-muted-foreground">{apiKey ? "Configurada" : "Não configurada"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowApiKeyInput(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return renderHomePage()
      case "tools":
        return renderToolsPage()
      case "explore":
        return renderExplorePage()
      case "profile":
        return renderProfilePage()
      default:
        return renderHomePage()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PWAInstall />
      <OfflineIndicator />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold">CapyUniverse</h1>
          </div>
          <Button variant="ghost" size="sm">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content with Pull to Refresh and Touch Gestures */}
      <PullToRefresh onRefresh={handleRefresh} disabled={isRefreshing}>
        <main ref={mainRef} className="pb-20 px-4 py-6">
          {renderCurrentPage()}
        </main>
      </PullToRefresh>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex items-center justify-around py-2">
          {[
            { id: "home", icon: Home, label: "Início" },
            { id: "tools", icon: Wrench, label: "Ferramentas" },
            { id: "explore", icon: Compass, label: "Explorar" },
            { id: "profile", icon: User, label: "Perfil" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? "text-purple-600 bg-purple-50 dark:bg-purple-950"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg"
        onClick={() => setCurrentPage("tools")}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* API Key Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Configurar Chave API</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Insira sua chave API do Google Gemini para usar as ferramentas IA.
            </p>
            <Input
              type="password"
              placeholder="Sua chave API do Gemini"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mb-4"
            />
            <div className="flex space-x-2">
              <Button onClick={saveApiKey} className="flex-1">
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setShowApiKeyInput(false)} disabled={!apiKey}>
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
