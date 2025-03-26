/**
 * Message type for DeepSeek API
 */
export type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

/**
 * Fetches a response from the DeepSeek API
 *
 * @param messages Conversation history
 * @returns Promise with response from DeepSeek
 */
export async function fetchDeepseekResponse(messages: Message[]): Promise<string> {
  try {
    const response = await fetch("/api/deepseek", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "Failed to fetch response")
    }

    const data = await response.json()
    return data.reply
  } catch (error) {
    const err = error as Error
    console.error("DeepSeek API Error:", err)
    throw err
  }
}

/**
 * Analysis result from document analysis
 */
export interface DocumentAnalysis {
  summary: string
  keyPoints: string[]
  sentiment: string
  topics: string[]
}

/**
 * Uses DeepSeek to analyze a document
 *
 * @param text The text to analyze
 * @returns Promise with the analysis result
 */
export async function analyzeDocument(text: string): Promise<DocumentAnalysis> {
  try {
    const messages = [
      {
        role: "system" as const,
        content: "Analyze the following document and extract key information, main topics, and sentiment.",
      },
      {
        role: "user" as const,
        content: text,
      },
    ]

    const reply = await fetchDeepseekResponse(messages)

    return {
      summary: extractSummary(reply),
      keyPoints: extractKeyPoints(reply),
      sentiment: extractSentiment(reply),
      topics: extractTopics(reply),
    }
  } catch (error) {
    const err = error as Error
    console.error("Document analysis error:", err)
    throw err
  }
}

/**
 * Extracts a summary from the AI response
 * @param text The AI response text
 * @returns The extracted summary
 */
function extractSummary(text: string): string {
  const summaryMatch = text.match(/Summary:(.*?)(?=\n\n|$)/s)
  return summaryMatch ? summaryMatch[1].trim() : text.split("\n\n")[0]
}

/**
 * Extracts key points from the AI response
 * @param text The AI response text
 * @returns Array of key points
 */
function extractKeyPoints(text: string): string[] {
  const keyPointsMatch = text.match(/Key Points:(.*?)(?=\n\n|$)/s)
  if (!keyPointsMatch) return []

  return keyPointsMatch[1]
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
}

/**
 * Extracts sentiment from the AI response
 * @param text The AI response text
 * @returns The extracted sentiment
 */
function extractSentiment(text: string): string {
  const sentimentMatch = text.match(/Sentiment:(.*?)(?=\n|$)/)
  return sentimentMatch ? sentimentMatch[1].trim() : "neutral"
}

/**
 * Extracts topics from the AI response
 * @param text The AI response text
 * @returns Array of topics
 */
function extractTopics(text: string): string[] {
  const topicsMatch = text.match(/Topics?:(.*?)(?=\n\n|$)/s)
  if (!topicsMatch) return []

  return topicsMatch[1]
    .split(/[,\n]/)
    .map((topic) => topic.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean)
}

