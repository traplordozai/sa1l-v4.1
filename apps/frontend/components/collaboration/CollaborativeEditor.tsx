"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Save, Clock, History, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RichTextEditor } from "../shared/RichTextEditor"

// In a real app, this would come from a real-time collaboration service like Yjs or ShareDB
const mockCollaborators = [
  { id: "1", name: "John Doe", avatar: "/placeholder.svg?height=40&width=40", color: "#8884d8" },
  { id: "2", name: "Jane Smith", avatar: "/placeholder.svg?height=40&width=40", color: "#82ca9d" },
  { id: "3", name: "Bob Johnson", avatar: "/placeholder.svg?height=40&width=40", color: "#ffc658" },
]

// Mock version history
const mockVersionHistory = [
  { id: "v1", timestamp: new Date(Date.now() - 3600000), author: "John Doe" },
  { id: "v2", timestamp: new Date(Date.now() - 1800000), author: "Jane Smith" },
  { id: "v3", timestamp: new Date(), author: "You" },
]

interface CollaborativeEditorProps {
  documentId?: string
  initialContent?: string
  title?: string
  onSave?: (content: string) => void
}

/**
 * Real-time collaborative document editor
 * In a real app, this would use a library like Yjs, ShareDB, or Firepad
 */
export default function CollaborativeEditor({
  documentId = "doc-1",
  initialContent = "<p>Start collaborating on this document...</p>",
  title = "Untitled Document",
  onSave,
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [documentTitle, setDocumentTitle] = useState(title)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeCollaborators, setActiveCollaborators] = useState(mockCollaborators)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  // Simulate periodic auto-save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (content !== initialContent) {
        handleSave()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(saveInterval)
  }, [content, initialContent])

  // Simulate collaborators joining/leaving
  useEffect(() => {
    const collaboratorInterval = setInterval(() => {
      // Randomly add or remove a collaborator
      setActiveCollaborators((prev) => {
        if (Math.random() > 0.7 && prev.length > 1) {
          // Remove a random collaborator
          const index = Math.floor(Math.random() * prev.length)
          return [...prev.slice(0, index), ...prev.slice(index + 1)]
        } else if (prev.length < mockCollaborators.length) {
          // Add a collaborator that's not already active
          const inactiveCollaborators = mockCollaborators.filter((c) => !prev.some((p) => p.id === c.id))
          if (inactiveCollaborators.length > 0) {
            const newCollaborator = inactiveCollaborators[Math.floor(Math.random() * inactiveCollaborators.length)]
            return [...prev, newCollaborator]
          }
        }
        return prev
      })
    }, 15000) // Change collaborators every 15 seconds

    return () => clearInterval(collaboratorInterval)
  }, [])

  const handleSave = useCallback(() => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      if (onSave) {
        onSave(content)
      }
      setLastSaved(new Date())
      setIsSaving(false)
    }, 800)
  }, [content, onSave])

  const handleShare = () => {
    // In a real app, this would open a sharing dialog
    alert(`Sharing link: https://example.com/documents/${documentId}`)
  }

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersion(versionId)
    // In a real app, this would load the content from the selected version
    // For now, we'll just simulate it
    if (versionId === "v1") {
      setContent("<p>This is the first version of the document.</p>")
    } else if (versionId === "v2") {
      setContent("<p>This is the second version with some edits.</p>")
    } else if (versionId === "v3") {
      setContent(initialContent)
    }
  }

  const handleRestoreVersion = () => {
    if (selectedVersion) {
      // In a real app, this would restore the selected version
      setShowVersionHistory(false)
      // Simulate saving the restored version
      handleSave()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full border-0 bg-transparent text-2xl font-bold focus:outline-none focus:ring-0"
                placeholder="Document Title"
              />
              <CardDescription>
                {lastSaved ? (
                  <span className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-3 w-3" />
                    Last saved {lastSaved.toLocaleTimeString()}
                  </span>
                ) : (
                  "Not saved yet"
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {activeCollaborators.map((collaborator) => (
                  <Avatar key={collaborator.id} className="border-2 border-white" style={{ borderColor: "white" }}>
                    <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                    <AvatarFallback style={{ backgroundColor: collaborator.color }}>
                      {collaborator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowVersionHistory(!showVersionHistory)}>
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className={showVersionHistory ? "col-span-2" : "col-span-3"}>
              <RichTextEditor value={content} onChange={setContent} placeholder="Start typing..." minHeight="400px" />
            </div>

            {showVersionHistory && (
              <div className="border-l pl-4">
                <h3 className="mb-4 text-lg font-medium">Version History</h3>
                <div className="space-y-3">
                  {mockVersionHistory.map((version) => (
                    <div
                      key={version.id}
                      className={`cursor-pointer rounded-md border p-3 ${
                        selectedVersion === version.id
                          ? "border-westernPurple bg-westernPurple/5"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => handleVersionSelect(version.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{version.author}</span>
                        <span className="text-xs text-gray-500">{version.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {version.id === "v3" ? "Current version" : `Version ${version.id}`}
                      </p>
                    </div>
                  ))}
                </div>
                {selectedVersion && selectedVersion !== "v3" && (
                  <Button className="mt-4 w-full" onClick={handleRestoreVersion}>
                    Restore This Version
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center text-sm text-gray-500">
              <Users className="mr-2 h-4 w-4" />
              {activeCollaborators.length} active collaborator{activeCollaborators.length !== 1 ? "s" : ""}
            </div>
            <div className="text-sm text-gray-500">Document ID: {documentId}</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

