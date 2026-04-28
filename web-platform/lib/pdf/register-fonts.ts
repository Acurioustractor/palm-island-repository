/**
 * Font registration for React PDF.
 * Must be awaited once before rendering any PDF document.
 *
 * Strategy: TTFs live on EL v2 Supabase Storage. On first call we prefetch
 * all 11 files in parallel and write them to /tmp/picc-pdf-fonts/ on the
 * lambda filesystem, then pass the file paths to Font.register.
 *
 * Why this shape:
 * - Filesystem reads from the project root aren't traced by Next.js into
 *   the /var/task bundle (outputFileTracingIncludes is unreliable here).
 * - Direct URL src causes React-PDF to do 11 serial HTTPS fetches inside
 *   render, blowing the lambda duration budget.
 * - Data URL (`data:font/ttf;base64,…`) src path uses atob+split+map which
 *   is O(n) with huge string allocations; 11 × 330KB TTFs hangs the
 *   lambda for minutes.
 * - Filesystem paths hit React-PDF's fontkit.open() branch which is fast.
 *
 * /tmp on Vercel Lambda is 512 MB writable ephemeral storage — persists
 * for the container lifetime, so only the first request in a container
 * pays the prefetch cost.
 */
import { Font } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'
import os from 'os'

const FONT_HOST = 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/profile-images/picc-pdf-fonts'

// PlayfairDisplay was previously registered but its bold variant fails to
// embed reliably in React-PDF (Adobe font-extraction errors at open time).
// Saltwater Almanac uses the brand's two-font rule: Caveat + Inter only.
const FONT_FILES = [
  'Inter-Regular.ttf',
  'Inter-SemiBold.ttf',
  'Inter-Bold.ttf',
  'Inter-Italic.ttf',
  'Inter-BoldItalic.ttf',
  'Caveat-Regular.ttf',
  'Caveat-Bold.ttf',
] as const

type FontName = (typeof FONT_FILES)[number]

let registrationPromise: Promise<void> | null = null
const FONT_DIR = path.join(os.tmpdir(), 'picc-pdf-fonts')

async function ensureFont(name: FontName): Promise<string> {
  const dest = path.join(FONT_DIR, name)
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) return dest
  const res = await fetch(`${FONT_HOST}/${name}`)
  if (!res.ok) throw new Error(`Font fetch failed: ${name} (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(dest, buf)
  return dest
}

async function registerAll(): Promise<void> {
  fs.mkdirSync(FONT_DIR, { recursive: true })
  const paths = Object.fromEntries(
    await Promise.all(FONT_FILES.map(async (n) => [n, await ensureFont(n)] as const)),
  ) as Record<FontName, string>

  Font.register({
    family: 'Inter',
    fonts: [
      { src: paths['Inter-Regular.ttf'], fontWeight: 'normal', fontStyle: 'normal' },
      { src: paths['Inter-SemiBold.ttf'], fontWeight: 'semibold', fontStyle: 'normal' },
      { src: paths['Inter-Bold.ttf'], fontWeight: 'bold', fontStyle: 'normal' },
      { src: paths['Inter-Italic.ttf'], fontWeight: 'normal', fontStyle: 'italic' },
      { src: paths['Inter-BoldItalic.ttf'], fontWeight: 'bold', fontStyle: 'italic' },
    ],
  })

  Font.register({
    family: 'Caveat',
    fonts: [
      { src: paths['Caveat-Regular.ttf'], fontWeight: 'normal' },
      { src: paths['Caveat-Bold.ttf'], fontWeight: 'bold' },
    ],
  })

  Font.registerHyphenationCallback((word: string) => [word])
}

/**
 * Must be awaited before rendering any PDF. Idempotent and cached per
 * lambda container — only the first call does the network fetches.
 */
export function registerFonts(): Promise<void> {
  if (!registrationPromise) registrationPromise = registerAll()
  return registrationPromise
}
