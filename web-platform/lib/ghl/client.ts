/**
 * GoHighLevel API Client
 *
 * Gracefully degrades when GHL credentials are not configured.
 * All methods return { success: false, reason: 'GHL not configured' } when unconfigured.
 */

import type {
  GHLContact,
  GHLResponse,
  GHLContactSearchResult,
} from './types'

const GHL_BASE_URL = 'https://services.leadconnectorhq.com'

export class GHLClient {
  private apiKey: string | undefined
  private locationId: string | undefined

  constructor() {
    this.apiKey = process.env.GHL_API_KEY
    this.locationId = process.env.GHL_LOCATION_ID
  }

  /** Check if GHL credentials are configured */
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.locationId)
  }

  private notConfigured<T>(): GHLResponse<T> {
    return { success: false, reason: 'GHL not configured' }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<GHLResponse<T>> {
    if (!this.isConfigured()) return this.notConfigured<T>()

    try {
      const res = await fetch(`${GHL_BASE_URL}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
          ...options.headers,
        },
      })

      if (!res.ok) {
        const text = await res.text()
        return { success: false, error: `GHL ${res.status}: ${text}` }
      }

      const data = (await res.json()) as T
      return { success: true, data }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown GHL error'
      console.error('[GHL] Request failed:', message)
      return { success: false, error: message }
    }
  }

  async createContact(contact: GHLContact): Promise<GHLResponse<GHLContact>> {
    return this.request<GHLContact>('/contacts/', {
      method: 'POST',
      body: JSON.stringify({
        ...contact,
        locationId: this.locationId,
      }),
    })
  }

  async updateContact(
    contactId: string,
    updates: Partial<GHLContact>
  ): Promise<GHLResponse<GHLContact>> {
    return this.request<GHLContact>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async searchContacts(
    query: string
  ): Promise<GHLResponse<GHLContactSearchResult>> {
    const params = new URLSearchParams({
      locationId: this.locationId!,
      query,
    })
    return this.request<GHLContactSearchResult>(
      `/contacts/search/duplicate?${params}`
    )
  }

  async triggerWorkflow(
    workflowId: string,
    contactId: string
  ): Promise<GHLResponse> {
    return this.request(`/contacts/${contactId}/workflow/${workflowId}`, {
      method: 'POST',
    })
  }

  async addContactTag(
    contactId: string,
    tags: string[]
  ): Promise<GHLResponse<GHLContact>> {
    return this.request<GHLContact>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify({ tags }),
    })
  }

  /** Send a message within an existing GHL conversation */
  async sendMessage(
    conversationId: string,
    message: string,
    type: 'sms' | 'whatsapp' | 'email' = 'sms'
  ): Promise<GHLResponse> {
    return this.request('/conversations/messages', {
      method: 'POST',
      body: JSON.stringify({
        type: type === 'whatsapp' ? 'WhatsApp' : type.toUpperCase(),
        conversationId,
        message,
      }),
    })
  }

  /** Get messages in a conversation */
  async getConversationMessages(
    conversationId: string,
    limit = 20
  ): Promise<GHLResponse<{ messages: Array<{ body: string; direction: string; dateAdded: string }> }>> {
    const params = new URLSearchParams({ limit: String(limit) })
    return this.request(`/conversations/${conversationId}/messages?${params}`)
  }
}

/** Singleton instance */
let _client: GHLClient | null = null

export function getGHLClient(): GHLClient {
  if (!_client) _client = new GHLClient()
  return _client
}
