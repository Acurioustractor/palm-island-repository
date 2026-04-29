#!/usr/bin/env -S npx tsx
/**
 * Pencil → DTCG token sync.
 *
 * Reads `tokens/pencil-variables.json` (snapshot of `mcp__pencil__get_variables`
 * against picc-almanac-web.pen) and emits `tokens/picc.tokens.json` in the
 * DTCG format Style Dictionary v4 consumes.
 *
 * Workflow:
 *   1. In Claude / Pencil session, run `mcp__pencil__get_variables` and copy
 *      the variables map into `tokens/pencil-variables.json` (already wired —
 *      just rerun this script after editing in Pencil).
 *   2. `npm run tokens:sync` → produces tokens/picc.tokens.json.
 *   3. Style Dictionary build (`npm run tokens:build`) emits Tailwind, PDF,
 *      and CSS files from the DTCG source.
 *
 * The grouping below maps Pencil's flat name space to DTCG semantic groups:
 *   ocean, ochre, …       → color.brand.<name>
 *   sectionHealth, …      → color.section.<name>     (section-room palette)
 *   sp-xs, sp-md, …       → spacing.<size>
 *   type-body, type-h1, … → typography.fontSize.<size>
 *   fontBody / Display    → typography.fontFamily.<role>
 */
import fs from 'node:fs'
import path from 'node:path'

interface PencilVar {
  type: 'color' | 'number' | 'string' | 'boolean'
  value: string | number | boolean
}

interface PencilSnapshot {
  _meta?: Record<string, string>
  [key: string]: PencilVar | Record<string, string> | undefined
}

const ROOT = path.resolve(__dirname, '..')
const SOURCE = path.join(ROOT, 'tokens/pencil-variables.json')
const OUTPUT = path.join(ROOT, 'tokens/picc.tokens.json')

const BRAND_COLORS = [
  'ocean', 'ochre', 'earth', 'coral', 'mangrove', 'reef', 'starGold', 'turtleRed',
  'midnight', 'rock', 'driftwood', 'muted', 'sand', 'shell', 'white', 'border',
] as const

const NEUTRAL_COLORS = ['page-bg'] as const

const SECTION_ROOMS = [
  'sectionEconomic', 'sectionEducation', 'sectionFamily',
  'sectionGovernance', 'sectionHealth', 'sectionJustice', 'sectionYouth',
] as const

const SPACING_SIZES: Record<string, string> = {
  'sp-xs': 'xs', 'sp-sm': 'sm', 'sp-md': 'md', 'sp-lg': 'lg',
  'sp-xl': 'xl', 'sp-xxl': 'xxl', 'sp-xxxl': 'xxxl', 'sp-hero': 'hero',
}

const TYPE_SIZES: Record<string, string> = {
  'type-tiny': 'tiny', 'type-eyebrow': 'eyebrow', 'type-caption': 'caption',
  'type-body': 'body', 'type-h3': 'h3', 'type-h2': 'h2', 'type-h1': 'h1',
  'type-stat': 'stat', 'type-display': 'display', 'type-hero': 'hero',
}

const TYPE_FAMILIES: Record<string, string> = {
  fontBody: 'body', fontDisplay: 'display', fontHand: 'hand',
}

function dtcg(value: unknown, type: string) {
  return { $value: value, $type: type }
}

function build(snapshot: PencilSnapshot) {
  const get = (k: string) => {
    const v = snapshot[k]
    if (!v || typeof v !== 'object' || !('value' in v)) {
      throw new Error(`Missing variable: ${k}`)
    }
    return v.value
  }

  const tokens: Record<string, any> = {
    color: {
      brand: {} as Record<string, any>,
      neutral: {} as Record<string, any>,
      section: {} as Record<string, any>,
    },
    spacing: {} as Record<string, any>,
    typography: {
      fontSize: {} as Record<string, any>,
      fontFamily: {} as Record<string, any>,
    },
  }

  for (const k of BRAND_COLORS) tokens.color.brand[k] = dtcg(get(k), 'color')
  for (const k of NEUTRAL_COLORS) tokens.color.neutral[k.replace('-', '_')] = dtcg(get(k), 'color')
  for (const k of SECTION_ROOMS) {
    const short = k.replace(/^section/, '').toLowerCase()
    tokens.color.section[short] = dtcg(get(k), 'color')
  }
  for (const [pencilKey, dtcgKey] of Object.entries(SPACING_SIZES)) {
    tokens.spacing[dtcgKey] = dtcg(get(pencilKey), 'dimension')
  }
  for (const [pencilKey, dtcgKey] of Object.entries(TYPE_SIZES)) {
    tokens.typography.fontSize[dtcgKey] = dtcg(get(pencilKey), 'dimension')
  }
  for (const [pencilKey, dtcgKey] of Object.entries(TYPE_FAMILIES)) {
    tokens.typography.fontFamily[dtcgKey] = dtcg(get(pencilKey), 'fontFamily')
  }

  return tokens
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`✗ ${SOURCE} not found. Run mcp__pencil__get_variables and snapshot the result.`)
    process.exit(1)
  }
  const snapshot: PencilSnapshot = JSON.parse(fs.readFileSync(SOURCE, 'utf-8'))
  const tokens = build(snapshot)
  const out = {
    $schema: 'https://design-tokens.github.io/community-group/format/',
    _meta: snapshot._meta,
    ...tokens,
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + '\n', 'utf-8')
  console.log(`✓ wrote ${path.relative(ROOT, OUTPUT)}`)
}

main()
