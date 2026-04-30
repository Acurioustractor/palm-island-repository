import Link from 'next/link'
import {
  LayoutDashboard,
  Compass,
  Target,
  Landmark,
  Network,
  TrendingUp,
  AlertTriangle,
  Library,
  Quote,
  Activity,
  FolderOpen,
  FolderKanban,
  FileText,
  Settings,
  Palette,
  Inbox,
} from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase/client'

export const metadata = {
  title: 'PICC Admin',
  description: 'Internal admin hub — all PICC admin surfaces in one place.',
}

export const dynamic = 'force-dynamic'

async function getInboxCount(): Promise<number> {
  try {
    const supabase = createServerSupabase()
    const [art, questions, stories] = await Promise.all([
      supabase
        .from('media_files')
        .select('id', { count: 'exact', head: true })
        .eq('page_context', 'community-art')
        .eq('is_public', false)
        .is('deleted_at', null),
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .filter('metadata->>is_question', 'eq', 'true')
        .filter('metadata->>question_status', 'eq', 'open')
        .is('deleted_at', null),
      supabase
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'submitted')
        .eq('is_public', false)
        .or('metadata->>is_question.is.null,metadata->>is_question.eq.false')
        .is('deleted_at', null),
    ])
    return (art.count || 0) + (questions.count || 0) + (stories.count || 0)
  } catch {
    return 0
  }
}

const PAGES = [
  {
    group: 'Strategy & Vision',
    items: [
      { href: '/picc/dashboard', icon: LayoutDashboard, label: 'Dashboard', sub: 'Content readiness + EL stats' },
      { href: '/picc/launchpad', icon: Target, label: 'Launchpad', sub: '20-year strategic plan' },
      { href: '/picc/next-20', icon: Compass, label: 'Next-20 Canvas', sub: '6 visions + commitments + asks' },
    ],
  },
  {
    group: 'Organisation',
    items: [
      { href: '/picc/governance', icon: Landmark, label: 'Governance', sub: 'Board design + guardrails' },
      { href: '/picc/sector-map', icon: Network, label: 'Sector Map', sub: '3-layer ecosystem view' },
      { href: '/picc/finances', icon: TrendingUp, label: 'Finances', sub: '16-year curve + breakdown' },
      { href: '/picc/risks', icon: AlertTriangle, label: 'Risks', sub: '8 structural pressures' },
    ],
  },
  {
    group: 'Knowledge & Voices',
    items: [
      { href: '/picc/inbox', icon: Inbox, label: 'Inbox', sub: 'Pending art / questions / stories — unified triage' },
      { href: '/picc/library', icon: Library, label: 'Library', sub: 'Publications + research + EL connections' },
      { href: '/picc/voices', icon: Quote, label: 'Voices', sub: '452 voices + capture sprint' },
      { href: '/picc/impact', icon: Activity, label: 'Impact', sub: 'Service-level metrics' },
    ],
  },
  {
    group: 'Operational',
    items: [
      { href: '/picc/services', icon: FolderOpen, label: 'Services', sub: '30 active services' },
      { href: '/picc/projects', icon: FolderKanban, label: 'Projects', sub: '9 projects' },
      { href: '/picc/reports/builder', icon: FileText, label: 'Report Builder', sub: 'Audience-targeted PDF' },
      { href: '/picc/design-system', icon: Palette, label: 'Design System', sub: '103 elements · vote + curate' },
      { href: '/picc/design-system/components', icon: Palette, label: 'Component Library', sub: 'Live gallery · web + pdf + Pencil sources' },
      { href: '/picc/almanac/photos', icon: FileText, label: 'Almanac Photos', sub: 'Every slot · live from EL v2 · swap' },
      { href: '/picc/almanac/checklist', icon: FileText, label: 'Almanac Checklist', sub: 'Every blocker before publish · readiness %' },
      { href: '/picc/almanac/voices', icon: Quote, label: 'Almanac Voices', sub: '20-voice sprint tracker + consent' },
      { href: '/picc/almanac/preview', icon: FileText, label: 'Almanac Preview', sub: 'Full page · flag overlays · sticky chrome' },
      { href: '/picc/almanac/services-coverage', icon: FolderOpen, label: 'Services Coverage', sub: 'Per-service photos · voices · copy traffic-light' },
    ],
  },
]

export default async function PICCIndexPage() {
  const inboxCount = await getInboxCount()
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
          Internal · Admin Hub
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800 italic mb-3">
          PICC Admin
        </h1>
        <p className="text-stone-600 max-w-2xl leading-relaxed">
          Every internal surface in one place. Strategy, governance, finances, risks,
          knowledge, voices, services, projects, and the report builder.
        </p>
      </div>

      <div className="space-y-8">
        {PAGES.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 mb-3">
              {group.group}
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 hover:border-picc-ochre/50 hover:shadow-sm transition-all"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-picc-ochre/10 flex items-center justify-center text-picc-ochre group-hover:bg-picc-ochre group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 text-sm group-hover:text-picc-ochre transition-colors flex items-center gap-2">
                        {item.label}
                        {item.href === '/picc/inbox' && inboxCount > 0 && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-picc-ochre text-white text-[10px] font-bold">
                            {inboxCount}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        {item.sub}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-stone-100">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-stone-400 mb-3">
          Public-facing pages
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About' },
            { href: '/bwgcolman', label: 'Bwgcolman Way' },
            { href: '/services', label: 'Services' },
            { href: '/20-years', label: '20 Years' },
            { href: '/elders', label: 'Elders' },
            { href: '/impact', label: 'Impact' },
            { href: '/annual-report/live', label: 'Annual Report' },
            { href: '/publications', label: 'Publications' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs hover:bg-stone-200 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
