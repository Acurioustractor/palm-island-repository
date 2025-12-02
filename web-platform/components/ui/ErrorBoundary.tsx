'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  resetError?: () => void
  title?: string
  description?: string
}

export function ErrorFallback({
  error,
  resetError,
  title = 'Something went wrong',
  description,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4 max-w-md">
        {description || error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {resetError && (
        <button
          onClick={resetError}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

// Hook for using error boundary in functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  return { error, resetError, captureError }
}

// Inline error display for non-blocking errors
interface InlineErrorProps {
  error: string | Error
  onRetry?: () => void
  className?: string
}

export function InlineError({ error, onRetry, className }: InlineErrorProps) {
  const message = typeof error === 'string' ? error : error.message

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Comprehensive loading state component for consistent UI across all pages
interface LoadingStateProps {
  loading: boolean
  error: string | Error | null
  onRetry?: () => void
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorTitle?: string
  fullScreen?: boolean
}

export function LoadingState({
  loading,
  error,
  onRetry,
  children,
  loadingComponent,
  errorTitle = 'Failed to Load',
  fullScreen = false,
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[400px]'

  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>
    }

    return (
      <div className={containerClass}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message
    const isTimeout = errorMessage.includes('timed out')

    return (
      <div className={containerClass}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{errorTitle}</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          {isTimeout && (
            <p className="text-sm text-gray-500 mb-4">
              This might be a temporary network issue. Please check your connection.
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for managing async data loading with timeout handling
interface UseAsyncDataOptions<T> {
  initialData?: T | null
  timeout?: number
}

export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncDataOptions<T> = {}
) {
  const [data, setData] = React.useState<T | null>(options.initialData ?? null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const isMounted = React.useRef(true)

  const load = React.useCallback(async () => {
    if (!isMounted.current) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      if (isMounted.current) {
        setData(result)
      }
    } catch (err) {
      if (isMounted.current) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        setError(message)
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, deps)

  React.useEffect(() => {
    isMounted.current = true
    load()

    return () => {
      isMounted.current = false
    }
  }, [load])

  return { data, loading, error, refetch: load }
}
