import { Redis } from "@upstash/redis"
import { v4 as uuidv4 } from "uuid"
import { logger } from "../lib/logger"

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || "",
})

export interface Job {
  id: string
  type: string
  data: any
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: string
  updatedAt: string
  result?: any
  error?: string
}

export class JobQueue {
  private queueKey: string

  constructor(queueName: string) {
    this.queueKey = `jobqueue:${queueName}`
  }

  /**
   * Add a job to the queue
   */
  async addJob(type: string, data: any): Promise<string> {
    const jobId = uuidv4()
    const job: Job = {
      id: jobId,
      type,
      data,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store job details
    await redis.hset(`${this.queueKey}:jobs`, jobId, JSON.stringify(job))

    // Add to pending queue
    await redis.lpush(`${this.queueKey}:pending`, jobId)

    logger.info("Job added to queue", { jobId, type })
    return jobId
  }

  /**
   * Process the next job in the queue
   */
  async processNextJob(processors: Record<string, (data: any) => Promise<any>>): Promise<boolean> {
    // Move job from pending to processing
    const jobId = await redis.rpoplpush(`${this.queueKey}:pending`, `${this.queueKey}:processing`)

    if (!jobId) return false

    try {
      // Get job details
      const jobJson = await redis.hget(`${this.queueKey}:jobs`, jobId)
      if (!jobJson) {
        throw new Error(`Job ${jobId} not found`)
      }

      const job: Job = JSON.parse(jobJson)
      logger.info("Processing job", { jobId, type: job.type })

      // Find processor
      const processor = processors[job.type]
      if (!processor) {
        throw new Error(`No processor found for job type: ${job.type}`)
      }

      // Process job
      const result = await processor(job.data)

      // Update job status
      const updatedJob: Job = {
        ...job,
        status: "completed",
        updatedAt: new Date().toISOString(),
        result,
      }

      await redis.hset(`${this.queueKey}:jobs`, jobId, JSON.stringify(updatedJob))

      // Move from processing to completed
      await redis.lrem(`${this.queueKey}:processing`, 1, jobId)
      await redis.lpush(`${this.queueKey}:completed`, jobId)

      logger.info("Job completed", { jobId, type: job.type })
      return true
    } catch (error) {
      const err = error as Error
      logger.error("Job processing failed", { jobId, error: err })

      // Get job details
      const jobJson = await redis.hget(`${this.queueKey}:jobs`, jobId)
      if (jobJson) {
        const job: Job = JSON.parse(jobJson)

        // Update job status
        const updatedJob: Job = {
          ...job,
          status: "failed",
          updatedAt: new Date().toISOString(),
          error: err.message,
        }

        await redis.hset(`${this.queueKey}:jobs`, jobId, JSON.stringify(updatedJob))
      }

      // Move from processing to failed
      await redis.lrem(`${this.queueKey}:processing`, 1, jobId)
      await redis.lpush(`${this.queueKey}:failed`, jobId)

      return false
    }
  }

  /**
   * Get job details
   */
  async getJob(jobId: string): Promise<Job | null> {
    const jobJson = await redis.hget(`${this.queueKey}:jobs`, jobId)
    return jobJson ? JSON.parse(jobJson) : null
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const jobJson = await redis.hget(`${this.queueKey}:jobs`, jobId)
    if (!jobJson) return false

    const job: Job = JSON.parse(jobJson)
    if (job.status !== "failed") return false

    // Update job status
    const updatedJob: Job = {
      ...job,
      status: "pending",
      updatedAt: new Date().toISOString(),
      error: undefined,
    }

    await redis.hset(`${this.queueKey}:jobs`, jobId, JSON.stringify(updatedJob))

    // Move from failed to pending
    await redis.lrem(`${this.queueKey}:failed`, 1, jobId)
    await redis.lpush(`${this.queueKey}:pending`, jobId)

    logger.info("Job queued for retry", { jobId, type: job.type })
    return true
  }
}

// Export a default queue instance
export const defaultQueue = new JobQueue("default")