/**
 * Font registration for React PDF.
 * Must be awaited once before rendering any PDF document.
 *
 * Strategy: TTFs live on EL v2 Supabase Storage (public bucket). On first
 * call we prefetch all 11 files in parallel, cache them in module scope,
 * convert each to a base64 data URL, and pass to Font.register. React-PDF
 * accepts data URL strings and parses them synchronously during render.
 *
 * Why not filesystem: Next.js doesn't trace path.join(process.cwd(), …)
 * reads, so TTFs are missing from the /var/task lambda bundle.
 *
 * Why not direct URL src: React-PDF fetches each URL serially during
 * render, pushing the lambda over its duration budget. Prefetching at
 * registration is ~10x faster.
 */
import { Font } from '@react-pdf/renderer'

const FONT_HOST = 'https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/profile-images/picc-pdf-fonts'

const FONT_FILES = [
  'Inter-Regular.ttf',
  'Inter-SemiBold.ttf',
  'Inter-Bold.ttf',
  'Inter-Italic.ttf',
  'Inter-BoldItalic.ttf',
  'Caveat-Regular.ttf',
  'Caveat-Bold.ttf',
  'PlayfairDisplay-Regular.ttf',
  'PlayfairDisplay-Bold.ttf',
  'PlayfairDisplay-Italic.ttf',
  'PlayfairDisplay-BoldItalic.ttf',
] as const

type FontName = (typeof FONT_FILES)[number]

let registrationPromise: Promise<void> | null = null
const cache = new Map<FontName, string>()

async function fetchFontDataUrl(name: FontName): Promise<string> {
  const cached = cache.get(name)
  if (cached) return cached
  const res = await fetch(`${FONT_HOST}/${name}`)
  if (!res.ok) throw new Error(`Font fetch failed: ${name} (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  const url = `data:font/ttf;base64,${buf.toString('base64')}`
  cache.set(name, url)
  return url
}

async function registerAll(): Promise<void> {
  const [
    interRegular, interSemiBold, interBold, interItalic, interBoldItalic,
    caveatRegular, caveatBold,
    playfairRegular, playfairBold, playfairItalic, playfairBoldItalic,
  ] = await Promise.all(FONT_FILES.map(fetchFontDataUrl))

  Font.register({
    family: 'Inter',
    fonts: [
      { src: interRegular, fontWeight: 'normal', fontStyle: 'normal' },
      { src: interSemiBold, fontWeight: 'semibold', fontStyle: 'normal' },
      { src: interBold, fontWeight: 'bold', fontStyle: 'normal' },
      { src: interItalic, fontWeight: 'normal', fontStyle: 'italic' },
      { src: interBoldItalic, fontWeight: 'bold', fontStyle: 'italic' },
    ],
  })

  Font.register({
    family: 'Caveat',
    fonts: [
      { src: caveatRegular, fontWeight: 'normal' },
      { src: caveatBold, fontWeight: 'bold' },
    ],
  })

  Font.register({
    family: 'PlayfairDisplay',
    fonts: [
      { src: playfairRegular, fontWeight: 'normal', fontStyle: 'normal' },
      { src: playfairBold, fontWeight: 'bold', fontStyle: 'normal' },
      { src: playfairItalic, fontWeight: 'normal', fontStyle: 'italic' },
      { src: playfairBoldItalic, fontWeight: 'bold', fontStyle: 'italic' },
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
