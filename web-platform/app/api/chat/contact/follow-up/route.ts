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
    const { sessionId } = await request.json()

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = getSupabase()

    // Fetch existing metadata
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('metadata')
      .eq('session_id', sessionId)
      .single()

    const metadata = (session?.metadata as Record<string, unknown>) || {}
    const contact = (metadata.contact as Record<string, unknown>) || null

    if (!contact) {
      return new Response(
        JSON.stringify({ error: 'No contact info found for this session' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabase
      .from('chat_sessions')
      .update({
        metadata: {
          ...metadata,
          contact: {
            ...contact,
            followed_up_at: new Date().toISOString(),
          },
        },
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Follow-up save error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to mark as followed up' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Follow-up API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
