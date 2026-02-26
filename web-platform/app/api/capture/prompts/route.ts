import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('capture_prompts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ prompts: data })
  } catch (err) {
    console.error('Prompts GET error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    if (!body.title || !body.prompt_text) {
      return NextResponse.json(
        { error: 'title and prompt_text are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('capture_prompts')
      .insert({
        title: body.title,
        prompt_text: body.prompt_text,
        target_audience: body.target_audience || 'staff',
        service_id: body.service_id || null,
        is_active: body.is_active !== false,
        send_via: body.send_via || ['sms'],
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ prompt: data }, { status: 201 })
  } catch (err) {
    console.error('Prompts POST error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
