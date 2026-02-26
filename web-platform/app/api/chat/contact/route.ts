import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const { sessionId, name, phoneOrEmail, reason } = await request.json()

    if (!sessionId || !name?.trim() || !phoneOrEmail?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Session ID, name, and phone or email are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = getSupabase()

    // Fetch existing metadata to merge
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('metadata')
      .eq('session_id', sessionId)
      .single()

    const existingMetadata = (session?.metadata as Record<string, unknown>) || {}

    const { error } = await supabase
      .from('chat_sessions')
      .update({
        metadata: {
          ...existingMetadata,
          contact: {
            name: name.trim(),
            phone_or_email: phoneOrEmail.trim(),
            reason: reason?.trim() || null,
            submitted_at: new Date().toISOString(),
          },
        },
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Contact save error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save contact info' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
