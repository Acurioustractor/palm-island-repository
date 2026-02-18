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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const serviceId = params.id

    const { data, error } = await supabase
      .from('partner_service_links')
      .select('*, partners(id, name, partner_type, logo_url, website)')
      .eq('service_id', serviceId)
      .order('fiscal_year', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ links: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient()
    const serviceId = params.id
    const body = await request.json()

    const { partner_id, link_type, fiscal_year, notes, new_partner } = body

    let partnerId = partner_id

    // Create new partner if needed
    if (new_partner && !partnerId) {
      const { data: newPartner, error: partnerError } = await supabase
        .from('partners')
        .insert({
          name: new_partner.name,
          partner_type: new_partner.partner_type || 'funder',
          logo_url: new_partner.logo_url || null,
          website: new_partner.website || null,
        })
        .select('id')
        .single()

      if (partnerError) return NextResponse.json({ error: partnerError.message }, { status: 500 })
      partnerId = newPartner.id
    }

    if (!partnerId) return NextResponse.json({ error: 'partner_id required' }, { status: 400 })

    const { data, error } = await supabase
      .from('partner_service_links')
      .insert({
        service_id: serviceId,
        partner_id: partnerId,
        link_type: link_type || 'funds',
        fiscal_year: fiscal_year || null,
        notes: notes || null,
      })
      .select('*, partners(id, name, partner_type, logo_url, website)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ link: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) return NextResponse.json({ error: 'linkId required' }, { status: 400 })

    const { error } = await supabase
      .from('partner_service_links')
      .delete()
      .eq('id', linkId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
