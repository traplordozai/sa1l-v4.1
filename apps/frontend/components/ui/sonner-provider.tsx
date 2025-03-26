"use client"

import { Toaster as SonnerToaster } from "sonner"

export function SonnerProvider() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group border-border bg-background text-foreground",
          title: "text-foreground font-medium",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          error: "border-destructive bg-destructive/10 text-destructive",
          success: "border-green-500 bg-green-500/10 text-green-500",
          warning: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
          info: "border-blue-500 bg-blue-500/10 text-blue-500",
        },
      }}
    />
  )
}

