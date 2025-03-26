import OpenAI from "openai"
import { logger } from "../lib/logger"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface DocumentAnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment: "positive" | "neutral" | "negative"
  topics: string[]
  entities: Array<{ name: string; type: string }>
}

export async function analyzeDocument(documentText: string): Promise<DocumentAnalysisResult> {
  try {
    logger.info("Analyzing document with OpenAI")

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a document analysis assistant. Analyze the following document and provide:
          1. A concise summary (max 3 sentences)
          2. 3-5 key points
          3. Overall sentiment (positive, neutral, or negative)
          4. Main topics discussed
          5. Key entities mentioned (people, organizations, locations, etc.)
          
          Format your response as JSON with the following structure:
          {
            "summary": "string",
            "keyPoints": ["string"],
            "sentiment": "positive|neutral|negative",
            "topics": ["string"],
            "entities": [{"name": "string", "type": "string"}]
          }`,
        },
        {
          role: "user",
          content: documentText,
        },
      ],
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(response.choices[0].message.content)
    logger.info("Document analysis completed successfully")

    return result as DocumentAnalysisResult
  } catch (error) {
    logger.error("Error analyzing document with OpenAI:", error)
    throw new Error(`Failed to analyze document: ${error.message}`)
  }
}

export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
): Promise<string> {
  try {
    logger.info("Generating chat response with OpenAI")

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    })

    return response.choices[0].message.content
  } catch (error) {
    logger.error("Error generating chat response with OpenAI:", error)
    throw new Error(`Failed to generate chat response: ${error.message}`)
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    logger.info("Generating embedding with OpenAI")

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    logger.error("Error generating embedding with OpenAI:", error)
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

