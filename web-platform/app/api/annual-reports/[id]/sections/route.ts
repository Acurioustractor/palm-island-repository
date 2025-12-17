import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// Helper to verify report exists
async function verifyReport(supabase: any, reportId: string) {
  const { data, error } = await supabase
    .from('annual_reports')
    .select('id')
    .eq('id', reportId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Report not found')
  return data
}

type SectionInput = {
  id?: string
  section_type: string
  section_title?: string | null
  section_content?: string | null
  display_order: number
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await params
    if (!reportId) return NextResponse.json({ error: 'Report ID required' }, { status: 400 })

    const body = (await request.json()) as { sections?: SectionInput[] }
    const sections = Array.isArray(body.sections) ? body.sections : []

    const supabase = getServerClient()

    // Ensure report exists
    const { data: reportExists, error: reportErr } = await supabase
      .from('annual_reports')
      .select('id')
      .eq('id', reportId)
      .maybeSingle()

    if (reportErr) return NextResponse.json({ error: reportErr.message }, { status: 500 })
    if (!reportExists) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

    // Upsert sections: update existing by id, insert new without id
    const toUpsert = sections.map((s, index) => ({
      ...(s.id ? { id: s.id } : {}),
      report_id: reportId,
      section_type: s.section_type,
      section_title: s.section_title ?? null,
      section_content: s.section_content ?? null,
      display_order: Number.isFinite(s.display_order) ? s.display_order : index,
    }))

    const { data, error } = await (supabase as any)
      .from('report_sections')
      .upsert(toUpsert, { onConflict: 'id' })
      .select('id, section_type, section_title, section_content, display_order')
      .eq('report_id', reportId)
      .order('display_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, sections: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update sections' }, { status: 500 })
  }
}

// PATCH - Update a single section
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await params
    if (!reportId) return NextResponse.json({ error: 'Report ID required' }, { status: 400 })

    const body = await request.json()
    const { sectionId, updates } = body

    if (!sectionId) return NextResponse.json({ error: 'Section ID required' }, { status: 400 })

    const supabase = getServerClient()
    await verifyReport(supabase, reportId)

    // Update the section
    const updateData: Record<string, any> = {}
    if (updates.section_title !== undefined) updateData.section_title = updates.section_title
    if (updates.section_content !== undefined) updateData.section_content = updates.section_content
    if (updates.section_type !== undefined) updateData.section_type = updates.section_type
    if (updates.display_order !== undefined) updateData.display_order = updates.display_order

    const { data, error } = await supabase
      .from('report_sections')
      .update(updateData)
      .eq('id', sectionId)
      .eq('report_id', reportId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true, section: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update section' }, { status: 500 })
  }
}

// POST - Add a new section
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await params
    if (!reportId) return NextResponse.json({ error: 'Report ID required' }, { status: 400 })

    // Reject demo reports
    if (reportId === 'demo') {
      return NextResponse.json({ error: 'Cannot add sections to demo report. Please create a real report first.' }, { status: 400 })
    }

    const body = await request.json()
    const { section_type, section_title, section_content, display_order, insertAfter } = body

    console.log('[POST sections] Adding section:', { reportId, section_type, insertAfter })

    if (!section_type) return NextResponse.json({ error: 'Section type required' }, { status: 400 })

    const supabase = getServerClient()
    await verifyReport(supabase, reportId)

    // Get all current sections to determine order
    const { data: existingSections } = await supabase
      .from('report_sections')
      .select('id, display_order')
      .eq('report_id', reportId)
      .order('display_order', { ascending: true })

    let order = display_order

    // If insertAfter is specified, find that section and insert after it
    if (insertAfter && existingSections) {
      // Check if insertAfter is a UUID (database ID) or a section type/identifier
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(insertAfter)

      let afterIndex = -1
      if (isUuid) {
        // Find by database ID
        afterIndex = existingSections.findIndex((s: any) => s.id === insertAfter)
      } else {
        // insertAfter is a section type or identifier (e.g., "hero", "ceo-message")
        // Try to find a section with matching section_type
        // First, need to fetch sections with their types
        const { data: sectionsWithTypes } = await supabase
          .from('report_sections')
          .select('id, display_order, section_type')
          .eq('report_id', reportId)
          .order('display_order', { ascending: true })

        if (sectionsWithTypes) {
          // Map common identifiers to section types
          const typeMapping: Record<string, string> = {
            'hero': 'hero_image',
            'executive-summary': 'executive_summary',
            'ceo-message': 'leadership_message',
            'chair-message': 'leadership_message',
            'acknowledgments': 'acknowledgments',
          }

          const targetType = typeMapping[insertAfter] || insertAfter.replace(/-/g, '_')

          // Find the section - for leadership_message, we need to be smarter
          // since there could be multiple. Use the identifier to determine order.
          if (insertAfter === 'ceo-message') {
            // CEO message is typically the first leadership_message
            afterIndex = sectionsWithTypes.findIndex((s: any) =>
              s.section_type === 'leadership_message'
            )
          } else if (insertAfter === 'chair-message') {
            // Chair message is typically the second leadership_message
            const leadershipSections = sectionsWithTypes.filter((s: any) =>
              s.section_type === 'leadership_message'
            )
            if (leadershipSections.length > 1) {
              afterIndex = sectionsWithTypes.findIndex((s: any) => s.id === leadershipSections[1].id)
            } else if (leadershipSections.length === 1) {
              afterIndex = sectionsWithTypes.findIndex((s: any) => s.id === leadershipSections[0].id)
            }
          } else {
            // Generic type matching
            afterIndex = sectionsWithTypes.findIndex((s: any) =>
              s.section_type === targetType || s.section_type === insertAfter
            )
          }

          // Update existingSections reference if we found a match
          if (afterIndex !== -1) {
            // Map the index back to existingSections
            const foundSection = sectionsWithTypes[afterIndex]
            afterIndex = existingSections.findIndex((s: any) => s.id === foundSection.id)
          }
        }
      }

      if (afterIndex !== -1) {
        // Get the order of the section we're inserting after
        const afterOrder = existingSections[afterIndex].display_order

        // Shift all sections after this one down by 1
        const sectionsToShift = existingSections.slice(afterIndex + 1)
        for (const section of sectionsToShift) {
          await supabase
            .from('report_sections')
            .update({ display_order: section.display_order + 1 })
            .eq('id', section.id)
        }

        // Insert at the position right after
        order = afterOrder + 1
      }
    }

    // If no order determined yet, add at the end
    if (order === undefined) {
      order = ((existingSections?.[existingSections.length - 1]?.display_order ?? -1) + 1)
      console.log('[POST sections] No insertAfter match found, adding at end with order:', order)
    } else {
      console.log('[POST sections] Inserting with order:', order)
    }

    // Insert the new section
    const { data, error } = await supabase
      .from('report_sections')
      .insert({
        report_id: reportId,
        section_type,
        section_title: section_title || null,
        section_content: section_content || null,
        display_order: order,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST sections] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[POST sections] Successfully created section:', data?.id)
    return NextResponse.json({ ok: true, section: data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to add section' }, { status: 500 })
  }
}

// DELETE - Remove a section
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await params
    if (!reportId) return NextResponse.json({ error: 'Report ID required' }, { status: 400 })

    const body = await request.json()
    const { sectionId } = body

    if (!sectionId) return NextResponse.json({ error: 'Section ID required' }, { status: 400 })

    const supabase = getServerClient()
    await verifyReport(supabase, reportId)

    const { error } = await supabase
      .from('report_sections')
      .delete()
      .eq('id', sectionId)
      .eq('report_id', reportId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete section' }, { status: 500 })
  }
}

// GET - List all sections for a report
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: reportId } = await params
    if (!reportId) return NextResponse.json({ error: 'Report ID required' }, { status: 400 })

    const supabase = getServerClient()

    const { data, error } = await supabase
      .from('report_sections')
      .select('*')
      .eq('report_id', reportId)
      .order('display_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ sections: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load sections' }, { status: 500 })
  }
}

