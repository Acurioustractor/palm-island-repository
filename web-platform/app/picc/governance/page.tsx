/**
 * PICC Governance — Internal info page
 *
 * Sources the constitutional design and sector positioning from the
 * PICC-Sector-Context-Deep-Research.md (workshop vault doc #8).
 *
 * Internal route at /picc/governance — for staff and board use, summarising
 * how PICC is structured, who can sit on the board, what the guardrails are,
 * and where PICC sits in the Australian community-controlled architecture.
 */

import {
  Landmark,
  Users,
  Shield,
  Award,
  Network,
  Vote,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export const metadata = {
  title: 'Governance — PICC Admin',
  description: 'PICC governance, board design, membership, and sector position — sourced from the constitution and the 2026 sector-context research.',
}

export const dynamic = 'force-static'

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* ── HEADER ── */}
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
            Internal · Governance Reference
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-stone-800 italic mb-4 leading-tight">
            How PICC is governed
          </h1>
          <p className="text-lg text-stone-600 max-w-3xl leading-relaxed">
            A reference page for staff, board, and partners. Summarises PICC&apos;s legal form,
            membership rules, board design, guardrails, and where it sits in the Australian
            community-controlled architecture. Sourced from the PICC constitution and the
            2026 sector-context research pass.
          </p>
        </div>

        {/* ── THE FRAMING ── */}
        <section className="mb-12">
          <div className="rounded-2xl bg-[#0B4F6C] text-white p-8 md:p-10">
            <p className="font-serif italic text-2xl md:text-3xl leading-relaxed mb-4">
              &ldquo;PICC is best understood not as a single service or charity, but as Palm
              Island&apos;s community infrastructure platform.&rdquo;
            </p>
            <p className="text-sm text-white/70 border-l-2 border-picc-ochre pl-4">
              PICC began in 2007 as a hybrid public company. Since 30 September 2021 it has
              been a member-controlled entity — a community-controlled anchor institution
              that combines health, child and family safety, justice, disability, aged care,
              youth and economic development in one Palm-based organisation.
            </p>
          </div>
        </section>

        {/* ── LEGAL FORM ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Legal form
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FactCard
              icon={<Landmark className="w-5 h-5" />}
              label="Company structure"
              body="Active Australian public company limited by guarantee. ABN 14 640 793 728."
            />
            <FactCard
              icon={<Award className="w-5 h-5" />}
              label="Charitable status"
              body="Registered charity with the Australian Charities and Not-for-profits Commission (ACNC). DGR (Deductible Gift Recipient) endorsed."
            />
            <FactCard
              icon={<Shield className="w-5 h-5" />}
              label="NDIS"
              body="Approved NDIS provider, registration current to 6 February 2029."
            />
            <FactCard
              icon={<Shield className="w-5 h-5" />}
              label="My Aged Care"
              body="Listed on My Aged Care with CHSP and NATSIFAC registration through 28 January 2029."
            />
          </div>
        </section>

        {/* ── MEMBERSHIP ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Who can be a member
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Stat
                label="Open to"
                value="Manbarra & Bwgcolman"
                sub="people aged 18+"
              />
              <Stat label="Voting" value="One member" sub="one vote" />
              <Stat label="Staff" value="Can be members" sub="cannot vote on director elections" />
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">
              Membership is the legal foundation of community control. Members elect the
              majority of directors, attend the annual general meeting, and hold the board
              accountable. The 2024 and 2025 AGM cycles have been active — nominations for
              member-elected directors are called publicly each year on the PICC news page.
            </p>
          </div>
        </section>

        {/* ── BOARD DESIGN ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Board design
          </h2>
          <div className="rounded-2xl border-2 border-picc-ochre/30 bg-white p-8">
            <p className="text-stone-700 mb-6">
              The PICC constitution requires <strong>5 to 7 directors</strong> across three
              categories. The composition is designed to balance local democratic legitimacy,
              Traditional Owner representation, and skills the board needs to govern a complex
              multi-service organisation.
            </p>
            <div className="space-y-3">
              <BoardSeat
                count="Up to 4"
                label="Member-elected directors"
                body="Elected by Manbarra and Bwgcolman members at the annual general meeting. The democratic majority of the board."
              />
              <BoardSeat
                count="1"
                label="Traditional Owner director"
                body="A reserved seat nominated by Manbarra Corporation, recognising Manbarra people as the Traditional Owners of Palm Island."
              />
              <BoardSeat
                count="Up to 2"
                label="Board-appointed directors"
                body="Appointed by the rest of the board to cover skills gaps — typically governance, legal, financial, or sector expertise."
              />
            </div>
          </div>
        </section>

        {/* ── CURRENT BOARD (2023/24) ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Current public board (2023/24 annual report)
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { name: 'Luella Bligh', role: 'Chair' },
                { name: 'Rhonda Phillips', role: 'Director' },
                { name: 'Allan Palm Island', role: 'Director' },
                { name: 'Matthew Lindsay', role: 'Director' },
                { name: 'Harriet Hulthen', role: 'Director' },
                { name: 'Raymond W. Palmer Snr', role: 'Director' },
                { name: 'Cassie Lang', role: 'Director' },
              ].map((d) => (
                <div
                  key={d.name}
                  className="rounded-xl bg-[#FAF8F5] border border-stone-100 p-4 text-center"
                >
                  <p className="font-semibold text-stone-800">{d.name}</p>
                  <p className="text-xs text-picc-ochre font-medium mt-0.5">{d.role}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Source: 2023/24 annual report. AGM notices and member-director nomination calls
              were publicly posted for both the 2024 and 2025 cycles — the next AGM is
              scheduled for 25 November 2025. Board composition may change after that cycle.
            </p>
          </div>
        </section>

        {/* ── GUARDRAILS ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Guardrails — who cannot sit on the board
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Guardrail
              text="PICC staff cannot be directors."
              reason="Separates operational accountability from governance oversight."
            />
            <Guardrail
              text="Government elected officials cannot be directors."
              reason="Council and parliamentary roles create structural conflict with community control."
            />
            <Guardrail
              text="Senior government and council employees are excluded."
              reason="Avoids the conflicts the 2007 hybrid model was criticised for in the 2019 Ipsos evaluation."
            />
            <Guardrail
              text="No more than one member of a family at a time."
              reason="Spreads representation across families and prevents single-family control."
            />
          </div>
        </section>

        {/* ── SKILLS BALANCE ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Skills the board is asked to hold
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white p-8">
            <p className="text-sm text-stone-600 mb-5 leading-relaxed">
              PICC&apos;s governance material says the board should combine local legitimacy
              with skills across the following areas, while reflecting diversity of gender,
              age, family groups and geographic ties on Palm Island.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Aboriginal culture',
                'Community aspirations',
                'Governance',
                'Social policy',
                'Primary health',
                'Business',
                'Law',
                'Finance',
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full bg-picc-ochre/10 text-picc-ochre text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTOR POSITION ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            Where PICC sits in the Australian sector
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white p-8 mb-4">
            <p className="text-stone-700 leading-relaxed mb-5">
              Under the National Agreement on Closing the Gap, an Aboriginal and/or Torres
              Strait Islander community-controlled organisation must be incorporated and
              not-for-profit, controlled and operated by Aboriginal and Torres Strait
              Islander people, connected to the communities it serves, and governed by a
              majority Aboriginal and Torres Strait Islander governing body.
            </p>
            <p className="text-stone-700 leading-relaxed">
              <strong>PICC fits that model and goes broader.</strong> Its constitution
              authorises health, social and human services, training, advocacy,
              self-determination work, community development, businesses and social
              enterprises, and community/media activities. In practice that makes PICC a
              multi-service Aboriginal Community Controlled Organisation (ACCO) with an
              Aboriginal Community Controlled Health Organisation (ACCHO) core.
            </p>
          </div>

          <div className="rounded-2xl bg-stone-900 text-white p-8">
            <div className="flex items-start gap-3 mb-4">
              <Network className="w-6 h-6 text-picc-ochre flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold mb-2">CEO Rachel Atkinson&apos;s peak-body roles</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  Rachel has led PICC since the 2007 launch — the only CEO in the
                  organisation&apos;s history. Her standing in the sector means PICC reaches
                  three peak community-controlled bodies across health and child safety:
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <PeakBody
                acronym="QAIHC"
                role="Deputy Chair"
                full="Queensland Aboriginal and Islander Health Council"
              />
              <PeakBody
                acronym="NACCHO"
                role="Board member"
                full="National Aboriginal Community Controlled Health Organisation"
              />
              <PeakBody
                acronym="SNAICC"
                role="Deputy Chair"
                full="Secretariat of National Aboriginal and Islander Child Care"
              />
            </div>
          </div>
        </section>

        {/* ── THE 2007 → 2021 SHIFT ── */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
            The 2007 → 2021 shift
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <p className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wide mb-2">
                2007 — The hybrid model
              </p>
              <h3 className="font-semibold text-stone-800 mb-3">Public company limited by shares</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                Launched 17 October 2007 after a Queensland Government design process that
                began in 2005. Shareholders included the Queensland Government, Palm Island
                Aboriginal Shire Council, and Traditional Owners. Its early role was to link
                services through service provision, community capacity building, and business
                development.
              </p>
              <p className="text-xs text-stone-500 italic">
                The 2019 Ipsos evaluation found that this mixed-governance model helped PICC
                scale and stabilise funding, but also created distrust about whether PICC was
                truly community-led.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-picc-ochre/40 bg-white p-6">
              <p className="text-xs font-mono font-bold text-picc-ochre uppercase tracking-wide mb-2">
                2021 — Community control
              </p>
              <h3 className="font-semibold text-stone-800 mb-3">Member-controlled company limited by guarantee</h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                New entity registered June 2020. Primary health service merged with the
                Queensland Health-run centre on 1 July 2021. Services, workforce and assets
                transferred 30 September 2021. Renamed Palm Island Community Company Ltd in
                October 2021. Members are now Palm Islanders only.
              </p>
              <p className="text-xs text-picc-ochre font-medium italic">
                The 2021 restructure directly answered the 2019 Ipsos finding. The next
                20 years build on the legitimacy PICC has now earned.
              </p>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 mb-8">
          <p className="text-xs text-stone-500 leading-relaxed">
            <strong className="text-stone-700">Sources:</strong> PICC constitution and
            governance explainer · Ipsos 2019 independent evaluation · National Agreement on
            Closing the Gap · QAIHC, NACCHO, SNAICC public records · ACNC charity register ·
            archived in PICC-Sector-Context-Deep-Research.md (workshop vault doc #8).
          </p>
          <p className="text-xs text-stone-400 mt-2">
            Last sync: 10 April 2026. If anything on this page is wrong or outdated, update
            doc #8 in the workshop vault first, then reflect the change here.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/picc/launchpad" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            ← The Launchpad strategic plan
          </a>
          <a href="/picc/next-20" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            Next-20 working canvas
          </a>
          <a href="/services" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            All 30 services
          </a>
          <a href="/20-years" className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200">
            17-year history walk
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────

function FactCard({ icon, label, body }: { icon: React.ReactNode; label: string; body: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-2 text-picc-ochre">
        {icon}
        <p className="text-xs font-semibold tracking-wide uppercase">{label}</p>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-lg font-bold text-picc-earth mb-0.5">{value}</p>
      <p className="text-xs text-stone-500">{sub}</p>
    </div>
  )
}

function BoardSeat({ count, label, body }: { count: string; label: string; body: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-stone-100">
      <div className="flex-shrink-0">
        <div className="w-16 text-center">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-0.5">Seats</p>
          <p className="text-2xl font-bold text-picc-ochre">{count}</p>
        </div>
      </div>
      <div className="flex-1 pt-1">
        <p className="font-semibold text-stone-800 mb-1">{label}</p>
        <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

function Guardrail({ text, reason }: { text: string; reason: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-stone-800 mb-1">{text}</p>
          <p className="text-xs text-stone-500 leading-relaxed">{reason}</p>
        </div>
      </div>
    </div>
  )
}

function PeakBody({ acronym, role, full }: { acronym: string; role: string; full: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-xl font-bold text-picc-ochre mb-1">{acronym}</p>
      <p className="text-xs text-white/80 font-medium mb-1">{role}</p>
      <p className="text-[11px] text-white/50 leading-relaxed">{full}</p>
    </div>
  )
}
