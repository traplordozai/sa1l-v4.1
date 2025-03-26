"use client"

import { useEffect, useState } from "react"

/**
 * A simple hook for fetching JSON data
 * This preserves the same API as SWR while allowing us to fix the import issues
 */
export function useSWRJson<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(url, options)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [url, options])

  return { data, error, isLoading }
}

