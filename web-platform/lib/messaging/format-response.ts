/**
 * SMS/WhatsApp Response Formatter
 *
 * Converts AI responses (which may contain markdown, tool results, etc.)
 * into plain text suitable for SMS (160 char segments) and WhatsApp.
 */

import { getOptOutFooter } from './cultural-safety'

const SMS_MAX_LENGTH = 1600 // ~10 SMS segments, reasonable upper limit
const WHATSAPP_MAX_LENGTH = 4096

/**
 * Format an AI response for SMS delivery.
 * Strips markdown, truncates gracefully, adds opt-out footer.
 */
export function formatForSMS(text: string): string {
  let formatted = stripMarkdown(text)
  formatted = collapseWhitespace(formatted)

  const footer = getOptOutFooter()
  const maxBody = SMS_MAX_LENGTH - footer.length

  if (formatted.length > maxBody) {
    formatted = truncateGracefully(formatted, maxBody)
  }

  return formatted + footer
}

/**
 * Format an AI response for WhatsApp delivery.
 * WhatsApp supports basic formatting so we keep some structure.
 */
export function formatForWhatsApp(text: string): string {
  let formatted = text
    // Convert markdown headers to bold
    .replace(/^#{1,3}\s+(.+)$/gm, '*$1*')
    // Convert markdown bold
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    // Convert markdown links to plain text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove follow-up tags
    .replace(/<follow-ups>[\s\S]*?<\/follow-ups>/g, '')

  formatted = collapseWhitespace(formatted)

  const footer = getOptOutFooter()
  const maxBody = WHATSAPP_MAX_LENGTH - footer.length

  if (formatted.length > maxBody) {
    formatted = truncateGracefully(formatted, maxBody)
  }

  return formatted + footer
}

/**
 * Format a response based on message type.
 */
export function formatResponse(text: string, messageType: 'sms' | 'whatsapp' | 'email'): string {
  switch (messageType) {
    case 'whatsapp':
      return formatForWhatsApp(text)
    case 'sms':
      return formatForSMS(text)
    case 'email':
      return text // Email can handle full formatting
    default:
      return formatForSMS(text)
  }
}

/**
 * Convert tool result objects to readable plain text summaries.
 */
export function toolResultToText(toolName: string, result: unknown): string {
  if (!result || typeof result !== 'object') return ''

  const r = result as Record<string, unknown>

  switch (toolName) {
    case 'getServiceInfo': {
      if (!r.found) return 'Service not found.'
      const svc = r.service as Record<string, string> | undefined
      if (!svc) return ''
      return `${svc.name}: ${svc.description || 'Contact us for details.'}`
    }

    case 'searchStories': {
      const stories = (r.stories as Array<{ title: string; excerpt: string }>) || []
      if (stories.length === 0) return 'No stories found.'
      return stories.map(s => `- ${s.title}`).join('\n')
    }

    case 'getFinancialSummary': {
      const fins = (r.financials as Array<Record<string, unknown>>) || []
      if (fins.length === 0) return 'No financial data available.'
      const latest = fins[0]
      return `Revenue: $${((latest.total_revenue as number) / 1_000_000).toFixed(1)}M | Staff: 197`
    }

    case 'escalateToHuman': {
      const contacts = r.contacts as Record<string, string> | undefined
      return contacts
        ? `Contact PICC: ${contacts.phone} or ${contacts.email}`
        : 'Please contact PICC directly.'
    }

    default:
      return ''
  }
}

// ── Internal helpers ────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*{1,3}(.+?)\*{1,3}/g, '$1')
    .replace(/_{1,3}(.+?)_{1,3}/g, '$1')
    // Remove links, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove follow-up tags
    .replace(/<follow-ups>[\s\S]*?<\/follow-ups>/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
}

function collapseWhitespace(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function truncateGracefully(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  // Try to break at sentence boundary
  const truncated = text.slice(0, maxLength)
  const lastSentence = truncated.lastIndexOf('. ')
  if (lastSentence > maxLength * 0.6) {
    return truncated.slice(0, lastSentence + 1)
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...'
  }

  return truncated.slice(0, maxLength - 3) + '...'
}
