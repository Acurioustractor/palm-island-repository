import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('report_distributions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const metrics = {
      ...data,
      open_rate: data.recipients_count > 0
        ? ((data.opened_count / data.recipients_count) * 100).toFixed(1) + '%'
        : '0%',
      click_rate: data.recipients_count > 0
        ? ((data.clicked_count / data.recipients_count) * 100).toFixed(1) + '%'
        : '0%',
    }

    return NextResponse.json({ distribution: metrics })
  } catch (err) {
    console.error('Tracking GET error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
