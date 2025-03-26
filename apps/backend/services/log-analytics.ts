import { prisma } from "../db/prisma"
import { logger } from "../lib/logger"
import { alertWarning } from "./alert-service"

// Anomaly detection threshold (standard deviations)
const DEFAULT_ANOMALY_THRESHOLD = 2.0

// Analytics service
export class LogAnalyticsService {
  // Detect anomalies in logs
  static async detectAnomalies(timeWindowHours = 24, threshold = DEFAULT_ANOMALY_THRESHOLD) {
    try {
      const startTime = new Date()
      logger.info("Starting anomaly detection", { timeWindowHours, threshold })

      // Calculate time window
      const timeWindow = new Date()
      timeWindow.setHours(timeWindow.getHours() - timeWindowHours)

      // Get metrics to analyze
      const metrics = await this.getMetricsForAnalysis(timeWindow)

      // Detect anomalies
      const anomalies = []

      // Analyze error rate
      const errorRateAnomaly = await this.analyzeErrorRate(timeWindow, threshold)
      if (errorRateAnomaly) {
        anomalies.push(errorRateAnomaly)

        // Alert on error rate anomalies
        await alertWarning(
          `Anomaly detected: Error rate is ${errorRateAnomaly.value.toFixed(2)}%, expected around ${errorRateAnomaly.expected.toFixed(2)}%`,
          "anomaly-detection",
          errorRateAnomaly,
        )
      }

      // Analyze response times
      const responseTimeAnomaly = await this.analyzeResponseTimes(timeWindow, threshold)
      if (responseTimeAnomaly) {
        anomalies.push(responseTimeAnomaly)

        // Alert on response time anomalies
        await alertWarning(
          `Anomaly detected: Response time is ${responseTimeAnomaly.value.toFixed(0)}ms, expected around ${responseTimeAnomaly.expected.toFixed(0)}ms`,
          "anomaly-detection",
          responseTimeAnomaly,
        )
      }

      // Analyze request volume
      const requestVolumeAnomaly = await this.analyzeRequestVolume(timeWindow, threshold)
      if (requestVolumeAnomaly) {
        anomalies.push(requestVolumeAnomaly)

        // Alert on request volume anomalies
        await alertWarning(
          `Anomaly detected: Request volume is ${requestVolumeAnomaly.value} requests, expected around ${requestVolumeAnomaly.expected} requests`,
          "anomaly-detection",
          requestVolumeAnomaly,
        )
      }

      // Log results
      logger.info("Anomaly detection completed", {
        anomaliesFound: anomalies.length,
        executionTimeMs: Date.now() - startTime.getTime(),
      })

      return anomalies
    } catch (error) {
      logger.error("Error in anomaly detection", { error })
      throw error
    }
  }

  // Get metrics for analysis
  private static async getMetricsForAnalysis(timeWindow: Date) {
    // Get error rate over time
    const errorRates = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(CASE WHEN level = 'error' THEN 1 END) * 100.0 / COUNT(*) as error_rate,
        COUNT(*) as total_requests
      FROM "Log"
      WHERE timestamp >= ${timeWindow}
      GROUP BY DATE_TRUNC('hour', timestamp)
      ORDER BY hour
    `

    // Get response times over time
    const responseTimes = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        AVG(CAST(context->>'responseTime' as FLOAT)) as avg_response_time
      FROM "Log"
      WHERE 
        timestamp >= ${timeWindow}
        AND context->>'responseTime' IS NOT NULL
      GROUP BY DATE_TRUNC('hour', timestamp)
      ORDER BY hour
    `

    return {
      errorRates,
      responseTimes,
    }
  }

  // Analyze error rate for anomalies
  private static async analyzeErrorRate(timeWindow: Date, threshold: number) {
    // Get historical error rate data
    const historicalErrorRates = await prisma.$queryRaw`
      SELECT 
        AVG(CAST(context->>'errorRate' as FLOAT)) as avg_error_rate,
        STDDEV(CAST(context->>'errorRate' as FLOAT)) as stddev_error_rate
      FROM "LogMetric"
      WHERE 
        timestamp < ${timeWindow}
        AND name = 'error_rate'
    `

    // Get current error rate
    const currentErrorRate = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN level = 'error' THEN 1 END) * 100.0 / COUNT(*) as error_rate
      FROM "Log"
      WHERE timestamp >= ${timeWindow}
    `

    // Check if we have enough historical data
    if (!historicalErrorRates[0].avg_error_rate || !historicalErrorRates[0].stddev_error_rate) {
      logger.info("Not enough historical data for error rate anomaly detection")
      return null
    }

    const avgErrorRate = Number.parseFloat(historicalErrorRates[0].avg_error_rate)
    const stdDevErrorRate = Number.parseFloat(historicalErrorRates[0].stddev_error_rate)
    const currentRate = Number.parseFloat(currentErrorRate[0].error_rate)

    // Calculate deviation
    const deviation = Math.abs(currentRate - avgErrorRate) / stdDevErrorRate

    // Check if it's an anomaly
    if (deviation >= threshold) {
      return {
        timestamp: new Date().toISOString(),
        metric: "error_rate",
        value: currentRate,
        expected: avgErrorRate,
        deviation,
        threshold,
      }
    }

    return null
  }

  // Analyze response times for anomalies
  private static async analyzeResponseTimes(timeWindow: Date, threshold: number) {
    // Get historical response time data
    const historicalResponseTimes = await prisma.$queryRaw`
      SELECT 
        AVG(value) as avg_response_time,
        STDDEV(value) as stddev_response_time
      FROM "LogMetric"
      WHERE 
        timestamp < ${timeWindow}
        AND name = 'response_time'
    `

    // Get current response time
    const currentResponseTime = await prisma.$queryRaw`
      SELECT 
        AVG(CAST(context->>'responseTime' as FLOAT)) as avg_response_time
      FROM "Log"
      WHERE 
        timestamp >= ${timeWindow}
        AND context->>'responseTime' IS NOT NULL
    `

    // Check if we have enough historical data
    if (!historicalResponseTimes[0].avg_response_time || !historicalResponseTimes[0].stddev_response_time) {
      logger.info("Not enough historical data for response time anomaly detection")
      return null
    }

    const avgResponseTime = Number.parseFloat(historicalResponseTimes[0].avg_response_time)
    const stdDevResponseTime = Number.parseFloat(historicalResponseTimes[0].stddev_response_time)
    const currentTime = Number.parseFloat(currentResponseTime[0].avg_response_time)

    // Calculate deviation
    const deviation = Math.abs(currentTime - avgResponseTime) / stdDevResponseTime

    // Check if it's an anomaly
    if (deviation >= threshold) {
      return {
        timestamp: new Date().toISOString(),
        metric: "response_time",
        value: currentTime,
        expected: avgResponseTime,
        deviation,
        threshold,
      }
    }

    return null
  }

  // Analyze request volume for anomalies
  private static async analyzeRequestVolume(timeWindow: Date, threshold: number) {
    // Get historical request volume data
    const historicalVolume = await prisma.$queryRaw`
      SELECT 
        AVG(value) as avg_volume,
        STDDEV(value) as stddev_volume
      FROM "LogMetric"
      WHERE 
        timestamp < ${timeWindow}
        AND name = 'request_volume'
    `

    // Get current request volume
    const currentVolume = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as request_count
      FROM "Log"
      WHERE timestamp >= ${timeWindow}
    `

    // Check if we have enough historical data
    if (!historicalVolume[0].avg_volume || !historicalVolume[0].stddev_volume) {
      logger.info("Not enough historical data for request volume anomaly detection")
      return null
    }

    const avgVolume = Number.parseFloat(historicalVolume[0].avg_volume)
    const stdDevVolume = Number.parseFloat(historicalVolume[0].stddev_volume)
    const currentCount = Number.parseInt(currentVolume[0].request_count)

    // Calculate deviation
    const deviation = Math.abs(currentCount - avgVolume) / stdDevVolume

    // Check if it's an anomaly
    if (deviation >= threshold) {
      return {
        timestamp: new Date().toISOString(),
        metric: "request_volume",
        value: currentCount,
        expected: avgVolume,
        deviation,
        threshold,
      }
    }

    return null
  }

  // Generate performance report
  static async generatePerformanceReport(timeWindowHours = 24) {
    try {
      const startTime = new Date()
      logger.info("Generating performance report", { timeWindowHours })

      // Calculate time window
      const timeWindow = new Date()
      timeWindow.setHours(timeWindow.getHours() - timeWindowHours)

      // Get overall stats
      const overallStats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN level = 'error' THEN 1 END) as error_count,
          COUNT(CASE WHEN level = 'error' THEN 1 END) * 100.0 / COUNT(*) as error_rate,
          AVG(CAST(context->>'responseTime' as FLOAT)) as avg_response_time,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY CAST(context->>'responseTime' as FLOAT)) as p95_response_time,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY CAST(context->>'responseTime' as FLOAT)) as p99_response_time
        FROM "Log"
        WHERE 
          timestamp >= ${timeWindow}
          AND context->>'responseTime' IS NOT NULL
      `

      // Get stats by endpoint
      const endpointStats = await prisma.$queryRaw`
        SELECT 
          context->>'endpoint' as endpoint,
          COUNT(*) as request_count,
          COUNT(CASE WHEN level = 'error' THEN 1 END) as error_count,
          COUNT(CASE WHEN level = 'error' THEN 1 END) * 100.0 / COUNT(*) as error_rate,
          AVG(CAST(context->>'responseTime' as FLOAT)) as avg_response_time,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY CAST(context->>'responseTime' as FLOAT)) as p95_response_time
        FROM "Log"
        WHERE 
          timestamp >= ${timeWindow}
          AND context->>'endpoint' IS NOT NULL
          AND context->>'responseTime' IS NOT NULL
        GROUP BY context->>'endpoint'
        ORDER BY request_count DESC
        LIMIT 10
      `

      // Get stats by service
      const serviceStats = await prisma.$queryRaw`
        SELECT 
          service,
          COUNT(*) as request_count,
          COUNT(CASE WHEN level = 'error' THEN 1 END) as error_count,
          COUNT(CASE WHEN level = 'error' THEN 1 END) * 100.0 / COUNT(*) as error_rate
        FROM "Log"
        WHERE 
          timestamp >= ${timeWindow}
          AND service IS NOT NULL
        GROUP BY service
        ORDER BY request_count DESC
      `

      // Log results
      logger.info("Performance report generated", {
        executionTimeMs: Date.now() - startTime.getTime(),
      })

      return {
        overallStats: overallStats[0],
        endpointStats,
        serviceStats,
        generatedAt: new Date().toISOString(),
        timeWindowHours,
      }
    } catch (error) {
      logger.error("Error generating performance report", { error })
      throw error
    }
  }
}

// Schedule the analytics to run periodically
export function scheduleLogAnalytics() {
  // Run anomaly detection every hour
  setInterval(
    async () => {
      try {
        await LogAnalyticsService.detectAnomalies()
      } catch (error) {
        logger.error("Scheduled anomaly detection failed", { error })
      }
    },
    60 * 60 * 1000,
  ) // Every hour

  // Generate performance report daily
  setInterval(
    async () => {
      try {
        await LogAnalyticsService.generatePerformanceReport(24)
      } catch (error) {
        logger.error("Scheduled performance report generation failed", { error })
      }
    },
    24 * 60 * 60 * 1000,
  ) // Every 24 hours

  logger.info("Log analytics scheduled")
}

