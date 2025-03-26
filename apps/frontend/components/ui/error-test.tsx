"use client"

import { useState } from "react"
import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ErrorTest() {
  const [errorType, setErrorType] = useState<string>("none")

  const triggerError = (type: string) => {
    setErrorType(type)

    switch (type) {
      case "js":
        // Trigger a JavaScript error
        throw new Error("This is a test JavaScript error")

      case "promise":
        // Trigger an unhandled promise rejection
        Promise.reject(new Error("This is a test Promise rejection"))
        break

      case "api":
        // Trigger an API error
        fetch("/api/example?fail=true")
          .then((res) => res.json())
          .then((data) => console.log(data))
          .catch((err) => console.error("API Error:", err))
        break

      case "sentry":
        // Manually report to Sentry
        Sentry.captureMessage("This is a test message sent to Sentry")
        Sentry.captureException(new Error("This is a test exception sent to Sentry"))
        break

      default:
        setErrorType("none")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Tracking Test</CardTitle>
        <CardDescription>Test different types of error tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => triggerError("js")} variant="destructive">
            Trigger JS Error
          </Button>
          <Button onClick={() => triggerError("promise")} variant="destructive">
            Trigger Promise Error
          </Button>
          <Button onClick={() => triggerError("api")} variant="destructive">
            Trigger API Error
          </Button>
          <Button onClick={() => triggerError("sentry")} variant="destructive">
            Send to Sentry
          </Button>
        </div>

        {errorType !== "none" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              {errorType === "sentry"
                ? "Error report sent to Sentry!"
                : "Error triggered! Check the console and Sentry dashboard."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

