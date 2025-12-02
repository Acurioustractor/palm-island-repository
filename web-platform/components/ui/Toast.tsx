'use client'

import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Toast context for global toast management
interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = React.useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: 'success' })
    },
    [addToast]
  )

  const error = React.useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: 'error' })
    },
    [addToast]
  )

  const warning = React.useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: 'warning' })
    },
    [addToast]
  )

  const info = React.useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: 'info' })
    },
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

const variantStyles = {
  default: 'bg-white border-gray-200',
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
}

const variantIcons = {
  default: null,
  success: <CheckCircle className="h-5 w-5 text-green-600" />,
  error: <AlertCircle className="h-5 w-5 text-red-600" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  info: <Info className="h-5 w-5 text-blue-600" />,
}

const variantTextColors = {
  default: 'text-gray-900',
  success: 'text-green-900',
  error: 'text-red-900',
  warning: 'text-yellow-900',
  info: 'text-blue-900',
}

interface ToastItemProps extends Toast {
  onClose: () => void
}

function ToastItem({
  title,
  description,
  variant = 'default',
  duration = 5000,
  onClose,
}: ToastItemProps) {
  return (
    <ToastPrimitive.Root
      className={cn(
        'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[swipe=end]:animate-out data-[state=closed]:fade-out-80',
        'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full',
        variantStyles[variant]
      )}
      duration={duration}
      onOpenChange={(open) => !open && onClose()}
    >
      {variantIcons[variant]}
      <div className="flex-1 space-y-1">
        {title && (
          <ToastPrimitive.Title
            className={cn('text-sm font-semibold', variantTextColors[variant])}
          >
            {title}
          </ToastPrimitive.Title>
        )}
        {description && (
          <ToastPrimitive.Description
            className={cn('text-sm opacity-90', variantTextColors[variant])}
          >
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close
        aria-label="Dismiss notification"
        className={cn(
          'absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity',
          'hover:opacity-100 focus:opacity-100 group-hover:opacity-70',
          variantTextColors[variant]
        )}
      >
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

export { ToastPrimitive }
