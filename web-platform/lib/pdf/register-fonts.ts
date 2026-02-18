/**
 * Font registration for React PDF.
 * Must be called once before rendering any PDF document.
 * Uses local TTF files — no CDN dependencies.
 */
import { Font } from '@react-pdf/renderer'
import path from 'path'

let registered = false

export function registerFonts() {
  if (registered) return
  registered = true

  const fontsDir = path.join(process.cwd(), 'lib/pdf/fonts')

  Font.register({
    family: 'Inter',
    fonts: [
      { src: path.join(fontsDir, 'Inter-Regular.ttf'), fontWeight: 'normal' },
      { src: path.join(fontsDir, 'Inter-SemiBold.ttf'), fontWeight: 'semibold' },
      { src: path.join(fontsDir, 'Inter-Bold.ttf'), fontWeight: 'bold' },
    ],
  })

  Font.register({
    family: 'Caveat',
    fonts: [
      { src: path.join(fontsDir, 'Caveat-Regular.ttf'), fontWeight: 'normal' },
      { src: path.join(fontsDir, 'Caveat-Bold.ttf'), fontWeight: 'bold' },
    ],
  })

  Font.register({
    family: 'PlayfairDisplay',
    fonts: [
      { src: path.join(fontsDir, 'PlayfairDisplay-Regular.ttf'), fontWeight: 'normal', fontStyle: 'normal' },
      { src: path.join(fontsDir, 'PlayfairDisplay-Bold.ttf'), fontWeight: 'bold', fontStyle: 'normal' },
      { src: path.join(fontsDir, 'PlayfairDisplay-Italic.ttf'), fontWeight: 'normal', fontStyle: 'italic' },
      { src: path.join(fontsDir, 'PlayfairDisplay-BoldItalic.ttf'), fontWeight: 'bold', fontStyle: 'italic' },
    ],
  })

  // Required for custom fonts — prevents hyphenation issues
  Font.registerHyphenationCallback((word: string) => [word])
}
