import Link from 'next/link'
import {
  Camera,
  Film,
  BookOpen,
  Building,
  Monitor,
  GraduationCap,
  Users,
  Globe,
  MapPin,
  Calendar,
  Award,
  Shield,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'

export const metadata = {
  title: 'Voices on Country — Elders Project | PICC',
  description:
    'A 36-month Elder-led program of cultural knowledge journeys, language conservation, and photographic exhibition based on Palm Island.',
}

export default function VoicesOnCountryPage() {
  return (
    <main className="min-h-screen">
      {/* ──────────────── Section 1: Hero ──────────────── */}
      <section className="relative bg-gradient-to-br from-picc-earth to-picc-red py-28 px-6 lg:px-8 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <span className="mb-6 inline-block rounded-full border border-white/30 bg-white/10 px-5 py-1.5 text-xs font-medium uppercase tracking-widest">
            Funded by Indigenous Languages and Arts Program
          </span>
          <h1 className="mt-4 text-5xl font-light tracking-wide sm:text-6xl lg:text-7xl">
            VOICES ON COUNTRY
          </h1>
          <p className="mt-6 text-xl font-light text-white/90 sm:text-2xl">
            A 36-Month Elder-Led Cultural Knowledge Journey
          </p>
          <p className="mt-2 text-base text-white/70">
            Palm Island Community Company &nbsp;|&nbsp; ILA Grant 2026&ndash;2029
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/elders#elders"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-picc-earth transition hover:bg-warm-100"
            >
              Meet the Elders <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/immersive-stories/elders-trips-story"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Read the Trip Story <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── Section 2: The Vision ──────────────── */}
      <section className="bg-white py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-picc-ochre">
            The Project
          </p>
          <h2 className="mt-3 text-4xl font-light text-picc-earth">
            Preserving culture through return-to-Country journeys
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-stone-700">
            <p>
              Palm Island is home to the Bwgcolman people, descendants of over 57 Aboriginal
              and Torres Strait Islander language groups forcibly removed to the island across
              the twentieth century. The Elders who live here today carry languages, stories,
              and cultural knowledge from communities stretching across Queensland and beyond.
            </p>
            <p>
              <strong>Voices on Country</strong> undertakes two major return-to-Country
              journeys &mdash; the Atherton Tablelands in Year&nbsp;1 and Central Australia in
              Year&nbsp;2 &mdash; recording oral histories, language, and cultural knowledge
              through photography, video, and audio on Country. The resulting exhibitions,
              language resources, and digital archive will ensure this knowledge is preserved,
              celebrated, and returned to the community on its own terms.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { value: '36', label: 'Months' },
              { value: '2', label: 'Major Journeys' },
              { value: '8+', label: 'Elders' },
              { value: '57+', label: 'Language Groups' },
              { value: '$600K', label: 'Investment' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-stone-200 bg-warm-100/40 px-4 py-6 text-center"
              >
                <p className="text-3xl font-semibold text-picc-earth">{stat.value}</p>
                <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── Section 3: Three Year Roadmap ──────────────── */}
      <section className="bg-[#FEF3C7] py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-picc-ochre">
            Roadmap
          </p>
          <h2 className="mt-3 text-center text-4xl font-light text-picc-earth">
            Three Year Journey
          </h2>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {/* Year 1 */}
            <RoadmapYear
              year="Year 1"
              period="2026-27"
              title="Tablelands Journey"
              milestones={[
                { date: 'Sep 2026', text: 'Mobilisation & Elders Room installation' },
                {
                  date: 'Nov 2026',
                  text: 'Atherton Tablelands journey — 10-day return-to-Country: Mareeba, Ravenshoe, Herberton, Millaa Millaa',
                },
                {
                  date: 'Jan 2027',
                  text: '200+ photographs, 10-15 short interview videos, audio language recordings',
                },
                {
                  date: 'Mar 2027',
                  text: 'Post-production: curated photo series, draft short films, Manbarra language word list',
                },
                { date: 'Jun 2027', text: 'Community Exhibition 1 on Palm Island' },
              ]}
              deliverables="Exhibition 1, language resource v1, short films screened"
            />

            {/* Year 2 */}
            <RoadmapYear
              year="Year 2"
              period="2027-28"
              title="Central Australia Journey"
              milestones={[
                {
                  date: 'Sep 2027',
                  text: 'Planning with Bloomfield family at Atnarpa homestead',
                },
                {
                  date: 'Nov 2027',
                  text: 'Central Australia journey — 10-day Elder-led trip, cross-cultural exchange with Oonchiumpa youth program',
                },
                { date: 'Dec 2027', text: 'Live exhibition at Atnarpa' },
                {
                  date: 'Mar 2028',
                  text: 'Post-production 2: curated photos, updated Manbarra resource, Exhibition 2',
                },
                { date: 'Jun 2028', text: 'Community Exhibition 2 on Palm Island' },
              ]}
              deliverables="Exhibition 2, updated language resource, cross-cultural exchange documented"
            />

            {/* Year 3 */}
            <RoadmapYear
              year="Year 3"
              period="2028-29"
              title="Legacy"
              milestones={[
                {
                  date: 'Sep 2028',
                  text: 'Printed Manbarra language resource (250 copies), audio pronunciation guide',
                },
                { date: 'Nov 2028', text: 'School program integration' },
                {
                  date: 'Jan 2029',
                  text: 'Mukurtu-based sovereign digital archive — operational on Palm Island',
                },
                {
                  date: 'Apr 2029',
                  text: 'Major Combined Touring Exhibition — Palm Island launch, Tablelands touring, Central Australia touring',
                },
                {
                  date: 'Jun 2029',
                  text: 'Completion & Legacy: final report, sustainability plan, exhibition assets retained by community',
                },
              ]}
              deliverables="Touring exhibition, printed language resource, Mukurtu archive, school program"
            />
          </div>
        </div>
      </section>

      {/* ──────────────── Section 4: The Team ──────────────── */}
      <section className="bg-picc-earth py-20 px-6 lg:px-8 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-picc-ochre">
            The Team
          </p>
          <h2 className="mt-3 text-center text-4xl font-light">Who is leading this work</h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TeamCard
              role="CEO — Project Governance"
              name="Rachel Atkinson"
              description="Yorta Yorta woman, CEO of PICC since 2007, SNAICC Board Director. Oversees project governance and organisational accountability."
            />
            <TeamCard
              role="Cultural Authority"
              name="Allan Palm Island"
              description="Manbarra Traditional Owner, PICC Director, Master of Fine Arts (RMIT). Custodian of cultural protocols for all recorded content."
            />
            <TeamCard
              role="Creative Producer"
              name="Benjamin Knight"
              description="Photography, videography, exhibition design. Leads the Empathy Ledger platform and all creative production across both journeys."
            />
            <TeamCard
              role="Project Coordinator"
              name="TBA"
              description="To be recruited from the Palm Island community. Day-to-day coordination, logistics, and community engagement."
            />
            <TeamCard
              role="Manbarra Language Worker"
              name="TBA"
              description="Elder or community member with Manbarra language knowledge. Leads language documentation and pronunciation recording."
            />
            <TeamCard
              role="Video Editor / Producer"
              name="James Davidson"
              description="Founder of Juice TV. Edited 12 Elder interviews from the 2025 journey. Leads post-production on all video content."
            />
          </div>
        </div>
      </section>

      {/* ──────────────── Section 5: Deliverables ──────────────── */}
      <section className="bg-white py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-picc-ochre">
            Outcomes
          </p>
          <h2 className="mt-3 text-center text-4xl font-light text-picc-earth">
            What this project will produce
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <DeliverableCard
              icon={<Camera className="h-6 w-6" />}
              title="Photographic Exhibition"
              description="Major touring exhibition with integrated video elements from both journeys"
            />
            <DeliverableCard
              icon={<Film className="h-6 w-6" />}
              title="Short Knowledge Films"
              description="Interview-based short films capturing Elder voices on Country"
            />
            <DeliverableCard
              icon={<BookOpen className="h-6 w-6" />}
              title="Manbarra Language Resource"
              description="Printed vocabulary, place names, phrases + audio pronunciation guide (250 copies)"
            />
            <DeliverableCard
              icon={<Building className="h-6 w-6" />}
              title="Elders Room"
              description="Permanent cultural space installation on Palm Island with timeline wall, historical photos"
            />
            <DeliverableCard
              icon={<Monitor className="h-6 w-6" />}
              title="Mukurtu Digital Archive"
              description="Sovereign digital archive with four-tier Elder-defined access controls"
            />
            <DeliverableCard
              icon={<GraduationCap className="h-6 w-6" />}
              title="School Language Program"
              description="Integration with Palm Island's existing school language program"
            />
            <DeliverableCard
              icon={<Users className="h-6 w-6" />}
              title="Cross-Cultural Exchange"
              description="Collaborative exhibition with Oonchiumpa youth program (Central Australia)"
            />
            <DeliverableCard
              icon={<Globe className="h-6 w-6" />}
              title="Touring Exhibition"
              description="Exhibition shown at Tablelands communities and Central Australia"
            />
          </div>
        </div>
      </section>

      {/* ──────────────── Section 6: The Journey So Far ──────────────── */}
      <section className="bg-[#FEF3C7] py-20 px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-picc-ochre">
            Foundation
          </p>
          <h2 className="mt-3 text-4xl font-light text-picc-earth">The Journey So Far</h2>

          <div className="mt-10 space-y-4 text-lg text-stone-700">
            <p>
              In 2025, eight Elders made a heritage journey to Mission Beach and Hull River
              &mdash; the site of the 1918 cyclone that devastated the Aboriginal settlement
              and shaped Palm Island&rsquo;s history.
            </p>
            <p>
              Twelve filmed interviews were recorded on that trip and presented at the SNAICC
              national conference in Cairns.
            </p>
            <p className="font-medium text-picc-earth">
              This project deepens and extends that work over the next three years.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/immersive-stories/elders-trips-story"
              className="inline-flex items-center gap-2 rounded-full bg-picc-earth px-6 py-3 text-sm font-semibold text-white transition hover:bg-picc-earth/90"
            >
              Experience the 2025 Journey <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/elders"
              className="inline-flex items-center gap-2 rounded-full border border-picc-earth px-6 py-3 text-sm font-semibold text-picc-earth transition hover:bg-picc-earth/5"
            >
              Meet the Elders <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── Section 7: Cultural Protocols ──────────────── */}
      <section className="bg-stone-100 py-16 px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-picc-ochre" />
            <h2 className="text-2xl font-light text-picc-earth">Cultural Protocols</h2>
          </div>

          <div className="mt-6 space-y-4 text-base leading-relaxed text-stone-600">
            <p>
              All content produced by this project is governed by a <strong>four-tier access
              system</strong>: public, community, family, and sacred. Each tier is defined and
              maintained by the participating Elders.
            </p>
            <p>
              All content is reviewed and approved by Elders before any use &mdash; whether for
              exhibition, publication, or digital archiving.
            </p>
            <p>
              <strong>Allan Palm Island</strong> oversees cultural protocols as Manbarra
              Traditional Owner, ensuring that knowledge is shared appropriately and with the
              full authority of the community.
            </p>
            <p>
              The Mukurtu platform enforces digital access controls, ensuring that restricted
              material can only be viewed by authorised community members.
            </p>
            <p className="font-medium text-picc-earth">
              No content is published, exhibited, or archived without explicit Elder review and
              approval.
            </p>
          </div>
        </div>
      </section>

      {/* ──────────────── Section 8: Call to Action ──────────────── */}
      <section className="bg-gradient-to-br from-picc-ochre to-picc-red py-20 px-6 lg:px-8 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-light">This project belongs to the Elders.</h2>
          <p className="mt-6 text-lg text-white/90">
            Every photograph, every recording, every word preserved builds the bridge between
            past and future.
          </p>
          <Link
            href="/elders"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-picc-earth transition hover:bg-warm-100"
          >
            Back to Elders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ──────────────── Footer metadata ──────────────── */}
      <footer className="bg-picc-earth py-8 px-6 text-center text-sm text-white/50">
        <p>Voices on Country &mdash; ILA Application ILAOC260359</p>
        <p className="mt-1">
          Palm Island Community Company Ltd &nbsp;|&nbsp; ABN 14 640 793 728
        </p>
      </footer>
    </main>
  )
}

/* ──────────────── Sub-components ──────────────── */

function RoadmapYear({
  year,
  period,
  title,
  milestones,
  deliverables,
}: {
  year: string
  period: string
  title: string
  milestones: { date: string; text: string }[]
  deliverables: string
}) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-picc-ochre">{year}</p>
      <p className="mt-1 text-sm text-stone-400">{period}</p>
      <h3 className="mt-2 text-2xl font-semibold text-picc-earth">{title}</h3>

      <ul className="mt-6 space-y-4">
        {milestones.map((m) => (
          <li key={m.date} className="flex gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-picc-ochre" />
            <div>
              <p className="text-xs font-semibold text-picc-ochre">{m.date}</p>
              <p className="text-sm text-stone-600">{m.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-xl bg-warm-100/60 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Deliverables
        </p>
        <p className="mt-1 text-sm text-stone-700">{deliverables}</p>
      </div>
    </div>
  )
}

function TeamCard({
  role,
  name,
  description,
}: {
  role: string
  name: string
  description: string
}) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-picc-ochre">{role}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{description}</p>
    </div>
  )
}

function DeliverableCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-warm-100/30 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-picc-ochre/10 text-picc-ochre">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-picc-earth">{title}</h3>
      <p className="mt-2 text-sm text-stone-500">{description}</p>
    </div>
  )
}
