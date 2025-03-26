// File: apps/frontend/app/(auth)/layout.tsx
import { ToastProvider } from "@/components/ui/Toast"
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <div className="mb-8">
            <img className="mx-auto h-20 w-auto" src="/logo.svg" alt="SA1L Logo" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">SA1L Platform</h2>
          </div>
          {children}
        </div>
      </div>
    </ToastProvider>
  )
}