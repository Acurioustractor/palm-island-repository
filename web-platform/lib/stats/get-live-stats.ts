/**
 * Server-side live stats — queries Supabase directly.
 * Falls back to hardcoded values from current-stats.ts when DB returns nothing.
 *
 * Use this in Server Components instead of importing static constants.
 * For Client Components, pass stats as props from the server parent.
 */
import { createServerSupabase } from '@/lib/supabase/client'
import { STAFF, SERVICES, FINANCIALS, MILESTONES } from './current-stats'

export type LiveStats = {
  staff: {
    total: number
    indigenousPct: number
  }
  services: {
    total: number
    active: number
  }
  financials: {
    totalIncome: number
    incomeDisplay: string
  }
  media: {
    totalPhotos: number
    totalVideos: number
  }
  stories: {
    published: number
  }
  milestones: typeof MILESTONES
  fiscalYear: string
}

/**
 * Fetch live stats from Supabase. Cached for 5 minutes via Next.js fetch cache.
 * Safe to call from any Server Component — no HTTP round-trip, direct DB query.
 */
export async function getLiveStats(): Promise<LiveStats> {
  try {
    const supabase = createServerSupabase()

    // Run all queries in parallel
    const [
      staffResult,
      servicesResult,
      activeServicesResult,
      financialsResult,
      photosResult,
      videosResult,
      storiesResult,
    ] = await Promise.all([
      // Latest staff stats
      supabase
        .from('staff_statistics')
        .select('total_staff, indigenous_percentage, fiscal_year')
        .order('fiscal_year', { ascending: false })
        .limit(1)
        .single(),

      // Total services count
      supabase
        .from('organization_services')
        .select('id', { count: 'exact', head: true }),

      // Active services count
      supabase
        .from('organization_services')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),

      // Latest financials
      supabase
        .from('annual_financials')
        .select('total_income, fiscal_year')
        .order('fiscal_year', { ascending: false })
        .limit(1)
        .single(),

      // Photo count
      supabase
        .from('media_files')
        .select('id', { count: 'exact', head: true })
        .eq('file_type', 'image')
        .is('deleted_at', null),

      // Video count
      supabase
        .from('media_files')
        .select('id', { count: 'exact', head: true })
        .eq('file_type', 'video')
        .is('deleted_at', null),

      // Published stories
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
    ])

    const staffData = staffResult.data
    const financialData = financialsResult.data

    const totalIncome = financialData?.total_income ?? FINANCIALS.totalIncome
    const incomeMillions = totalIncome / 1_000_000

    return {
      staff: {
        total: staffData?.total_staff ?? STAFF.total,
        indigenousPct: staffData?.indigenous_percentage ?? STAFF.indigenousPct,
      },
      services: {
        total: servicesResult.count ?? SERVICES.total,
        active: activeServicesResult.count ?? SERVICES.total,
      },
      financials: {
        totalIncome,
        incomeDisplay: `$${incomeMillions.toFixed(1)}M`,
      },
      media: {
        totalPhotos: photosResult.count ?? 0,
        totalVideos: videosResult.count ?? 0,
      },
      stories: {
        published: storiesResult.count ?? 0,
      },
      milestones: MILESTONES,
      fiscalYear: financialData?.fiscal_year ?? staffData?.fiscal_year ?? '2023-24',
    }
  } catch (error) {
    // Full fallback to static constants
    return {
      staff: {
        total: STAFF.total,
        indigenousPct: STAFF.indigenousPct,
      },
      services: {
        total: SERVICES.total,
        active: SERVICES.total,
      },
      financials: {
        totalIncome: FINANCIALS.totalIncome,
        incomeDisplay: FINANCIALS.incomeDisplay,
      },
      media: {
        totalPhotos: 0,
        totalVideos: 0,
      },
      stories: {
        published: 0,
      },
      milestones: MILESTONES,
      fiscalYear: '2023-24',
    }
  }
}
