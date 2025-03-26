"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

import { useEffect, useRef, useState } from "react"
import { startIdleTimer } from "../../lib/idleLogout"

function ImpersonationBanner() {
  const [user, setUser] = useState("")
  useEffect(() => {
    fetch("/api/admin/impersonated")
      .then((res) => res.json())
      .then((d) => setUser(d?.name))
  }, [])

  if (!user) return null
  useEffect(() => startIdleTimer(15 * 60 * 1000), [])
  return (
    <div className="bg-yellow-100 text-yellow-900 p-2 text-sm text-center">
      Impersonating: {user} —{" "}
      <a href="/api/admin/impersonate/clear" className="underline">
        Revert
      </a>
    </div>
  )
}

function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Check for API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const res = await fetch("/api/deepseek/check-key")
        setHasApiKey(res.ok)
      } catch (error) {
        console.error("Failed to check API key:", error)
        setHasApiKey(false)
      }
    }
    checkApiKey()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Single idle timer instance
  useEffect(() => {
    const cleanup = startIdleTimer(15 * 60 * 1000)
    return () => cleanup()
  }, [])

  const submit = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!res.ok) throw new Error("Failed to get response")

      const json = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: json.reply }])
    } catch (error) {
      console.error("Assistant error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!hasApiKey) return null

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        title="Open AI Assistant"
      >
        🤖
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white w-96 border shadow-xl rounded-lg overflow-hidden">
      <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        <strong>AI Assistant</strong>
        <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" title="Close">
          ✖
        </button>
      </div>

      <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && <p className="text-gray-500 text-center">👋 Hi! How can I help you today?</p>}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">Thinking...</div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
            placeholder="Ask something..."
            disabled={loading}
          />
          <button
            onClick={submit}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  useEffect(() => startIdleTimer(15 * 60 * 1000), [])
  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar />
        <ImpersonationBanner />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <AssistantWidget />
      </div>
    </div>
  )
}

