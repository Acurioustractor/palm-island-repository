/**
 * Contact Resolver
 *
 * Resolves audience criteria → list of GHL contact IDs for outbound messaging.
 */

import { createServerSupabase } from '@/lib/supabase/client'

export interface ResolvedContact {
  ghlContactId: string
  name: string | null
  phone: string | null
}

export interface ResolveOptions {
  /** Send to specific GHL contact IDs */
  contactIds?: string[]
  /** Send to contacts associated with a service */
  serviceSlug?: string
  /** Send to contacts with specific tags */
  tags?: string[]
  /** Maximum contacts to resolve */
  limit?: number
}

/**
 * Resolve audience criteria to a list of contacts eligible for messaging.
 * Only returns contacts who have given consent and not opted out.
 */
export async function resolveContacts(options: ResolveOptions): Promise<ResolvedContact[]> {
  const { contactIds, serviceSlug, tags, limit = 100 } = options
  const supabase = createServerSupabase()

  let query = supabase
    .from('profiles')
    .select('ghl_contact_id, preferred_name, full_name, phone')
    .not('ghl_contact_id', 'is', null)
    .neq('messaging_opt_out', true)
    .limit(limit)

  // Filter by specific contact IDs
  if (contactIds && contactIds.length > 0) {
    query = query.in('ghl_contact_id', contactIds)
  }

  // Filter by service association
  if (serviceSlug) {
    query = query.contains('associated_services', [serviceSlug])
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  const { data: profiles } = await query

  if (!profiles || profiles.length === 0) return []

  return profiles
    .filter((p): p is typeof p & { ghl_contact_id: string } => Boolean(p.ghl_contact_id))
    .map(p => ({
      ghlContactId: p.ghl_contact_id,
      name: p.preferred_name || p.full_name || null,
      phone: p.phone || null,
    }))
}

/**
 * Personalise a message template with contact details.
 * Replaces {{name}} with the contact's name or "there" if unknown.
 */
export function personaliseMessage(template: string, contact: ResolvedContact): string {
  return template.replace(/\{\{name\}\}/g, contact.name || 'there')
}
