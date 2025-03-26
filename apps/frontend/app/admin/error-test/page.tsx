import { ErrorTest } from "@/components/error-test"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Error Tracking Test | Admin",
  description: "Test error tracking and monitoring",
}

export default function ErrorTestPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Error Tracking Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ErrorTest />

        <Card>
          <CardHeader>
            <CardTitle>Error Tracking Information</CardTitle>
            <CardDescription>How error tracking works in this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Multi-layered Error Tracking</h3>
              <p className="text-sm text-gray-600">This application uses a multi-layered approach to error tracking:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 mt-2">
                <li>Custom Winston logger for local logs</li>
                <li>Sentry for error tracking and performance monitoring</li>
                <li>Email alerts for critical errors</li>
                <li>Database storage for log analysis</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Error Boundary</h3>
              <p className="text-sm text-gray-600">
                React Error Boundaries catch JavaScript errors anywhere in the component tree and display a fallback UI
                instead of crashing the whole application.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Sentry Integration</h3>
              <p className="text-sm text-gray-600">
                Sentry provides real-time error tracking, giving you insight into production deployments and information
                to reproduce and fix crashes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

