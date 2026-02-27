/**
 * GoHighLevel API Types
 * Used for CRM, campaign management, and communications
 */

export interface GHLContact {
  id?: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  name?: string
  tags?: string[]
  source?: string
  customFields?: Record<string, string>
}

export interface GHLWorkflow {
  id: string
  name: string
}

export interface GHLCampaign {
  id: string
  name: string
  status: string
}

export interface GHLWebhookEvent {
  type: string
  locationId: string
  contactId?: string
  data?: Record<string, unknown>
}

export interface GHLResponse<T = unknown> {
  success: boolean
  data?: T
  reason?: string
  error?: string
}

export interface GHLContactSearchResult {
  contacts: GHLContact[]
  total: number
}

/** Inbound message from GHL webhook */
export interface GHLInboundMessage {
  type: string
  locationId: string
  contactId: string
  conversationId: string
  messageId?: string
  body: string
  messageType: 'SMS' | 'WhatsApp' | 'Email' | string
  direction: 'inbound' | 'outbound'
  dateAdded?: string
  attachments?: Array<{
    url: string
    contentType: string
  }>
}

/** Message sent within a GHL conversation */
export interface GHLConversationMessage {
  type: string
  contactId: string
  conversationId: string
  message: string
  messageType?: 'SMS' | 'WhatsApp' | 'Email'
}
