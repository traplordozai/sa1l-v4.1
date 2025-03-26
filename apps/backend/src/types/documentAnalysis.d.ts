interface DocumentAnalysisResult {
  status: "success" | "error"
  documentId: string
  userId: string
  analysis: {
    sentiment?: number
    topics?: string[]
    entities?: Array<{
      name: string
      type: string
      confidence: number
    }>
    summary?: string
    metadata?: Record<string, unknown>
  }
  error?: {
    message: string
    code: string
    details?: Record<string, unknown>
  }
}

declare module "../../services/documentAnalysis" {
  export function analyzeDocument(
    documentId: string,
    userId: string
  ): Promise<DocumentAnalysisResult>
} 