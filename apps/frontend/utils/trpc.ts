import type { AppRouter } from "@/packages/types"
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

// Create React hooks
export const trpc = createTRPCReact<AppRouter>()

/**
 * Function to get the base URL for API calls
 * @returns Base URL string
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined") return "" // browser should use relative path
  return "http://localhost:3000" // dev SSR should use localhost
}

// Create a standalone client
export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
})

// Export type helpers
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

