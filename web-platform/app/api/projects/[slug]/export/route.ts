import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '@/lib/pdf/register-fonts'
import ProjectExportPDF from './ProjectExportPDF'

export const runtime = 'nodejs'
export const maxDuration = 30

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = getServerClient()

    // Fetch the innovation project
    const { data: project, error } = await supabase
      .from('innovation_projects')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Fetch related photos
    const { data: photos } = await supabase
      .from('media_files')
      .select('storage_url, caption')
      .contains('tags', [slug])
      .order('created_at', { ascending: false })
      .limit(4)

    // Fetch linked goals
    const { data: goalLinks } = await supabase
      .from('innovation_goal_links')
      .select('contribution_description, goal:goal_id(label, current_value, target_value, unit)')
      .eq('project_id', project.id)

    const format = request.nextUrl.searchParams.get('format') || 'pdf'

    if (format === 'json') {
      return NextResponse.json({
        project,
        photos: photos || [],
        goals: goalLinks || [],
      })
    }

    // Generate PDF
    registerFonts()
    const buffer = await renderToBuffer(
      React.createElement(ProjectExportPDF, {
        project,
        photos: (photos || []).map((p: any) => ({ url: p.storage_url, caption: p.caption })),
        goals: (goalLinks || []).map((g: any) => ({
          label: g.goal?.label || '',
          contribution: g.contribution_description || '',
        })),
      }) as any
    )

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${slug}-summary.pdf"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to export project' }, { status: 500 })
  }
}
