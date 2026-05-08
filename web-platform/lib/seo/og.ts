/**
 * Shared OG metadata builder. Used by every public surface so social
 * shares (Slack, WhatsApp, LinkedIn, X, email previews) render with a
 * consistent palette and an actual image.
 *
 * Usage on a page that already exports metadata:
 *
 *   export const metadata = ogMeta({
 *     title: 'Voices — Palm Island Community Company',
 *     description: '42 named storytellers, consented and held with cultural protocol.',
 *     path: '/voices',
 *     image: '/og/voices.png',  // optional, falls back to default
 *   })
 *
 * Default image lives at /og/default.png in the public dir (or the
 * supabase-hosted fallback). Per-page images can be added later.
 */
import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://picc.studio').replace(/\/$/, '')
// Default OG image — uses the PICC logo from /public until a proper
// 1200×630 social card is uploaded to Supabase Storage.
const DEFAULT_OG_IMAGE = '/logo/picc-logo-full.png'
const DEFAULT_TITLE = 'Palm Island Community Company'
const DEFAULT_DESCRIPTION =
  'Manbarra & Bwgcolman Country — community-controlled storytelling, services, and impact.'

interface OgMetaInput {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
}

export function ogMeta(input: OgMetaInput = {}): Metadata {
  const title = input.title || DEFAULT_TITLE
  const description = input.description || DEFAULT_DESCRIPTION
  const url = input.path ? `${SITE_URL}${input.path}` : SITE_URL
  const image = input.image
    ? input.image.startsWith('http')
      ? input.image
      : `${SITE_URL}${input.image}`
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: input.type || 'website',
      siteName: 'Palm Island Community Company',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_AU',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
