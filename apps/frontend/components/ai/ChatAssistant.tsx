"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Bot, User, Loader2, X, Maximize2, Minimize2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchDeepseekResponse } from "@/lib/deepseek"
import { useLocalStorage } from "@/hooks/utils/useLocalStorage"

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

type ChatSession = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

/**
 * AI-powered chat assistant component
 * Uses DeepSeek to provide conversational assistance
 */
export default function ChatAssistant() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession>({
    id: crypto.randomUUID(),
    title: "New Conversation",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  // Store chat history in localStorage
  const [chatHistory, setChatHistory] = useLocalStorage<ChatSession[]>("chat-history", [])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession.messages])

  // Update chat history when current session changes
  useEffect(() => {
    if (currentSession.messages.length > 0) {
      setChatHistory((prev) => {
        const existingIndex = prev.findIndex((session) => session.id === currentSession.id)
        const updatedSession = {
          ...currentSession,
          updatedAt: new Date(),
        }

        if (existingIndex >= 0) {
          const newHistory = [...prev]
          newHistory[existingIndex] = updatedSession
          return newHistory
        } else {
          return [updatedSession, ...prev]
        }
      })
    }
  }, [currentSession, setChatHistory])

  const handleSendMessage = async () => {
    if (!input.trim() && !fileInputRef.current?.files?.length) return

    let messageContent = input.trim()
    setInput("")

    // Handle file attachment
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0]
      messageContent += `\n[Attached file: ${file.name}]`
      // In a real app, you would upload the file to a server
      fileInputRef.current.value = ""
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setCurrentSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }))

    // Get AI response
    setIsLoading(true)
    try {
      const messages = [
        {
          role: "system" as const,
          content:
            "You are a helpful assistant for the Western University student portal. Provide concise, accurate information about university services, academic programs, and student resources.",
        },
        ...currentSession.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user" as const, content: messageContent },
      ]

      const reply = await fetchDeepseekResponse(messages)

      // Add assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      }

      setCurrentSession((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
      }))

      // Update title if this is the first message
      if (currentSession.messages.length === 0) {
        // In a real app, you would use the AI to generate a title
        const newTitle = messageContent.length > 30 ? messageContent.substring(0, 30) + "..." : messageContent

        setCurrentSession((prev) => ({
          ...prev,
          title: newTitle,
        }))
      }
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }

      setCurrentSession((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const startNewChat = () => {
    setCurrentSession({
      id: crypto.randomUUID(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const loadChatSession = (sessionId: string) => {
    const session = chatHistory.find((s) => s.id === sessionId)
    if (session) {
      setCurrentSession(session)
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex flex-col ${
        isExpanded ? "h-[80vh] w-[80vw] max-w-4xl" : "h-[500px] w-[350px]"
      } transition-all duration-300 ease-in-out`}
    >
      <Card className="flex h-full flex-col shadow-lg">
        <CardHeader className="border-b bg-westernPurple px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              <h3 className="text-sm font-medium">AI Assistant</h3>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-westernPurple-dark"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-westernPurple-dark"
                onClick={startNewChat}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat history sidebar (only visible when expanded) */}
          {isExpanded && (
            <div className="w-64 border-r bg-gray-50 p-3 overflow-y-auto">
              <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">Chat History</h4>
              <Button variant="outline" size="sm" className="mb-3 w-full justify-start" onClick={startNewChat}>
                <span className="mr-2">+</span> New Chat
              </Button>
              <div className="space-y-1">
                {chatHistory.map((session) => (
                  <button
                    key={session.id}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                      currentSession.id === session.id
                        ? "bg-westernPurple text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => loadChatSession(session.id)}
                  >
                    <div className="truncate font-medium">{session.title}</div>
                    <div className="truncate text-xs opacity-70">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main chat area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <CardContent className="flex-1 overflow-y-auto p-4">
              {currentSession.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-westernPurple/10 p-3">
                    <Bot className="h-6 w-6 text-westernPurple" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">How can I help you?</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Ask me anything about Western University, student services, or academic programs.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-westernPurple text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          <span className="text-xs font-medium">
                            {message.role === "assistant" ? "AI Assistant" : "You"}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        <div className="mt-1 text-right text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t bg-gray-50 p-3">
              <div className="flex w-full items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="min-h-[40px] w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-westernPurple focus:outline-none focus:ring-1 focus:ring-westernPurple"
                  rows={1}
                />
                <Button
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={isLoading || (!input.trim() && !fileInputRef.current?.files?.length)}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  )
}

