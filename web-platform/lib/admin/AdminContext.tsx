'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AdminContextValue {
  isAdmin: boolean
  isEditMode: boolean
  setEditMode: (on: boolean) => void
  loading: boolean
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  isEditMode: false,
  setEditMode: () => {},
  loading: true,
})

export function useAdmin() {
  return useContext(AdminContext)
}

const EDIT_MODE_KEY = 'picc-admin-edit-mode'

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(EDIT_MODE_KEY)
    if (stored === 'true') setIsEditMode(true)

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false)
        return
      }
      ;(supabase as any)
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }: any) => {
          if (data?.role === 'admin' || data?.role === 'staff') {
            setIsAdmin(true)
          }
          setLoading(false)
        })
    })
  }, [])

  const handleSetEditMode = (on: boolean) => {
    setIsEditMode(on)
    localStorage.setItem(EDIT_MODE_KEY, String(on))
  }

  return (
    <AdminContext.Provider value={{ isAdmin, isEditMode, setEditMode: handleSetEditMode, loading }}>
      {children}
    </AdminContext.Provider>
  )
}
