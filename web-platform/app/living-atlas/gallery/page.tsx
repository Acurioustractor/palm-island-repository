/**
 * /living-atlas/gallery — paginated browse over the 2,647 consented
 * EL media_assets for PICC.
 *
 * Filters: search text, slot tag, fiscal year, featured-only.
 * Server-rendered with query params; pagination via ?page=.
 */

import Link from 'next/link'
import { ArrowLeft, Search, Image as ImageIcon } from 'lucide-react'
import { getGalleryPage } from '@/lib/empathy-ledger/el-gallery'

export const metadata = {
  title: 'Gallery — Palm Island Living Atlas',
  description:
    'Browse the consented Empathy Ledger v2 media archive for PICC — search by tag, year, or keyword.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{
    page?: string
    q?: string
    slot?: string
    fy?: string
    featured?: string
  }>
}

export default async function GalleryPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(0, parseInt(sp.page ?? '0', 10) || 0)
  const q = (sp.q ?? '').trim()
  const slot = (sp.slot ?? '').trim()
  const fy = (sp.fy ?? '').trim()
  const featured = sp.featured === 'true'

  const result = await getGalleryPage(page, {
    q: q || undefined,
    slot: slot || undefined,
    fy: fy || undefined,
    featured: featured || undefined,
  })

  const photos = result?.photos ?? []
  const total = result?.total ?? 0
  const pageSize = result?.page_size ?? 48
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function pageHref(p: number): string {
    const params = new URLSearchParams()
    if (p > 0) params.set('page', String(p))
    if (q) params.set('q', q)
    if (slot) params.set('slot', slot)
    if (fy) params.set('fy', fy)
    if (featured) params.set('featured', 'true')
    const qs = params.toString()
    return qs ? `/living-atlas/gallery?${qs}` : '/living-atlas/gallery'
  }

  function chipHref(overrides: Record<string, string | undefined>): string {
    const params = new URLSearchParams()
    const merged = { q, slot, fy, featured: featured ? 'true' : '', ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return qs ? `/living-atlas/gallery?${qs}` : '/living-atlas/gallery'
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href="/living-atlas"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-charcoal mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Living Atlas
        </Link>

        <header className="mb-5">
          <div className="text-[11px] uppercase tracking-[0.3em] text-ochre font-bold mb-1">
            Gallery · {total.toLocaleString()} consented photos
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-2">
            Search the archive
          </h1>
          <p className="text-stone-700 text-sm">
            Every photo has passed both Elder approval AND consent capture
            in Empathy Ledger v2. Search alt-text, captions, attributions;
            filter by tag or fiscal year.
          </p>
        </header>

        {/* Search form */}
        <form method="get" action="/living-atlas/gallery" className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-[280px] rounded-md border border-stone-300 bg-white px-3 py-2">
            <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search captions, names, alt-text…"
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
          {slot && <input type="hidden" name="slot" value={slot} />}
          {fy && <input type="hidden" name="fy" value={fy} />}
          {featured && <input type="hidden" name="featured" value="true" />}
          <button
            type="submit"
            className="rounded-md px-4 py-2 font-semibold text-white text-sm"
            style={{ backgroundColor: '#2D5F4F' }}
          >
            Search
          </button>
          {(q || slot || fy || featured) && (
            <Link
              href="/living-atlas/gallery"
              className="text-xs underline text-stone-600"
            >
              Clear all
            </Link>
          )}
        </form>

        {/* Active filters */}
        {(q || slot || fy || featured) && (
          <div className="mb-3 flex flex-wrap gap-1.5 items-center text-xs">
            <span className="text-stone-500">Filtering:</span>
            {q && (
              <Link
                href={chipHref({ q: undefined })}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-stone-100"
              >
                &quot;{q}&quot; <span className="text-stone-400">×</span>
              </Link>
            )}
            {slot && (
              <Link
                href={chipHref({ slot: undefined })}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-stone-100"
              >
                slot: {slot} <span className="text-stone-400">×</span>
              </Link>
            )}
            {fy && (
              <Link
                href={chipHref({ fy: undefined })}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-stone-100"
              >
                year: {fy} <span className="text-stone-400">×</span>
              </Link>
            )}
            {featured && (
              <Link
                href={chipHref({ featured: undefined })}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-stone-100"
              >
                featured only <span className="text-stone-400">×</span>
              </Link>
            )}
          </div>
        )}

        {/* Filter chips available from this page */}
        {(result?.available_slots.length || result?.available_years.length) && (
          <div className="mb-4 space-y-2">
            {result?.available_slots && result.available_slots.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[11px]">
                <span className="text-stone-500 mr-1">Slots on this page:</span>
                {result.available_slots.slice(0, 12).map((s) => (
                  <Link
                    key={s}
                    href={chipHref({ slot: s })}
                    className={
                      'rounded-full px-2 py-0.5 ' +
                      (slot === s
                        ? 'bg-sage-200 text-sage-900 font-semibold'
                        : 'bg-stone-100 hover:bg-stone-200')
                    }
                    style={
                      slot === s
                        ? { backgroundColor: '#E7EFE4', color: '#2D5F4F' }
                        : {}
                    }
                  >
                    {s}
                  </Link>
                ))}
              </div>
            )}
            {result?.available_years && result.available_years.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[11px]">
                <span className="text-stone-500 mr-1">Years:</span>
                {result.available_years
                  // Filter to valid PICC fiscal-year tokens (YYYY-YY where
                  // year is 2007..current). Some media_assets rows carry
                  // garbage values like "9368-03" — keep them out of the UI.
                  .filter((y) => /^20\d{2}-\d{2}$/.test(y))
                  .map((y) => (
                  <Link
                    key={y}
                    href={chipHref({ fy: y })}
                    className="rounded-full px-2 py-0.5 bg-stone-100 hover:bg-stone-200"
                    style={
                      fy === y
                        ? { backgroundColor: '#E7EFE4', color: '#2D5F4F', fontWeight: 600 }
                        : {}
                    }
                  >
                    {y}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        {photos.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <div className="font-serif text-base mb-1 inline-flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              No photos match these filters
            </div>
            <p className="text-sm">
              Try clearing the filters above or broadening your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {photos.map((p) => (
              <figure
                key={p.id}
                className="rounded-md overflow-hidden bg-stone-100 border border-stone-200 group relative"
              >
                <img
                  src={p.thumbnail_url ?? p.url}
                  alt={p.alt_text ?? ''}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
                {p.is_featured && (
                  <span
                    className="absolute top-1 right-1 text-[8.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: '#D4A373' }}
                  >
                    ★ featured
                  </span>
                )}
                {(p.alt_text || p.caption || p.attribution) && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition">
                    {p.alt_text ?? p.caption ?? p.attribution}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-between text-sm">
            {page > 0 ? (
              <Link
                href={pageHref(page - 1)}
                className="rounded-md border border-stone-300 px-3 py-1.5 hover:bg-stone-50"
              >
                ← Prev
              </Link>
            ) : (
              <span />
            )}
            <span className="text-stone-600">
              Page {page + 1} of {totalPages} · {total.toLocaleString()} photos
            </span>
            {page + 1 < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="rounded-md border border-stone-300 px-3 py-1.5 hover:bg-stone-50"
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
          <div className="text-[10px] uppercase tracking-wide text-ochre font-semibold mb-2">
            Consent gate
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            Every photo in this gallery passed two explicit gates in
            Empathy Ledger v2: <strong>elder_approved=true</strong> AND{' '}
            <strong>consent_obtained=true</strong>. Anything that did not
            stays out of the Atlas, counted in the Permissions panel as
            restricted-by-community-choice.
          </p>
        </section>
      </div>
    </div>
  )
}
