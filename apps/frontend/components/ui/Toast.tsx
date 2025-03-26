"use client"

// File: apps/frontend/components/ui/Toast.tsx
import { cn } from "@/lib/utils"
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react"
import { createPortal } from "react-dom"

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastProps {
  id: string
  type: ToastType
  message: ReactNode
  duration?: number
  onClose: (id: string) => void
  hasAction?: boolean
  actionLabel?: string
  onAction?: () => void
}

const Toast = ({
  id,
  type,
  message,
  duration = 5000,
  onClose,
  hasAction = false,
  actionLabel = "Undo",
  onAction,
}: ToastProps) => {
  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return

    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const handleAction = useCallback(() => {
    if (onAction) {
      onAction()
    }
    onClose(id)
  }, [id, onAction, onClose])

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }

  const typeIcons = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full max-w-sm rounded shadow-lg text-white p-4 mb-4 transform transition-transform duration-300 ease-in-out",
        typeStyles[type],
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">{typeIcons[type]}</div>
        <div>{message}</div>
      </div>
      <div className="flex items-center space-x-3">
        {hasAction && (
          <button onClick={handleAction} className="text-white font-medium underline hover:text-white/80">
            {actionLabel}
          </button>
        )}
        <button onClick={() => onClose(id)} className="bg-white/20 rounded-full p-1 hover:bg-white/30">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

interface ToastContextValue {
  showToast: (
    message: ReactNode,
    type?: ToastType,
    options?: {
      duration?: number
      hasAction?: boolean
      actionLabel?: string
      onAction?: () => void
    },
  ) => string
  hideToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const showToast = useCallback(
    (
      message: ReactNode,
      type: ToastType = "info",
      options?: {
        duration?: number
        hasAction?: boolean
        actionLabel?: string
        onAction?: () => void
      },
    ) => {
      const id = String(Date.now())

      setToasts((prev) => [
        ...prev,
        {
          id,
          type,
          message,
          duration: options?.duration,
          onClose: hideToast,
          hasAction: options?.hasAction,
          actionLabel: options?.actionLabel,
          onAction: options?.onAction,
        },
      ])

      return id
    },
    [],
  )

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  const contextValue = {
    showToast,
    hideToast,
    clearToasts,
  }

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {isMounted &&
        createPortal(
          <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-4">
            {toasts.map((toast) => (
              <Toast key={toast.id} {...toast} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

