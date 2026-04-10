/**
 * PICC Sector Map — Internal info page
 *
 * Shows where PICC sits in the Australian Aboriginal community-controlled
 * organisation ecosystem. Three concentric layers:
 *   1. Local roots (Manbarra, Bwgcolman, Council, members)
 *   2. Sector connections (QAIHC state, NACCHO national health,
 *      SNAICC national child safety) — Rachel's three peak-body roles
 *   3. Sector position (PICC = ACCHO core + multi-service ACCO + community
 *      enterprise group)
 *
 * Internal route at /picc/sector-map. Sourced from
 * PICC-Sector-Context-Deep-Research.md (workshop vault doc #8).
 */

import {
  Target,
  Users,
  Heart,
  Shield,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

export const metadata = {
  title: 'Sector Map — PICC Admin',
  description: 'Where PICC sits in the Australian community-controlled organisation ecosystem — local roots, peak body connections, and sector position.',
}

export const dynamic = 'force-static'

export default function SectorMapPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* ── HEADER ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Internal · Sector Map
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4 leading-tight">
            Where PICC sits in the sector
          </h1>
          <p className="text-lg text-stone-600 max-w-3xl leading-relaxed">
            Three layers, from Palm Island outward: the local roots that give PICC its
            legitimacy, the peak-body connections that give it national reach, and the
            sector position that tells funders and partners what PICC actually is.
          </p>
        </div>

        {/* ── PICC AT THE CENTRE ── */}
        <div className="mb-3">
          <div className="rounded-2xl bg-[#0B4F6C] text-white p-8 md:p-10 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
              Anchor institution
            </p>
            <h2 className="font-serif italic text-3xl md:text-5xl mb-4">
              Palm Island Community Company
            </h2>
            <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed">
              Member-controlled multi-service organisation. ACCHO core. 30 active services,
              197 staff (75%+ Palm Islanders), $23.4M revenue, member-elected board with a
              reserved Manbarra-nominated seat.
            </p>
          </div>
        </div>

        {/* Connector */}
        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-picc-ochre rounded-full w-10 h-10 flex items-center justify-center text-white shadow-lg">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* ── LAYER 1 — LOCAL ROOTS ── */}
        <section className="mb-12">
          <div className="rounded-2xl border-2 border-picc-ochre/30 bg-white p-8 pt-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
              Layer 1
            </p>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Local roots — where the legitimacy comes from</h2>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              PICC is owned and accountable to the Palm Island community. The Manbarra are
              the Traditional Owners. Bwgcolman — &ldquo;many tribes, one people&rdquo; — is
              the name Palm Islanders use for themselves. Together they hold every member
              vote and elect every member-elected director.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <RootCard
                title="Manbarra Traditional Owners"
                role="Reserved board seat"
                body="The traditional owners of the country. Nominate the Traditional Owner director on PICC's board through Manbarra Corporation."
              />
              <RootCard
                title="Bwgcolman community"
                role="Members + voters"
                body="Descendants of people forcibly removed to Palm Island from 70+ Nations across Queensland. Membership is open to Manbarra and Bwgcolman aged 18+."
              />
              <RootCard
                title="Palm Island Aboriginal Shire Council"
                role="Adjacent local government"
                body="Separate body. Was a co-shareholder until the 2021 transition. Now no shareholding role — PICC is community-controlled, not council-controlled."
              />
              <RootCard
                title="Member-elected directors"
                role="Up to 4 of 5–7"
                body="Annual general meeting elects most of the board. Staff cannot be directors. Government officials cannot be directors. No more than one family member at a time."
              />
            </div>
          </div>
        </section>

        {/* Connector */}
        <div className="flex justify-center -mt-6 mb-3 relative z-10">
          <div className="bg-picc-ochre rounded-full w-10 h-10 flex items-center justify-center text-white shadow-lg">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* ── LAYER 2 — PEAK BODIES ── */}
        <section className="mb-12">
          <div className="rounded-2xl border-2 border-stone-300 bg-white p-8 pt-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
              Layer 2
            </p>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Peak bodies — Rachel&apos;s three seats</h2>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              PICC reaches into state health policy, national Aboriginal health, and national
              child safety policy through CEO Rachel Atkinson&apos;s peak-body roles. Rachel
              has led PICC since the 2007 launch — the only CEO in the organisation&apos;s
              history. Her standing in the sector is one of the few things that distinguishes
              PICC from comparable place-based organisations.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <PeakBodyCard
                acronym="QAIHC"
                fullName="Queensland Aboriginal and Islander Health Council"
                role="Deputy Chair"
                scope="State"
                domain="Aboriginal & Islander health"
              />
              <PeakBodyCard
                acronym="NACCHO"
                fullName="National Aboriginal Community Controlled Health Organisation"
                role="Board member"
                scope="National"
                domain="Aboriginal health"
              />
              <PeakBodyCard
                acronym="SNAICC"
                fullName="Secretariat of National Aboriginal and Islander Child Care"
                role="Deputy Chair"
                scope="National"
                domain="Child & family safety"
              />
            </div>
          </div>
        </section>

        {/* Connector */}
        <div className="flex justify-center -mt-6 mb-3 relative z-10">
          <div className="bg-picc-ochre rounded-full w-10 h-10 flex items-center justify-center text-white shadow-lg">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* ── LAYER 3 — SECTOR POSITION ── */}
        <section className="mb-12">
          <div className="rounded-2xl border border-stone-200 bg-white p-8 pt-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-2">
              Layer 3
            </p>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Sector position — what PICC actually is</h2>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              PICC fits the National Agreement on Closing the Gap definition of an Aboriginal
              and/or Torres Strait Islander community-controlled organisation: incorporated,
              not-for-profit, controlled by Aboriginal and Torres Strait Islander people,
              connected to the community, governed by a majority Aboriginal and Torres Strait
              Islander board. But PICC is broader than a single-domain ACCHO. It is a
              multi-service ACCO with an ACCHO core and a community enterprise arm.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <SectorCard
                icon={<Heart className="w-6 h-6" />}
                acronym="ACCHO"
                fullName="Aboriginal Community Controlled Health Organisation"
                fit="Core"
                body="Bwgcolman Healing Service was the community-controlled primary health centre after the 1 July 2021 merger with Queensland Health. 2,283 clients, 17,488 episodes of care in 2023/24. Holistic, culturally informed primary health."
              />
              <SectorCard
                icon={<Users className="w-6 h-6" />}
                acronym="ACCO"
                fullName="Aboriginal Community Controlled Organisation"
                fit="Yes — multi-service"
                body="Health + child and family safety + justice + DFV + disability + aged care + youth + women's services. PICC's constitution authorises all of these. In sector terms this makes PICC unusually broad for a place-based organisation."
              />
              <SectorCard
                icon={<Briefcase className="w-6 h-6" />}
                acronym="CEG"
                fullName="Community Enterprise Group"
                fit="Yes — enterprise arm"
                body="Coffee shop, variety store, automotive business, fuel station, labour hire, Telstra Digital Service Centre (21 FTE, 2024 QLD Training Awards winner). Profits flow back into local employment. More enterprise-oriented than most community-controlled organisations."
              />
            </div>

            <div className="rounded-xl bg-picc-ochre/5 border border-picc-ochre/20 p-5">
              <p className="text-xs font-semibold tracking-wide uppercase text-picc-ochre mb-2">
                In one sentence
              </p>
              <p className="text-stone-700 leading-relaxed">
                PICC is a <strong>community-controlled anchor institution</strong> sitting
                between an ACCHO, a broader ACCO, and a community enterprise group — its
                distinctive strength is that it combines all three under one Palm-based roof.
              </p>
            </div>
          </div>
        </section>

        {/* ── WHAT PICC IS NOT ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            What PICC is not
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <NotCard
              title="Not the Palm Island Aboriginal Shire Council"
              body="Local government and community-controlled service delivery are separate. Council elected officials cannot sit on the PICC board."
            />
            <NotCard
              title="Not a single-issue charity"
              body="PICC's constitution authorises health, social services, training, advocacy, community development, businesses and media. Funders sometimes try to slot PICC into one box — that's a category error."
            />
            <NotCard
              title="Not co-owned by government"
              body="The 2007 model had Queensland Government and Council as shareholders. The 2021 transition transferred those shares out. Members are now Palm Islanders only."
            />
            <NotCard
              title="Not the same as the 2007 entity"
              body="The current PICC is a new company registered June 2020. The old company was renamed Palm Island Holding Company Limited and wound up. Same name, same CEO, same mission — different legal vehicle and different governance."
            />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong className="text-stone-700">Sources:</strong> National Agreement on Closing
            the Gap · QAIHC, NACCHO, SNAICC public records · PICC constitution · Ipsos 2019
            independent evaluation · ACNC charity register · 2007 Queensland Government launch
            statement · archived in PICC-Sector-Context-Deep-Research.md (workshop vault doc
            #8).
          </p>
          <p className="text-xs text-stone-400 mt-2">
            Last sync: 10 April 2026. Update doc #8 first if anything here is wrong.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/picc/governance" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            ← How PICC is governed
          </a>
          <a href="/picc/launchpad" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            The Launchpad strategic plan
          </a>
          <a href="/picc/next-20" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Next-20 working canvas
          </a>
          <a href="/about" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Public about page
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function RootCard({ title, role, body }: { title: string; role: string; body: string }) {
  return (
    <div className="rounded-xl bg-[#FAF8F5] border border-picc-ochre/20 p-5">
      <p className="text-xs font-mono font-bold text-picc-ochre uppercase tracking-wide mb-1">
        {role}
      </p>
      <h3 className="font-semibold text-stone-800 mb-2 leading-tight">{title}</h3>
      <p className="text-xs text-stone-600 leading-relaxed">{body}</p>
    </div>
  )
}

function PeakBodyCard({
  acronym,
  fullName,
  role,
  scope,
  domain,
}: {
  acronym: string
  fullName: string
  role: string
  scope: string
  domain: string
}) {
  return (
    <div className="rounded-xl bg-stone-900 text-white p-6">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-3xl font-bold text-picc-ochre">{acronym}</p>
        <span className="text-[11px] text-white/50 uppercase tracking-wide">{scope}</span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed mb-3">{fullName}</p>
      <div className="border-t border-white/10 pt-3 space-y-1">
        <p className="text-sm text-white font-medium">Rachel Atkinson — {role}</p>
        <p className="text-[11px] text-white/50">{domain}</p>
      </div>
    </div>
  )
}

function SectorCard({
  icon,
  acronym,
  fullName,
  fit,
  body,
}: {
  icon: React.ReactNode
  acronym: string
  fullName: string
  fit: string
  body: string
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-picc-ochre flex-shrink-0">{icon}</div>
        <div>
          <p className="text-lg font-bold text-stone-800">{acronym}</p>
          <p className="text-[11px] text-stone-500 leading-tight">{fullName}</p>
        </div>
      </div>
      <p className="text-xs font-mono font-bold text-picc-ochre uppercase tracking-wide mb-2">
        {fit}
      </p>
      <p className="text-xs text-stone-600 leading-relaxed">{body}</p>
    </div>
  )
}

function NotCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="font-semibold text-stone-800 mb-2">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
    </div>
  )
}
