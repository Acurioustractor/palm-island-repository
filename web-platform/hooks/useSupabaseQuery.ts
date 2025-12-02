'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

// Generic hook for fetching data from any Supabase table
export function useSupabaseQuery(
  table: string,
  options?: {
    select?: string
    filter?: Record<string, unknown>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    enabled?: boolean
  }
) {
  const supabase = createClient()

  return useQuery({
    queryKey: [table, options],
    queryFn: async () => {
      let query = (supabase.from(table) as any).select(options?.select || '*')

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false,
        })
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: options?.enabled ?? true,
  })
}

// Hook for fetching stories with related data
export function useStories(options?: {
  organizationId?: string
  isPublic?: boolean
  limit?: number
  enabled?: boolean
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['stories', options],
    queryFn: async () => {
      let query = (supabase
        .from('stories') as any)
        .select(`
          *,
          storyteller:profiles!stories_storyteller_id_fkey (
            id,
            full_name,
            profile_image_url,
            community_role
          ),
          organization:organizations (
            id,
            name,
            logo_url
          )
        `)
        .order('created_at', { ascending: false })

      if (options?.organizationId) {
        query = query.eq('organization_id', options.organizationId)
      }

      if (options?.isPublic !== undefined) {
        query = query.eq('is_public', options.isPublic)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: options?.enabled ?? true,
  })
}

// Hook for fetching a single story
export function useStory(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      if (!id) throw new Error('Story ID is required')

      const { data, error } = await (supabase
        .from('stories') as any)
        .select(`
          *,
          storyteller:profiles!stories_storyteller_id_fkey (
            id,
            full_name,
            profile_image_url,
            community_role,
            bio
          ),
          organization:organizations (
            id,
            name,
            logo_url
          ),
          media:story_media (
            id,
            media_type,
            url,
            caption,
            display_order
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Hook for fetching profiles/storytellers
export function useStorytellers(options?: {
  organizationId?: string
  limit?: number
  enabled?: boolean
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['storytellers', options],
    queryFn: async () => {
      let query = (supabase
        .from('profiles') as any)
        .select('*')
        .order('full_name', { ascending: true })

      if (options?.organizationId) {
        query = query.eq('organization_id', options.organizationId)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: options?.enabled ?? true,
  })
}

// Hook for fetching a single profile
export function useProfile(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) throw new Error('Profile ID is required')

      const { data, error } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// Hook for fetching the current user's profile
export function useCurrentUser() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) return null

      const { data: profile, error: profileError } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        // User exists but no profile yet
        return { user, profile: null }
      }

      return { user, profile }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for fetching projects
export function useProjects(options?: {
  organizationId?: string
  status?: string
  limit?: number
  enabled?: boolean
}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['projects', options],
    queryFn: async () => {
      let query = (supabase
        .from('innovation_projects') as any)
        .select('*')
        .order('created_at', { ascending: false })

      if (options?.organizationId) {
        query = query.eq('organization_id', options.organizationId)
      }

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: options?.enabled ?? true,
  })
}

// Hook for dashboard stats
export function useDashboardStats(organizationId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboardStats', organizationId],
    queryFn: async () => {
      const filter = organizationId ? { organization_id: organizationId } : {}

      const [stories, profiles, projects] = await Promise.all([
        (supabase.from('stories') as any).select('*', { count: 'exact', head: true }),
        (supabase.from('profiles') as any).select('*', { count: 'exact', head: true }),
        (supabase.from('innovation_projects') as any).select('*', { count: 'exact', head: true }),
      ])

      return {
        totalStories: stories.count || 0,
        totalStorytellers: profiles.count || 0,
        totalProjects: projects.count || 0,
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Generic mutation hook with toast notifications
export function useSupabaseMutation(
  table: string,
  options?: {
    onSuccess?: () => void
    successMessage?: string
    errorMessage?: string
  }
) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const { success, error: showError } = useToast()

  return useMutation({
    mutationFn: async ({
      operation,
      data,
      id,
    }: {
      operation: 'insert' | 'update' | 'delete'
      data?: Record<string, unknown>
      id?: string
    }) => {
      let result
      let error

      switch (operation) {
        case 'insert':
          ({ data: result, error } = await (supabase
            .from(table) as any)
            .insert(data as any)
            .select())
          break
        case 'update':
          if (!id) throw new Error('ID is required for update')
          ;({ data: result, error } = await (supabase
            .from(table) as any)
            .update(data as any)
            .eq('id', id as any)
            .select())
          break
        case 'delete':
          if (!id) throw new Error('ID is required for delete')
          ;({ error } = await (supabase
            .from(table) as any)
            .delete()
            .eq('id', id as any))
          break
      }

      if (error) throw error
      return result
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [table] })

      if (options?.successMessage) {
        success('Success', options.successMessage)
      }

      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      showError(
        'Error',
        options?.errorMessage || error.message || 'An error occurred'
      )
    },
  })
}
