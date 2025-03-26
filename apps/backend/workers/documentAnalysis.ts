import type { Job } from "bull"
import OpenAI from "openai"
import { prisma } from "../../../../archive13628-pm/apps/backend/docs/prisma"
import type { DocumentAnalysisTask } from "../queue"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function processDocumentAnalysis(job: Job<DocumentAnalysisTask>) {
  const { documentId, userId } = job.data

  // 1. Fetch document content
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  })

  if (!document) {
    throw new Error(`Document ${documentId} not found`)
  }

  // 2. Analyze document using AI
  const analysis = await analyzeDocument(document.content)

  // 3. Save analysis results
  await prisma.documentAnalysis.create({
    data: {
      documentId,
      userId,
      summary: analysis.summary,
      keyPoints: analysis.keyPoints,
      sentiment: analysis.sentiment,
      topics: analysis.topics,
      createdAt: new Date(),
    },
  })

  // 4. Update document status
  await prisma.document.update({
    where: { id: documentId },
    data: { analysisStatus: "completed" },
  })

  return analysis
}

async function analyzeDocument(content: string) {
  // Split content into chunks if it's too long
  const chunks = splitIntoChunks(content, 2000)

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an expert document analyzer. Analyze the following text and provide a summary, key points, sentiment, and main topics.",
          },
          {
            role: "user",
            content: chunk,
          },
        ],
      })

      return completion.choices[0]?.message?.content
    }),
  )

  // Combine and structure the results
  return {
    summary: extractSummary(results),
    keyPoints: extractKeyPoints(results.map((r) => r ?? undefined)),
    sentiment: analyzeSentiment(results.map((r) => r ?? undefined)),
    topics: extractTopics(results.map((r) => r ?? undefined)),
  }
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = []
  let current = ""

  text.split(".").forEach((sentence) => {
    if ((current + sentence).length > maxLength) {
      chunks.push(current)
      current = sentence
    } else {
      current += sentence
    }
  })

  if (current) chunks.push(current)
  return chunks
}

function extractSummary(results: (string | undefined | null)[]): string {
  // Combine and summarize all chunk analyses
  return results.filter(Boolean).join(" ")
}

function extractKeyPoints(results: (string | undefined)[]): string[] {
  // Extract and deduplicate key points
  const points = new Set<string>()
  results.forEach((result) => {
    if (result) {
      const keyPointsMatch = result.match(/Key Points?:(.*?)(?=\n|$)/s)
      if (keyPointsMatch) {
        keyPointsMatch[1].split("-").forEach((point) => {
          const trimmed = point.trim()
          if (trimmed) points.add(trimmed)
        })
      }
    }
  })
  return Array.from(points)
}

function analyzeSentiment(results: (string | undefined)[]): string {
  // Aggregate sentiment analysis
  const sentiments = results
    .filter(Boolean)
    .map((result) => {
      const sentimentMatch = result?.match(/Sentiment:(.*?)(?=\n|$)/)
      return sentimentMatch ? sentimentMatch[1].trim().toLowerCase() : null
    })
    .filter(Boolean)

  const sentimentCounts = sentiments.reduce(
    (acc, sentiment) => {
      if (sentiment) acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(sentimentCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral"
}

function extractTopics(results: (string | undefined)[]): string[] {
  // Extract and deduplicate topics
  const topics = new Set<string>()
  results.forEach((result) => {
    if (result) {
      const topicsMatch = result.match(/Topics?:(.*?)(?=\n|$)/s)
      if (topicsMatch) {
        topicsMatch[1].split(",").forEach((topic) => {
          const trimmed = topic.trim()
          if (trimmed) topics.add(trimmed)
        })
      }
    }
  })
  return Array.from(topics)
}

