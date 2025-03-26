"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileText, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { analyzeDocument } from "@/lib/deepseek"
import { RichTextContent } from "../shared/RichTextEditor"

interface AnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment: string
  topics: string[]
}

/**
 * AI-powered document analyzer component
 * Uses DeepSeek to analyze documents and extract insights
 */
export default function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setAnalysisResult(null)

    // Read file content
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setFileContent(content)
    }
    reader.onerror = () => {
      setError("Failed to read file. Please try again.")
    }

    if (
      selectedFile.type === "text/plain" ||
      selectedFile.type === "application/pdf" ||
      selectedFile.type === "application/msword" ||
      selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      reader.readAsText(selectedFile)
    } else {
      setError("Unsupported file type. Please upload a text, PDF, or Word document.")
      setFile(null)
    }
  }

  const handleAnalyze = async () => {
    if (!fileContent) {
      setError("No file content to analyze.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeDocument(fileContent)
      setAnalysisResult(result)
    } catch (err) {
      setError("Failed to analyze document. Please try again.")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const droppedFiles = event.dataTransfer.files
    if (droppedFiles.length > 0) {
      const fileInput = fileInputRef.current
      if (fileInput) {
        // Create a DataTransfer object to set files
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(droppedFiles[0])
        fileInput.files = dataTransfer.files

        // Trigger change event manually
        const changeEvent = new Event("change", { bubbles: true })
        fileInput.dispatchEvent(changeEvent)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Analyzer</h2>
        <p className="text-gray-500">
          Upload a document to extract key insights, summaries, and sentiment analysis using AI.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Upload a text, PDF, or Word document to analyze.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center ${
                error ? "border-red-300 bg-red-50" : "border-gray-300 hover:bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="mb-4 rounded-full bg-gray-100 p-3">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <p className="mb-2 text-sm font-medium text-gray-900">
                {file ? file.name : "Drag and drop your file here"}
              </p>
              <p className="text-xs text-gray-500">
                {file
                  ? `${(file.size / 1024).toFixed(2)} KB · ${file.type}`
                  : "Supports TXT, PDF, DOC, DOCX up to 10MB"}
              </p>

              {error && (
                <div className="mt-4 flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline" className="mr-2">
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
                <Button type="button" onClick={handleAnalyze} disabled={!file || isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Document"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>AI-generated insights from your document</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="keyPoints">Key Points</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                </TabsList>
                <TabsContent value="summary">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-900">Document Summary</h3>
                    <div className="text-sm text-gray-700">
                      <RichTextContent content={analysisResult.summary} />
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <div
                        className={`mr-2 rounded-full px-2 py-1 text-xs font-medium ${
                          analysisResult.sentiment === "positive"
                            ? "bg-green-100 text-green-800"
                            : analysisResult.sentiment === "negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {analysisResult.sentiment.charAt(0).toUpperCase() + analysisResult.sentiment.slice(1)} sentiment
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="keyPoints">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-900">Key Points</h3>
                    <ul className="list-inside list-disc space-y-2 text-sm text-gray-700">
                      {analysisResult.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="topics">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-900">Main Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-westernPurple px-3 py-1 text-xs font-medium text-white"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 px-6 py-3">
              <div className="flex items-center justify-between w-full">
                <p className="text-xs text-gray-500">Analysis powered by DeepSeek AI</p>
                <Button variant="outline" size="sm" onClick={() => setAnalysisResult(null)}>
                  Clear Results
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

