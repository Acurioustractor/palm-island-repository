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
    const { sessionId, messageIndex, rating } = await request.json()

    if (!sessionId || messageIndex == null || !rating) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!['helpful', 'not_helpful'].includes(rating)) {
      return new Response(
        JSON.stringify({ error: 'Invalid rating' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = getSupabase()
    const { error } = await supabase
      .from('chat_feedback')
      .insert({ session_id: sessionId, message_index: messageIndex, rating })

    if (error) {
      console.error('Feedback save error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Feedback API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
