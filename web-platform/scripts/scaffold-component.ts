#!/usr/bin/env -S npx tsx
/**
 * Scaffold a new library component.
 *
 *   npx tsx scripts/scaffold-component.ts <Name> [--no-pdf]
 *
 * Emits:
 *   components/library/<Name>/
 *     ├── web.tsx
 *     ├── pdf.tsx     (omit with --no-pdf)
 *     ├── sample.tsx
 *     ├── types.ts
 *     └── meta.ts
 *
 * Stubs reference the generated token modules so callers start with the
 * right import shape and don't accidentally hardcode colours.
 */
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const name = args.find((a) => !a.startsWith('-'))
const includePdf = !args.includes('--no-pdf')

if (!name || !/^[A-Z][A-Za-z0-9]+$/.test(name)) {
  console.error('Usage: scaffold-component.ts <PascalCaseName> [--no-pdf]')
  process.exit(1)
}

const ROOT = path.resolve(__dirname, '..')
const dir = path.join(ROOT, 'components/library', name)
if (fs.existsSync(dir)) {
  console.error(`✗ ${dir} already exists`)
  process.exit(1)
}
fs.mkdirSync(dir, { recursive: true })

const files: Record<string, string> = {
  'types.ts': `/** Props for <${name}>. Shared between web.tsx and pdf.tsx. */
export interface ${name}Props {
  // TODO: define props
  label: string
}
`,

  'web.tsx': `import type { ${name}Props } from './types'

export function ${name}({ label }: ${name}Props) {
  return (
    <div className="rounded-lg bg-brand-shell p-md text-brand-rock">
      {label}
    </div>
  )
}
`,

  'sample.tsx': `import { ${name} } from './web'
import type { ${name}Props } from './types'

export const sampleProps: ${name}Props = {
  label: '${name} sample',
}

export default function Sample() {
  return <${name} {...sampleProps} />
}
`,

  'meta.ts': `import type { ComponentMeta } from '../registry'

export const meta: ComponentMeta = {
  name: '${name}',
  description: 'TODO: one-paragraph what + when to use.',
  pencilFile: 'picc-almanac-web.pen',
  pencilNodeId: undefined,        // fill once the Pencil component is wired up
  category: 'almanac',
  implementations: ${includePdf ? "['web', 'pdf']" : "['web']"},
  sortOrder: 100,
}
`,
}

if (includePdf) {
  files['pdf.tsx'] = `import { Text, View, StyleSheet } from '@react-pdf/renderer'
import { C, SP } from '@/lib/pdf/theme'
import type { ${name}Props } from './types'

const styles = StyleSheet.create({
  root: {
    backgroundColor: C.shell,
    padding: SP.md,
    color: C.rock,
    borderRadius: 8,
  },
})

export function ${name}Pdf({ label }: ${name}Props) {
  return (
    <View style={styles.root}>
      <Text>{label}</Text>
    </View>
  )
}
`
}

for (const [fname, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, fname), content, 'utf-8')
}

console.log(`✓ scaffolded components/library/${name}/`)
console.log(`  - types.ts, web.tsx, sample.tsx, meta.ts${includePdf ? ', pdf.tsx' : ''}`)
console.log(`  - next: fill in props, edit web.tsx, add to LIBRARY in components/library/registry.ts`)
