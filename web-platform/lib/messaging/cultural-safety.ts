/**
 * Cultural Safety Module
 *
 * Ensures messaging respects Aboriginal and Torres Strait Islander
 * cultural protocols. Non-negotiable safety layer.
 */

import { createServerSupabase } from '@/lib/supabase/client'

/**
 * Check whether we can send automated messages to a contact.
 * Returns false if:
 * - Contact has not given consent (picc_consent !== true)
 * - Community is in sorry business period
 * - Contact has opted out
 */
export async function canSendMessage(ghlContactId: string): Promise<{
  allowed: boolean
  reason?: string
}> {
  const supabase = createServerSupabase()

  // Check sorry business flag (org-wide suppression)
  const { data: config } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'sorry_business_active')
    .single()

  if (config?.value === 'true' || config?.value === true) {
    return { allowed: false, reason: 'sorry_business' }
  }

  // Check contact consent in profiles (matched by GHL contact ID)
  const { data: profile } = await supabase
    .from('profiles')
    .select('picc_consent, messaging_opt_out, is_elder')
    .eq('ghl_contact_id', ghlContactId)
    .single()

  if (profile) {
    if (profile.messaging_opt_out) {
      return { allowed: false, reason: 'opted_out' }
    }
    if (profile.picc_consent === false) {
      return { allowed: false, reason: 'no_consent' }
    }
  }

  return { allowed: true }
}

/**
 * Check whether a message requires human review before any AI response.
 * Returns true for:
 * - Messages from Elders
 * - Messages mentioning sensitive cultural topics
 * - Messages about sorry business, ceremony, or sacred matters
 */
export async function requiresHumanReview(
  ghlContactId: string,
  messageText: string
): Promise<{
  requiresReview: boolean
  reason?: string
}> {
  const supabase = createServerSupabase()

  // Check if contact is an Elder
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_elder')
    .eq('ghl_contact_id', ghlContactId)
    .single()

  if (profile?.is_elder) {
    return { requiresReview: true, reason: 'elder_message' }
  }

  // Check for sensitive cultural content
  const sensitivePatterns = [
    /\bsorry\s*business\b/i,
    /\bceremony\b/i,
    /\bsacred\b/i,
    /\bsecret\b/i,
    /\bmen'?s\s*business\b/i,
    /\bwomen'?s\s*business\b/i,
    /\blaw\s*business\b/i,
    /\bfuneral\b/i,
    /\bpassed\s*away\b/i,
    /\bdeath\b/i,
    /\bsuicid/i,
    /\bself[\s-]?harm/i,
    /\bdomestic\s*violence\b/i,
    /\bchild\s*(abuse|safety|protection)\b/i,
  ]

  for (const pattern of sensitivePatterns) {
    if (pattern.test(messageText)) {
      return { requiresReview: true, reason: 'sensitive_content' }
    }
  }

  return { requiresReview: false }
}

/**
 * Get the "Reply STOP to unsubscribe" footer for outbound messages.
 */
export function getOptOutFooter(): string {
  return '\n\nReply STOP to unsubscribe.'
}

/**
 * Check if a message is an opt-out request.
 */
export function isOptOutMessage(messageText: string): boolean {
  const optOut = /^(stop|unsubscribe|opt[\s-]?out|cancel|quit)\s*$/i
  return optOut.test(messageText.trim())
}
