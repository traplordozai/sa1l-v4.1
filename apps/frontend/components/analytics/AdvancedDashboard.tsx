"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Clock, Users, FileText, ArrowUpRight, ArrowDownRight, Activity, AlertCircle } from "lucide-react"
import { useMediaQuery } from "@/hooks/utils/useMediaQuery"
import NaturalLanguageSearch from "../shared/NaturalLanguageSearch"

// Sample data - in a real app, this would come from your API
const activityData = [
  { name: "Jan", users: 400, sessions: 240, documents: 180 },
  { name: "Feb", users: 300, sessions: 198, documents: 230 },
  { name: "Mar", users: 200, sessions: 980, documents: 290 },
  { name: "Apr", users: 278, sessions: 390, documents: 320 },
  { name: "May", users: 189, sessions: 480, documents: 210 },
  { name: "Jun", users: 239, sessions: 380, documents: 250 },
  { name: "Jul", users: 349, sessions: 430, documents: 410 },
  { name: "Aug", users: 430, sessions: 380, documents: 390 },
  { name: "Sep", users: 500, sessions: 530, documents: 410 },
]

const userTypeData = [
  { name: "Students", value: 540 },
  { name: "Faculty", value: 120 },
  { name: "Staff", value: 86 },
  { name: "Guests", value: 42 },
]

const documentStatusData = [
  { name: "Draft", value: 120 },
  { name: "Submitted", value: 240 },
  { name: "Approved", value: 180 },
  { name: "Rejected", value: 60 },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"]

interface Filter {
  field: string
  operator: string
  value: string | number | boolean
}

interface KPICardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
  error?: string
}

const KPICard = ({ title, value, description, icon, trend, isLoading, error }: KPICardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-full bg-gray-100 p-1.5 text-gray-500">{icon}</div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
      ) : error ? (
        <div className="flex items-center text-sm text-red-500">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-gray-500">{description}</p>
          {trend && (
            <div className="mt-2 flex items-center text-xs">
              {trend.isPositive ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span className={trend.isPositive ? "text-green-500" : "text-red-500"}>
                {trend.value}% from last period
              </span>
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
)

/**
 * Advanced analytics dashboard with interactive charts and KPIs
 */
export default function AdvancedDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("7d")
  const [filters, setFilters] = useState<Filter[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    activity: activityData,
    userTypes: userTypeData,
    documentStatus: documentStatusData,
  }), [])

  // In a real app, you would fetch data based on the selected time range
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(undefined)
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In a real app, you would update the data with the API response
        console.log(`Fetching data for time range: ${timeRange}`)
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.")
        console.error("Error fetching dashboard data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  // Handle natural language search
  const handleSearch = (parsedFilters: Filter[]) => {
    setFilters(parsedFilters)
    // In a real app, you would apply these filters to your data
    console.log("Applied filters:", parsedFilters)
  }

  // Apply filters to chart data
  const filteredChartData = useMemo(() => {
    if (filters.length === 0) return chartData

    // In a real app, you would apply the filters to the actual data
    // This is just a placeholder to show the filtering logic
    return {
      activity: chartData.activity.filter(item => {
        return filters.every(filter => {
          const value = item[filter.field as keyof typeof item]
          switch (filter.operator) {
            case "equals":
              return value === filter.value
            case "greaterThan":
              return value > filter.value
            case "lessThan":
              return value < filter.value
            default:
              return true
          }
        })
      }),
      userTypes: chartData.userTypes,
      documentStatus: chartData.documentStatus,
    }
  }, [chartData, filters])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-gray-500">Comprehensive insights into your application&apos;s performance and user activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-westernPurple focus:outline-none focus:ring-1 focus:ring-westernPurple"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="w-full">
        <NaturalLanguageSearch
          onSearch={handleSearch}
          placeholder="Search analytics data..."
          examples={[
            "users where role = student",
            "documents created after 2023-01-01",
            "sessions with duration > 30 minutes",
          ]}
          className="mb-6"
        />
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Users"
              value="1,234"
              description="Active users in the system"
              icon={<Users />}
              trend={{ value: 12, isPositive: true }}
              isLoading={isLoading}
              error={error}
            />
            <KPICard
              title="Active Sessions"
              value="867"
              description="Current active sessions"
              icon={<Activity />}
              trend={{ value: 8, isPositive: true }}
              isLoading={isLoading}
              error={error}
            />
            <KPICard
              title="Documents Created"
              value="432"
              description="Documents created this period"
              icon={<FileText />}
              trend={{ value: 5, isPositive: false }}
              isLoading={isLoading}
              error={error}
            />
            <KPICard
              title="Avg. Session Duration"
              value="24m 32s"
              description="Average time spent per session"
              icon={<Clock />}
              trend={{ value: 3, isPositive: true }}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Main Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>User activity and content creation over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={filteredChartData.activity}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDocuments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#82ca9d"
                      fillOpacity={1}
                      fill="url(#colorSessions)"
                    />
                    <Area
                      type="monotone"
                      dataKey="documents"
                      stroke="#ffc658"
                      fillOpacity={1}
                      fill="url(#colorDocuments)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of users by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredChartData.userTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {filteredChartData.userTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Status</CardTitle>
                <CardDescription>Current status of all documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredChartData.documentStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8">
                        {filteredChartData.documentStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Creation</CardTitle>
              <CardDescription>Documents created over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="documents" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Response times and error rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { name: "Jan", responseTime: 120, errorRate: 2 },
                      { name: "Feb", responseTime: 132, errorRate: 3 },
                      { name: "Mar", responseTime: 101, errorRate: 1 },
                      { name: "Apr", responseTime: 134, errorRate: 4 },
                      { name: "May", responseTime: 90, errorRate: 2 },
                      { name: "Jun", responseTime: 85, errorRate: 1 },
                      { name: "Jul", responseTime: 120, errorRate: 3 },
                      { name: "Aug", responseTime: 110, errorRate: 2 },
                      { name: "Sep", responseTime: 95, errorRate: 1 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="responseTime" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="errorRate" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

