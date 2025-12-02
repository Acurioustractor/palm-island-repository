'use client'

import { QueryProvider } from './QueryProvider'
import { ToastProvider } from '../ui/Toast'
import { AuthProvider } from './AuthProvider'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  )
}
