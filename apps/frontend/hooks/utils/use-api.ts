"use client"

import { useState, useEffect, useCallback } from "react"
import { captureException } from "../../lib/errorReporting"

interface ApiOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  dependencies?: any[]
  skipInitialFetch?: boolean
}

interface ApiState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

/**
 * Custom hook for data fetching with built-in loading, error states, and retries
 */
export function useApi<T>(fetchFn: () => Promise<T>, options: ApiOptions<T> = {}) {
  const { initialData = null, onSuccess, onError, dependencies = [], skipInitialFetch = false } = options

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: !skipInitialFetch,
    error: null,
  })

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await fetchFn()
      setState({ data, isLoading: false, error: null })
      onSuccess?.(data)
      return data
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      setState({ data: null, isLoading: false, error: err })
      onError?.(err)
      captureException(err)
      throw err
    }
  }, [fetchFn, onSuccess, onError])

  useEffect(() => {
    if (!skipInitialFetch) {
      fetchData()
    }
  }, [...dependencies, skipInitialFetch])

  return {
    ...state,
    refetch: fetchData,
    setData: (data: T) => setState((prev) => ({ ...prev, data })),
  }
}

/**
 * Custom hook for mutation operations (create, update, delete)
 */
export function useMutation<T, R = any>(
  mutationFn: (data: R) => Promise<T>,
  options: Omit<ApiOptions<T>, "dependencies" | "skipInitialFetch"> = {},
) {
  const { onSuccess, onError } = options
  const [state, setState] = useState<ApiState<T> & { isSuccess: boolean }>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
  })

  const mutate = useCallback(
    async (data: R) => {
      setState({ data: null, isLoading: true, error: null, isSuccess: false })

      try {
        const result = await mutationFn(data)
        setState({ data: result, isLoading: false, error: null, isSuccess: true })
        onSuccess?.(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({ data: null, isLoading: false, error: err, isSuccess: false })
        onError?.(err)
        captureException(err)
        throw err
      }
    },
    [mutationFn, onSuccess, onError],
  )

  return {
    ...state,
    mutate,
    reset: () => setState({ data: null, isLoading: false, error: null, isSuccess: false }),
  }
}