"use client"

import { useToast } from "@/components/ui/Toast"
import type { AppRouter } from "@/packages/types"
import { trpc } from "@/utils/trpc"
import { TRPCClientError } from "@trpc/client"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"

type ProcedurePath = keyof AppRouter
type SubProcedurePath<T extends ProcedurePath> = keyof AppRouter[T]

type InferProcedureInput<T extends ProcedurePath, K extends SubProcedurePath<T>> = inferProcedureInput<AppRouter[T][K]>

type InferProcedureOutput<T extends ProcedurePath, K extends SubProcedurePath<T>> = inferProcedureOutput<
  AppRouter[T][K]
>

/**
 * Standard hook for handling tRPC queries with consistent error handling and loading states
 * @param procedure The procedure path in format "namespace.method"
 * @param params The parameters to pass to the query
 * @param options Additional options for the query
 * @returns The query result
 */
export function useTrpcQuery<
  T extends ProcedurePath,
  K extends SubProcedurePath<T>,
  TData = InferProcedureOutput<T, K>,
  TParams = InferProcedureInput<T, K>,
>(
  procedure: `${T}.${K}`,
  params?: TParams,
  options?: {
    enabled?: boolean
    retry?: boolean | number
    retryDelay?: number
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
    staleTime?: number
  },
) {
  const { showToast } = useToast()
  const [namespace, method] = procedure.split(".") as [T, K]

  const query = trpc[namespace][method].useQuery(params as any, {
    ...options,
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        showToast(`Error: ${error.message}`, "error")
      } else {
        showToast("An unexpected error occurred", "error")
      }

      options?.onError?.(error)
    },
  })

  return query
}

/**
 * Standard hook for handling tRPC mutations with consistent error handling
 * @param procedure The procedure path in format "namespace.method"
 * @param options Additional options for the mutation
 * @returns The mutation result
 */
export function useTrpcMutation<
  T extends ProcedurePath,
  K extends SubProcedurePath<T>,
  TData = InferProcedureOutput<T, K>,
  TVariables = InferProcedureInput<T, K>,
>(
  procedure: `${T}.${K}`,
  options?: {
    onSuccess?: (data: TData) => void
    onError?: (error: Error) => void
    onSettled?: () => void
  },
) {
  const { showToast } = useToast()
  const [namespace, method] = procedure.split(".") as [T, K]

  const mutation = trpc[namespace][method].useMutation({
    ...options,
    onSuccess: (data) => {
      options?.onSuccess?.(data as TData)
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        showToast(`Error: ${error.message}`, "error")
      } else {
        showToast("An unexpected error occurred", "error")
      }

      options?.onError?.(error)
    },
    onSettled: options?.onSettled,
  })

  return mutation
}

/**
 * Utility for handling API errors consistently across the application
 * @param error The error to handle
 * @returns A user-friendly error message
 */
export function handleApiError(error: unknown): string {
  if (error instanceof TRPCClientError) {
    return error.message
  } else if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}

