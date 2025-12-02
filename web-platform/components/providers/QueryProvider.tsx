'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

// Query timeout - matches the Supabase client timeout
const QUERY_TIMEOUT = 10000 // 10 seconds

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)

            // Retry logic - retry once with exponential backoff
            retry: (failureCount, error) => {
              // Don't retry on timeout errors (already retried at fetch level)
              if (error instanceof Error && error.message.includes('timed out')) {
                return false
              }
              // Don't retry on 4xx errors (client errors)
              if (error instanceof Error && error.message.includes('400')) {
                return false
              }
              // Retry up to 2 times for other errors
              return failureCount < 2
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),

            // Prevent refetching on window focus to avoid unnecessary requests
            refetchOnWindowFocus: false,

            // Network mode - don't run queries when offline
            networkMode: 'online',

            // Throw errors to error boundaries
            throwOnError: false,
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
            networkMode: 'online',
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
