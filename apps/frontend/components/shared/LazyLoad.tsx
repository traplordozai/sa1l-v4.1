"use client"

import type React from "react"

import { useRef, type ReactNode, useState, useEffect } from "react"
import { useIsVisible } from "@/hooks/utils/useIntersectionObserver"

interface LazyLoadProps {
  children: ReactNode
  height?: number | string
  width?: number | string
  threshold?: number
  rootMargin?: string
  placeholder?: ReactNode
  className?: string
  onVisible?: () => void
}

/**
 * Component that lazily renders its children when they become visible in the viewport
 */
export default function LazyLoad({
  children,
  height,
  width,
  threshold = 0.1,
  rootMargin = "200px",
  placeholder,
  className = "",
  onVisible,
}: LazyLoadProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isVisible = useIsVisible(containerRef, { threshold, rootMargin, freezeOnceVisible: true })
  const [shouldRender, setShouldRender] = useState(false)

  // Handle server-side rendering and initial client render
  useEffect(() => {
    // If we're in a browser environment and the element is visible, render the content
    if (typeof window !== "undefined" && isVisible) {
      setShouldRender(true)
      onVisible?.()
    }
  }, [isVisible, onVisible])

  // Style for the container
  const style: React.CSSProperties = {
    minHeight: height,
    minWidth: width,
  }

  return (
    <div ref={containerRef} style={style} className={className}>
      {shouldRender
        ? children
        : placeholder || (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 animate-pulse">
              <svg
                className="h-8 w-8 text-gray-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>
          )}
    </div>
  )
}

