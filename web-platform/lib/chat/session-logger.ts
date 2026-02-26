import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const MAX_MESSAGE_CONTENT_LENGTH = 5000

export async function logChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  audience?: string
) {
  // Validate session ID format (UUID v4)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
    return
  }

  const supabase = getSupabase()

  const messageEntry = {
    role,
    content: content.substring(0, MAX_MESSAGE_CONTENT_LENGTH),
    timestamp: new Date().toISOString(),
  }

  // Try insert first (new session). If conflict, append atomically via raw SQL
  // to avoid the read-then-update race condition.
  const { error: insertError } = await supabase
    .from('chat_sessions')
    .insert({
      session_id: sessionId,
      audience: audience || 'community',
      messages: [messageEntry],
      message_count: 1,
    })

  if (insertError?.code === '23505') {
    // Session exists — append atomically using jsonb concatenation
    // This avoids the race condition of read-then-update
    const { error: rpcError } = await supabase.rpc('append_chat_message', {
      p_session_id: sessionId,
      p_message: messageEntry,
    })

    if (rpcError) {
      // Fallback if RPC doesn't exist yet: use raw update
      // Less safe (potential race) but functional
      const { data: existing } = await supabase
        .from('chat_sessions')
        .select('messages, message_count')
        .eq('session_id', sessionId)
        .single()

      if (existing) {
        const messages = Array.isArray(existing.messages) ? existing.messages : []
        await supabase
          .from('chat_sessions')
          .update({
            messages: [...messages, messageEntry],
            message_count: (existing.message_count || 0) + 1,
            last_message_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId)
      }
    }
  }
}
