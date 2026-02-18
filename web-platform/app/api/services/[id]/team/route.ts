import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

type LinkedService = {
  service_id: string
  slug?: string
  role?: string
  title?: string
}

type ProfileRow = {
  id: string
  full_name: string | null
  community_role: string | null
  avatar_url: string | null
  profile_image_url: string | null
  bio: string | null
  metadata: { linked_services?: LinkedService[] } | null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const serviceId = params.id
    const { searchParams } = new URL(request.url)
    const allProfiles = searchParams.get('allProfiles')

    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, community_role, avatar_url, profile_image_url, bio, metadata')
      .order('full_name', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Filter to those linked to this service
    const teamMembers = (profiles || [])
      .filter((p: ProfileRow) => {
        const linked = p.metadata?.linked_services
        if (!Array.isArray(linked)) return false
        return linked.some((ls: LinkedService) => ls.service_id === serviceId)
      })
      .map((p: ProfileRow) => {
        const entry = p.metadata!.linked_services!.find(
          (ls: LinkedService) => ls.service_id === serviceId
        )
        return {
          id: p.id,
          full_name: p.full_name,
          community_role: p.community_role,
          avatar_url: p.avatar_url || p.profile_image_url,
          bio: p.bio,
          role: entry?.role || null,
          title: entry?.title || null,
        }
      })

    // If allProfiles requested, also return the full profile list for the search picker
    if (allProfiles === 'true') {
      const allProfilesList = (profiles || []).map((p: ProfileRow) => ({
        id: p.id,
        full_name: p.full_name,
        community_role: p.community_role,
        avatar_url: p.avatar_url || p.profile_image_url,
      }))
      return NextResponse.json({ team: teamMembers, profiles: allProfilesList })
    }

    return NextResponse.json({ team: teamMembers })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const serviceId = params.id
    const body = await request.json()

    const { profile_id, role, title } = body
    if (!profile_id) return NextResponse.json({ error: 'profile_id required' }, { status: 400 })

    // Get current profile metadata
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', profile_id)
      .single()

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

    const metadata = profile?.metadata || {}
    const linkedServices: LinkedService[] = Array.isArray(metadata.linked_services)
      ? metadata.linked_services
      : []

    // Check if already linked
    if (linkedServices.some((ls: LinkedService) => ls.service_id === serviceId)) {
      return NextResponse.json({ error: 'Profile already linked to this service' }, { status: 409 })
    }

    // Get the service slug
    const { data: svc } = await supabase
      .from('services')
      .select('slug')
      .eq('id', serviceId)
      .single()

    // Add new link
    linkedServices.push({
      service_id: serviceId,
      slug: svc?.slug || undefined,
      role: role || 'team_member',
      title: title || undefined,
    })

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ metadata: { ...metadata, linked_services: linkedServices } })
      .eq('id', profile_id)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const serviceId = params.id
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')

    if (!profileId) return NextResponse.json({ error: 'profileId required' }, { status: 400 })

    // Get current profile metadata
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('metadata')
      .eq('id', profileId)
      .single()

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

    const metadata = profile?.metadata || {}
    const linkedServices: LinkedService[] = Array.isArray(metadata.linked_services)
      ? metadata.linked_services
      : []

    // Remove the link for this service
    const updated = linkedServices.filter((ls: LinkedService) => ls.service_id !== serviceId)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ metadata: { ...metadata, linked_services: updated } })
      .eq('id', profileId)

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
