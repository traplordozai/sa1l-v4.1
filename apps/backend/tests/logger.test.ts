import { logger, createContextLogger } from "../lib/logger"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

// Mock the transport to capture logs
const mockTransport = {
  logs: [] as any[],
  log: jest.fn((info: any, callback: () => void) => {
    mockTransport.logs.push(info)
    callback()
  }),
}

// Mock winston
jest.mock("winston", () => {
  const originalModule = jest.requireActual("winston")
  return {
    ...originalModule,
    createLogger: jest.fn(() => ({
      error: jest.fn((message, meta) => mockTransport.log({ level: "error", message, ...meta })),
      warn: jest.fn((message, meta) => mockTransport.log({ level: "warn", message, ...meta })),
      info: jest.fn((message, meta) => mockTransport.log({ level: "info", message, ...meta })),
      http: jest.fn((message, meta) => mockTransport.log({ level: "http", message, ...meta })),
      debug: jest.fn((message, meta) => mockTransport.log({ level: "debug", message, ...meta })),
      child: jest.fn((meta) => ({
        error: jest.fn((message, extraMeta) => mockTransport.log({ level: "error", message, ...meta, ...extraMeta })),
        warn: jest.fn((message, extraMeta) => mockTransport.log({ level: "warn", message, ...meta, ...extraMeta })),
        info: jest.fn((message, extraMeta) => mockTransport.log({ level: "info", message, ...meta, ...extraMeta })),
        http: jest.fn((message, extraMeta) => mockTransport.log({ level: "http", message, ...meta, ...extraMeta })),
        debug: jest.fn((message, extraMeta) => mockTransport.log({ level: "debug", message, ...meta, ...extraMeta })),
      })),
    })),
  }
})

describe("Logger", () => {
  beforeEach(() => {
    mockTransport.logs = []
    jest.clearAllMocks()
  })

  test("logs messages at different levels", () => {
    logger.error("Error message")
    logger.warn("Warning message")
    logger.info("Info message")
    logger.http("HTTP message")
    logger.debug("Debug message")

    expect(mockTransport.logs).toHaveLength(5)
    expect(mockTransport.logs[0].level).toBe("error")
    expect(mockTransport.logs[0].message).toBe("Error message")
    expect(mockTransport.logs[1].level).toBe("warn")
    expect(mockTransport.logs[2].level).toBe("info")
    expect(mockTransport.logs[3].level).toBe("http")
    expect(mockTransport.logs[4].level).toBe("debug")
  })

  test("includes metadata in logs", () => {
    logger.info("Message with metadata", { userId: "123", action: "test" })

    expect(mockTransport.logs).toHaveLength(1)
    expect(mockTransport.logs[0].userId).toBe("123")
    expect(mockTransport.logs[0].action).toBe("test")
  })

  test("creates context-aware loggers", () => {
    const userLogger = createContextLogger({ userId: "user-123", sessionId: "session-456" })
    userLogger.info("User action", { action: "login" })

    expect(mockTransport.logs).toHaveLength(1)
    expect(mockTransport.logs[0].userId).toBe("user-123")
    expect(mockTransport.logs[0].sessionId).toBe("session-456")
    expect(mockTransport.logs[0].action).toBe("login")
  })

  test("logs errors with stack traces", () => {
    const error = new Error("Test error")
    logger.error("Error occurred", { error })

    expect(mockTransport.logs).toHaveLength(1)
    expect(mockTransport.logs[0].error).toBeDefined()
    expect(mockTransport.logs[0].error.message).toBe("Test error")
    expect(mockTransport.logs[0].error.stack).toBeDefined()
  })
})

