// File: apps/frontend/components/DevPersona.tsx
"use client"
import Button from "@/components/ui/Button.tsx"
import { useEffect, useState } from "react"

interface CurrentPersona {
  role: string
  name: string
  email: string
}

export default function DevPersona() {
  const [currentPersona, setCurrentPersona] = useState<CurrentPersona | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== "development") {
      setIsVisible(false)
      return
    }

    // Fetch the current simulated persona if any
    fetch("/api/dev/current-persona")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.role) {
          setCurrentPersona(data)
        }
      })
      .catch(() => {
        // Silently fail - this is just a dev tool
      })
  }, [])

  if (!isVisible || !currentPersona) return null

  const clearPersona = async () => {
    try {
      await fetch("/api/dev/clear-persona", { method: "POST" })
      window.location.href = "/"
    } catch (error) {
      console.error("Error clearing persona:", error)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-yellow-500 w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Dev Mode</h3>
            <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M14.293 5.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414L10 8.586l4.293-4.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">Role:</span> {currentPersona.role}
            </div>
            <div>
              <span className="font-medium">Name:</span> {currentPersona.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {currentPersona.email}
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" size="sm" onClick={clearPersona}>
              Clear Persona
            </Button>

            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/dev/persona")}>
              Change
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full shadow-lg"
          title="Developer Tools"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  )
}

