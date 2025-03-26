import { ToastExample } from "@/components/toast-example"

export default function ToastTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Toast Test Page</h1>
      <p className="mb-6 text-muted-foreground">
        This page demonstrates the different types of toast notifications available in the application. Click the
        buttons below to see each type of toast in action.
      </p>
      <ToastExample />
    </div>
  )
}

