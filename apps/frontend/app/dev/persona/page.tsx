// File: apps/frontend/app/dev/persona/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import DevPersona from "@/components/features/dev/DevPersona.tsx"
import Button from "@/components/ui/Button"

const personas = [
  { id: "admin", name: "Administrator", description: "Full access to the system" },
  { id: "faculty", name: "Faculty Member", description: "Access to manage students and courses" },
  { id: "student", name: "Student", description: "Access to view courses and submit work" },
  { id: "org", name: "Organization", description: "Access to manage projects and internships" },
]

export default function PersonaSimulatorPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const simulatePersona = async (role: string) => {
    setLoading(true)
    try {
      await fetch("/api/dev/persona", {
        method: "POST",
        body: JSON.stringify({ role }),
        headers: { "Content-Type": "application/json" },
      })
      router.push(`/${role}/dashboard`)
    } catch (error) {
      console.error("Error simulating persona:", error)
      alert("Failed to simulate persona")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dev Persona Simulator</h1>
          <p className="mt-2 text-gray-600">Select a user role to simulate the application from their perspective</p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Available Personas</h2>
            <p className="text-sm text-gray-500">This tool is for development purposes only</p>
          </div>

          <div className="p-4 space-y-4">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className={`p-4 border rounded-md cursor-pointer transition-colors ${
                  selected === persona.id ? "border-westernPurple bg-purple-50" : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setSelected(persona.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{persona.name}</h3>
                    <p className="text-sm text-gray-500">{persona.description}</p>
                  </div>
                  <div className="flex items-center">
                    {selected === persona.id && (
                      <svg
                        className="h-5 w-5 text-westernPurple"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-t">
            <Button
              variant="primary"
              className="w-full"
              disabled={!selected || loading}
              isLoading={loading}
              onClick={() => selected && simulatePersona(selected)}
            >
              Simulate Selected Persona
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <DevPersona />
        </div>
      </div>
    </div>
  )
}

