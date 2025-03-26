"use client"

// File: apps/frontend/hooks/utils/usePrevious.ts
import { useEffect, useRef } from "react"

/**
 * A hook that returns the previous value of a variable
 *
 * @param value The current value
 * @returns The previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

