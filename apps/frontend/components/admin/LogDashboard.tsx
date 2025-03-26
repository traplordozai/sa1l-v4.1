"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Search,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Progress } from "@/components/ui/progress"

// Types
interface LogEntry {
  id: string
  timestamp: string
  level: "error" | "warn" | "info" | "http" | "debug"
  message: string
  context?: Record<string, any>
  userId?: string
  userAgent?: string
  ipAddress?: string
  service?: string
}

interface LogStats {
  totalLogs: number
  errorCount: number
  warnCount: number
  infoCount: number
  httpCount: number
  debugCount: number
  topErrors: Array<{ message: string; count: number }>
  logsByHour: Array<{ hour: string; count: number }>
  logsByService: Array<{ service: string; count: number }>
  logsByEndpoint: Array<{ endpoint: string; count: number; avgResponseTime: number }>
  userActivity: Array<{ userId: string; count: number }>
  performanceMetrics: {
    avgResponseTime: number
    p95ResponseTime: number
    p99ResponseTime: number
    errorRate: number
    successRate: number
  }
  anomalies: Array<{
    timestamp: string
    metric: string
    value: number
    expected: number
    deviation: number
  }>
  resourceUsage: Array<{
    timestamp: string
    cpu: number
    memory: number
    diskIO: number
  }>
}

// Mock data for demonstration
const COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#8884D8"]

// Component
export default function LogDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("24h")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 24 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [selectedService, setSelectedService] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [sortColumn, setSortColumn] = useState<string>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [anomalyThreshold, setAnomalyThreshold] = useState(2.0) // Standard deviations

  // Fetch logs and stats
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, these would be API calls
      const logsResponse = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeRange,
          searchQuery,
          dateRange,
          service: selectedService !== "all" ? selectedService : undefined,
          level: selectedLevel !== "all" ? selectedLevel : undefined,
          sortColumn,
          sortDirection,
          page,
          pageSize,
        }),
      })

      const statsResponse = await fetch("/api/logs/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeRange,
          dateRange,
          anomalyThreshold,
        }),
      })

      if (logsResponse.ok && statsResponse.ok) {
        const logsData = await logsResponse.json()
        const statsData = await statsResponse.json()
        setLogs(logsData)
        setStats(statsData)
      } else {
        console.error("Failed to fetch logs data")
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    fetchData()

    // For demo purposes, we'll use mock data
    // In a real implementation, remove this and use the API response
    setStats({
      totalLogs: 12543,
      errorCount: 342,
      warnCount: 1256,
      infoCount: 8765,
      httpCount: 2100,
      debugCount: 80,
      topErrors: [
        { message: "Failed to connect to database", count: 87 },
        { message: "Authentication failed", count: 65 },
        { message: "API rate limit exceeded", count: 43 },
        { message: "Invalid request parameters", count: 38 },
        { message: "File not found", count: 29 },
      ],
      logsByHour: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        count: Math.floor(Math.random() * 500) + 100,
      })),
      logsByService: [
        { service: "api", count: 5432 },
        { service: "auth", count: 3210 },
        { service: "database", count: 2100 },
        { service: "storage", count: 1432 },
        { service: "queue", count: 369 },
      ],
      logsByEndpoint: [
        { endpoint: "/api/users", count: 3245, avgResponseTime: 120 },
        { endpoint: "/api/documents", count: 2876, avgResponseTime: 180 },
        { endpoint: "/api/auth/login", count: 1543, avgResponseTime: 90 },
        { endpoint: "/api/search", count: 1234, avgResponseTime: 250 },
        { endpoint: "/api/analytics", count: 987, avgResponseTime: 320 },
      ],
      userActivity: [
        { userId: "user-123", count: 543 },
        { userId: "user-456", count: 432 },
        { userId: "user-789", count: 321 },
        { userId: "user-101", count: 234 },
        { userId: "user-202", count: 198 },
      ],
      performanceMetrics: {
        avgResponseTime: 145,
        p95ResponseTime: 320,
        p99ResponseTime: 450,
        errorRate: 2.7,
        successRate: 97.3,
      },
      anomalies: [
        { timestamp: "2023-06-15T14:30:00Z", metric: "response_time", value: 450, expected: 150, deviation: 3.2 },
        { timestamp: "2023-06-15T15:45:00Z", metric: "error_rate", value: 12, expected: 3, deviation: 3.0 },
        { timestamp: "2023-06-15T18:20:00Z", metric: "cpu_usage", value: 92, expected: 60, deviation: 2.8 },
        { timestamp: "2023-06-16T09:15:00Z", metric: "memory_usage", value: 85, expected: 50, deviation: 2.5 },
      ],
      resourceUsage: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 40,
        diskIO: Math.floor(Math.random() * 20) + 10,
      })),
    })

    // Mock logs data
    const mockLogs: LogEntry[] = Array.from({ length: 100 }, (_, i) => {
      const levels = ["error", "warn", "info", "http", "debug"] as const
      const level = levels[Math.floor(Math.random() * levels.length)]

      return {
        id: `log-${i}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
        level,
        message: `Sample ${level} message ${i}`,
        userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
        service: ["api", "auth", "database", "storage", "queue"][Math.floor(Math.random() * 5)],
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      }
    })

    setLogs(mockLogs)
  }, [])

  // Handle refresh
  const handleRefresh = () => {
    fetchData()
  }

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    // In a real implementation, this would trigger a new data fetch
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchData()
  }

  // Handle export
  const handleExport = () => {
    // In a real implementation, this would trigger a download
    alert("Exporting logs...")
  }

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  // Render level badge
  const renderLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Error
          </Badge>
        )
      case "warn":
        return (
          <Badge variant="warning" className="flex items-center gap-1 bg-yellow-500">
            <AlertTriangle className="h-3 w-3" /> Warning
          </Badge>
        )
      case "info":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Info className="h-3 w-3" /> Info
          </Badge>
        )
      case "http":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Bug className="h-3 w-3" /> HTTP
          </Badge>
        )
      case "debug":
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-gray-500">
            Debug
          </Badge>
        )
      default:
        return <Badge>{level}</Badge>
    }
  }

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  // Toggle log details
  const toggleLogDetails = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id)
  }

  // Get expanded log
  const getExpandedLog = () => {
    return logs.find((log) => log.id === expandedLogId)
  }

  // Calculate error rate trend
  const errorRateTrend = useMemo(() => {
    if (!stats) return 0
    // In a real implementation, this would be calculated from historical data
    return Math.random() > 0.5 ? 0.5 : -0.3
  }, [stats])

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logs Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Logs</CardTitle>
                <CardDescription>All log entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalLogs.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Errors</CardTitle>
                <CardDescription>Critical issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-red-500">{stats?.errorCount.toLocaleString()}</div>
                  <div className="ml-2 text-sm">
                    {errorRateTrend > 0 ? (
                      <span className="text-red-500 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />+{(errorRateTrend * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-green-500 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                        {(errorRateTrend * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>Request success percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  {stats?.performanceMetrics.successRate.toFixed(1)}%
                </div>
                <Progress value={stats?.performanceMetrics.successRate || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Logs by Time</CardTitle>
                <CardDescription>Log volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.logsByHour} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Logs by Level</CardTitle>
                <CardDescription>Distribution by severity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Error", value: stats?.errorCount || 0 },
                          { name: "Warning", value: stats?.warnCount || 0 },
                          { name: "Info", value: stats?.infoCount || 0 },
                          { name: "HTTP", value: stats?.httpCount || 0 },
                          { name: "Debug", value: stats?.debugCount || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Errors</CardTitle>
              <CardDescription>Most frequent error messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats?.topErrors}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="message" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Avg Response Time</CardTitle>
                <CardDescription>Average API response time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.performanceMetrics.avgResponseTime}ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>P95 Response Time</CardTitle>
                <CardDescription>95th percentile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.performanceMetrics.p95ResponseTime}ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>P99 Response Time</CardTitle>
                <CardDescription>99th percentile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.performanceMetrics.p99ResponseTime}ms</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>Response times by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.logsByEndpoint} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="endpoint" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Request Count" />
                    <Bar yAxisId="right" dataKey="avgResponseTime" fill="#82ca9d" name="Avg Response Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Detected Anomalies</CardTitle>
                  <CardDescription>Unusual patterns in logs</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Threshold:</span>
                  <Select
                    value={anomalyThreshold.toString()}
                    onValueChange={(value) => setAnomalyThreshold(Number.parseFloat(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.5">1.5 σ (Low)</SelectItem>
                      <SelectItem value="2.0">2.0 σ (Medium)</SelectItem>
                      <SelectItem value="3.0">3.0 σ (High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Deviation (σ)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.anomalies.map((anomaly, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatTimestamp(anomaly.timestamp)}</TableCell>
                        <TableCell>{anomaly.metric.replace("_", " ")}</TableCell>
                        <TableCell className="font-bold">{anomaly.value}</TableCell>
                        <TableCell>{anomaly.expected}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{anomaly.deviation.toFixed(1)}σ</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anomaly Visualization</CardTitle>
              <CardDescription>Detected anomalies in context</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="value" name="value" />
                    <YAxis type="number" dataKey="expected" name="expected" />
                    <ZAxis type="number" dataKey="deviation" range={[100, 1000]} name="deviation" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter name="Anomalies" data={stats?.anomalies} fill="#FF8042" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>System resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.resourceUsage} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()} />
                    <Legend />
                    <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU (%)" />
                    <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory (%)" />
                    <Line type="monotone" dataKey="diskIO" stroke="#ffc658" name="Disk I/O (MB/s)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Log Explorer</CardTitle>
              <CardDescription>Search and filter logs</CardDescription>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-auto"
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>

              {timeRange === "custom" && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("timestamp")}>
                    <div className="flex items-center">Timestamp {renderSortIndicator("timestamp")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("level")}>
                    <div className="flex items-center">Level {renderSortIndicator("level")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("message")}>
                    <div className="flex items-center">Message {renderSortIndicator("message")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("service")}>
                    <div className="flex items-center">Service {renderSortIndicator("service")}</div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("userId")}>
                    <div className="flex items-center">User ID {renderSortIndicator("userId")}</div>
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow
                      className={expandedLogId === log.id ? "bg-muted/50" : ""}
                      onClick={() => toggleLogDetails(log.id)}
                    >
                      <TableCell className="font-mono text-xs">{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>{renderLevelBadge(log.level)}</TableCell>
                      <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      <TableCell>{log.service}</TableCell>
                      <TableCell>{log.userId || "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          {expandedLogId === log.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedLogId === log.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/50 p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Full Message</h4>
                              <p className="text-sm">{log.message}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Context</h4>
                              <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                                {JSON.stringify(log.context || {}, null, 2)}
                              </pre>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold mb-1">IP Address</h4>
                                <p className="text-sm">{log.ipAddress || "-"}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold mb-1">User Agent</h4>
                                <p className="text-sm">{log.userAgent || "-"}</p>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

