/**
 * Asset resolver for React-PDF Image src.
 *
 * On the server (API routes, lambda), React-PDF cannot fetch from a relative
 * path like "/icons/picc/foo.png" — it needs an absolute URL. This helper
 * wraps assetUrl() and adds the host prefix when the result is still relative.
 *
 * Usage:
 *   <Image src={resolveAsset('/icons/picc/infographics/01-saltwater-rings.png')} />
 */
import { assetUrl } from '@/lib/media/asset-url'

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT || 3000}`
}

export function resolveAsset(path: string): string {
  const resolved = assetUrl(path)
  // Already absolute (Supabase Storage URL) — pass through
  if (/^https?:\/\//i.test(resolved)) return resolved
  // Site-relative — prepend host
  const ensured = resolved.startsWith('/') ? resolved : `/${resolved}`
  return `${getBaseUrl()}${ensured}`
}
