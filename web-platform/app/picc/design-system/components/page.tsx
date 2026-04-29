/**
 * /picc/design-system/components — live gallery for the components/library/.
 *
 * Server-imports each library/&lt;Name&gt;/{sample,meta} and renders the sample
 * inside a card with title, description, and Pencil deep link. Replaces
 * Storybook for our team size.
 *
 * Adding a component to the gallery: just create components/library/&lt;Name&gt;/
 * and add the name to LIBRARY in components/library/registry.ts. No edits here.
 */
import Link from 'next/link'
import { LIBRARY, type ComponentMeta } from '@/components/library/registry'

import StatHeroSample from '@/components/library/StatHero/sample'
import { meta as StatHeroMeta } from '@/components/library/StatHero/meta'

export const metadata = {
  title: 'Components — PICC Design System',
  description: 'Live gallery of every reusable component in the library.',
}

interface Entry {
  meta: ComponentMeta
  Sample: () => JSX.Element
}

const ENTRIES: Record<string, Entry> = {
  StatHero: { meta: StatHeroMeta, Sample: StatHeroSample },
}

const CATEGORIES = ['almanac', 'annual-report', 'museum-element', 'primitive', 'form', 'nav'] as const

const CATEGORY_LABEL: Record<string, string> = {
  almanac: 'Almanac',
  'annual-report': 'Annual Report',
  'museum-element': 'Museum Element',
  primitive: 'Primitive',
  form: 'Form',
  nav: 'Navigation',
}

export default function ComponentGalleryPage() {
  const entries = LIBRARY.map((name) => ENTRIES[name]).filter(Boolean)

  const byCategory = new Map<string, Entry[]>()
  for (const e of entries) {
    const arr = byCategory.get(e.meta.category) ?? []
    arr.push(e)
    byCategory.set(e.meta.category, arr)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Internal · Design System · Components
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-3">
          Component Library
        </h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          Every reusable component in <code>components/library/</code>, rendered
          live with sample data. Each ships in {' '}
          <code>web.tsx</code> + (optionally) <code>pdf.tsx</code> from the same{' '}
          <code>types.ts</code>. Source of truth: Pencil →{' '}
          <code>tokens/picc.tokens.json</code> → Style Dictionary → tokens.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Stat label="Components" value={entries.length} />
        <Stat label="Web impls" value={entries.filter((e) => e.meta.implementations.includes('web')).length} />
        <Stat label="PDF impls" value={entries.filter((e) => e.meta.implementations.includes('pdf')).length} />
        <Stat label="Categories" value={byCategory.size} />
      </div>

      {CATEGORIES.map((cat) => {
        const list = byCategory.get(cat)
        if (!list || list.length === 0) return null
        list.sort((a, b) => (a.meta.sortOrder ?? 100) - (b.meta.sortOrder ?? 100))
        return (
          <section key={cat}>
            <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-stone-500 mb-4 border-b border-stone-200 pb-2">
              {CATEGORY_LABEL[cat]} · {list.length}
            </h2>
            <div className="space-y-8">
              {list.map(({ meta, Sample }) => (
                <article
                  key={meta.name}
                  className="rounded-xl border border-stone-200 bg-white overflow-hidden"
                >
                  <header className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-serif text-xl text-stone-800">{meta.name}</h3>
                      <p className="text-sm text-stone-600 max-w-2xl mt-1">{meta.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-stone-500">
                      <div className="flex gap-1">
                        {meta.implementations.map((impl) => (
                          <span
                            key={impl}
                            className={`px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px] font-semibold ${
                              impl === 'web'
                                ? 'bg-sky-100 text-sky-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {impl}
                          </span>
                        ))}
                      </div>
                      {meta.pencilNodeId && (
                        <code className="text-[10px] text-stone-400">
                          Pencil · {meta.pencilFile}#{meta.pencilNodeId}
                        </code>
                      )}
                    </div>
                  </header>
                  <div className="p-6 bg-page-bg">
                    <Sample />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      })}

      {entries.length === 0 && (
        <div className="text-center py-16 text-stone-500 border-2 border-dashed border-stone-200 rounded-xl">
          No components yet. Run <code>npx tsx scripts/scaffold-component.ts &lt;Name&gt;</code> and add it to the registry.
        </div>
      )}

      <footer className="border-t border-stone-200 pt-6 text-sm text-stone-500 leading-relaxed">
        <p>
          <strong>Add a component:</strong>{' '}
          <code>npx tsx scripts/scaffold-component.ts &lt;Name&gt;</code>, fill in the
          5 stub files, add the name to <code>LIBRARY</code> in{' '}
          <code>components/library/registry.ts</code>, and register the import map at the top
          of this file. Component shows up here automatically.
        </p>
        <p className="mt-2">
          <Link href="/picc/design-system" className="text-picc-ochre hover:underline">
            ← back to design-system voting
          </Link>
        </p>
      </footer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-stone-500">{label}</div>
      <div className="font-serif text-2xl text-stone-800 mt-0.5">{value}</div>
    </div>
  )
}
