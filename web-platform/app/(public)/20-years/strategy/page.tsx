import { Metadata } from 'next'
import Link from 'next/link'
import { assetUrl } from '@/lib/media/asset-url'

export const metadata: Metadata = {
  title: 'The Sovereignty of Care — PICC Strategic Framework 2026–2047',
  description: 'Palm Island Community Company strategic framework: five pillars of community-controlled innovation for the next 20 years.',
}

// Supabase storage base for hero images
const STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/platform-media`

const PILLARS = [
  {
    num: '01',
    name: 'Sovereign Story',
    color: '#C8963E',
    quote: '"The grannies that you\'ve seen. Their story. I hope my legacy be for them to have a history and a story about their identity, who they are."',
    attr: 'Rachel Atkinson, CEO',
    desc: 'PICC owns its narrative. 525 community voices captured across 116 transcripts, stored in sovereign infrastructure with cultural protocols and elder approval workflows.',
    link: '/picc/reports/builder',
    linkLabel: 'Report Builder',
    image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764272702417-j7dmu7.jpg',
    imageIsAbsolute: true,
  },
  {
    num: '02',
    name: 'Culture of Care',
    color: '#0B4F6C',
    quote: '"We looked more than just at the medical model of health. We looked at the holistic part of that child or that person\'s life."',
    attr: 'Rachel Atkinson, CEO',
    desc: '31 services covering every stage of life — First 1,000 Days through Elder Support. The workplace culture that $10 million couldn\'t buy.',
    link: '/services',
    linkLabel: 'Our Services',
    image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764215447770-r81xit.jpg',
    imageIsAbsolute: true,
  },
  {
    num: '03',
    name: 'Elder Authority',
    color: '#B85C38',
    quote: '"We are full of knowledge and we know our people really well. We gotta guide like the director."',
    attr: 'Aunty Ethel',
    desc: 'Elders lead community through story, history, and cultural knowledge. Voices on Country — a 36-month journey to preserve and share elder wisdom with sovereign consent.',
    link: '/elders',
    linkLabel: 'Our Elders',
    image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764380754115-zkfdxj.jpg',
    imageIsAbsolute: true,
  },
  {
    num: '04',
    name: 'Next Generation',
    color: '#5F8F71',
    quote: '"I work with disengaged kids or kids who not going to school. We create programs with them."',
    attr: 'Henry Doyle, Youth Services',
    desc: 'Youth employment, digital skills, sport, and innovation projects on-island. Building the voices that will lead PICC\'s next 20 years.',
    link: '/stories',
    linkLabel: 'Youth Stories',
    image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1771284577964-gkewai.jpg',
    imageIsAbsolute: true,
  },
  {
    num: '05',
    name: 'Community Control',
    color: '#6B5D50',
    quote: '"When our people make decisions for our people, that is true self-determination. PICC is showing what is possible."',
    attr: 'Uncle Raymond Palmer Snr',
    desc: '100% community-controlled since 2021. Bwgcolman Way — first ACCO in Queensland granted delegated authority for child protection. $107.8M.',
    link: '/picc/pcap',
    linkLabel: 'Data Sovereignty',
    image: 'https://uaxhjzqrdotoahjnxmbj.supabase.co/storage/v1/object/public/story-media/1764272625132-ta0nc.jpg',
    imageIsAbsolute: true,
  },
]

const STATS = [
  { value: '217', label: 'Staff on Palm Island' },
  { value: '87%', label: 'First Nations workforce' },
  { value: '31', label: 'Community services' },
  { value: '525', label: 'Voices captured' },
  { value: '20', label: 'Years of community control' },
]

const TIMELINE = [
  {
    year: '2007',
    name: 'Founded',
    desc: 'Tri-partisan initiative. Rachel starts alone with a skills-based board. First services launched. Building trust with government and community.',
    active: false,
  },
  {
    year: '2027',
    name: '20th Anniversary',
    desc: '217 staff. 31 services. Delegated authority. Sovereign data infrastructure. 525 community voices captured. The story of what community control makes possible.',
    active: true,
  },
  {
    year: '2047',
    name: 'Next 20 Years',
    desc: 'The children of today leading tomorrow. A national case study for community-controlled innovation. The model that Australia and the world can learn from.',
    active: false,
  },
]

export default function StrategyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* ─── COVER ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
          Palm Island Community Company
        </p>
        <div className="w-full max-w-lg mx-auto mb-8">
          <img
            src="/picc-strategy-visual-v10.png"
            alt="The Sovereignty of Care — five pillars surrounding Palm Island"
            className="w-full h-auto"
          />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-800 italic text-center mb-4">
          The Sovereignty of Care
        </h1>
        <p className="text-sm tracking-[0.15em] text-stone-400 uppercase">
          Strategic Framework 2026–2047
        </p>
        <div className="mt-12 animate-bounce text-stone-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ─── RACHEL HERO QUOTE ─── */}
      <section className="relative py-20 px-6" style={{ backgroundColor: '#0B4F6C' }}>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${STORAGE}/hero-assets/stills/palm-sunset-pier.jpg)` }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-picc-ochre mb-6">
            The Vision
          </p>
          <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl text-white italic leading-relaxed mb-4">
            &ldquo;PICC is suitable, we are sustainable, and it&rsquo;s yours. It&rsquo;s the communities.&rdquo;
          </blockquote>
          <p className="text-white/60 text-sm">
            Rachel Atkinson · CEO, Palm Island Community Company · 17 years
          </p>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl md:text-5xl text-[#0B4F6C]">{s.value}</div>
              <div className="text-xs text-stone-400 mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="w-10 h-0.5 bg-picc-ochre mx-auto" />

      {/* ─── FIVE PILLARS ─── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            Five Pillars
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-12">
            A community-controlled model of care
          </h2>

          <div className="space-y-0">
            {PILLARS.map((p, i) => (
              <div
                key={p.num}
                className={`grid md:grid-cols-2 min-h-[500px] ${
                  i % 2 === 0 ? '' : 'md:[direction:rtl]'
                }`}
              >
                {/* Image side */}
                <div
                  className="relative min-h-[300px] md:min-h-0 bg-cover bg-center"
                  style={{
                    backgroundColor: p.color,
                    backgroundImage: `url(${(p as any).imageIsAbsolute ? p.image : `${STORAGE}/${p.image}`})`,
                  }}
                >
                  <div className="absolute inset-0" style={{ backgroundColor: `${p.color}40` }} />
                </div>

                {/* Content side */}
                <div className="flex flex-col justify-center p-10 md:p-16 bg-[#FAF8F5] [direction:ltr]">
                  <span
                    className="font-serif text-7xl leading-none mb-4"
                    style={{ color: `${p.color}20` }}
                  >
                    {p.num}
                  </span>
                  <p
                    className="text-xs font-bold tracking-[0.1em] uppercase mb-4"
                    style={{ color: p.color }}
                  >
                    {p.name}
                  </p>
                  <blockquote className="font-serif italic text-xl md:text-2xl text-stone-800 leading-relaxed mb-2">
                    {p.quote}
                  </blockquote>
                  <p className="text-sm text-picc-ochre mb-6">— {p.attr}</p>
                  <p className="text-stone-500 leading-relaxed mb-6 max-w-lg">
                    {p.desc}
                  </p>
                  <Link
                    href={p.link}
                    className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                    style={{ color: p.color }}
                  >
                    {p.linkLabel}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── RACHEL'S VISION ─── */}
      <section className="py-24 px-6" style={{ backgroundColor: '#0B4F6C' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-picc-ochre mb-8">
            The Legacy
          </p>
          <blockquote className="font-serif italic text-2xl md:text-3xl text-white leading-relaxed mb-6">
            &ldquo;Every child has a right to feel safe. Every child has a right to access early childhood services. Every family has a right to have a sense of belonging and ownership of their future.&rdquo;
          </blockquote>
          <p className="text-white/50 text-sm mb-10">
            Rachel Atkinson · CEO, Palm Island Community Company
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xl mx-auto">
            17 years building community control from the ground up. From one person with a good board to 217 staff delivering 31 services. The most innovative community-controlled organisation in Australia.
          </p>
        </div>
      </section>

      {/* ─── ADRIAN CARSON QUOTE ─── */}
      <section className="py-20 px-6 bg-[#F0EEEB]">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="font-serif italic text-xl md:text-2xl text-stone-800 leading-relaxed mb-4">
            &ldquo;10 million wouldn&rsquo;t get you what you got. Money could not buy what PICC has created — the culture of the workplace.&rdquo;
          </blockquote>
          <p className="text-sm text-picc-ochre">
            — Adrian Carson, CEO of Indigenous Organisations International
          </p>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-4">
            The Arc
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800 mb-12">
            From founding to the next 20 years
          </h2>

          <div className="grid md:grid-cols-3 gap-0">
            {TIMELINE.map((era) => (
              <div
                key={era.year}
                className={`p-8 md:p-10 ${
                  era.active
                    ? 'bg-[#0B4F6C08] border-t-2 border-picc-ochre'
                    : 'border-t border-stone-200'
                }`}
              >
                <div
                  className={`font-serif text-5xl mb-2 ${
                    era.active ? 'text-picc-ochre' : 'text-stone-300'
                  }`}
                >
                  {era.year}
                </div>
                <p
                  className={`text-xs font-bold tracking-[0.08em] uppercase mb-4 ${
                    era.active ? 'text-picc-ochre' : 'text-stone-400'
                  }`}
                >
                  {era.name}
                </p>
                <p className={`text-sm leading-relaxed ${era.active ? 'text-stone-700' : 'text-stone-500'}`}>
                  {era.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM LINKS ─── */}
      <section className="py-16 px-6 bg-[#F0EEEB]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6 text-center">
            Explore the Platform
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: '/elders', label: 'Our Elders', sub: 'Voices on Country' },
              { href: '/stories', label: 'Our Stories', sub: '525 community voices' },
              { href: '/picc/reports/builder', label: 'Report Builder', sub: 'Audience-targeted' },
              { href: '/picc/pcap', label: 'Data Sovereignty', sub: 'PCAP dashboard' },
              { href: '/picc/dashboard', label: 'Dashboard', sub: 'Content & services' },
              { href: '/picc/elders-room', label: 'Elders Room', sub: 'Elder-controlled space' },
              { href: '/chat', label: 'Ask Palm AI', sub: 'Community knowledge' },
              { href: '/20-years', label: '20 Years', sub: 'Anniversary experience' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group p-5 rounded-xl bg-white border border-stone-200 hover:border-picc-ochre transition-colors"
              >
                <div className="text-sm font-semibold text-stone-800 group-hover:text-picc-ochre transition-colors">
                  {link.label}
                </div>
                <div className="text-xs text-stone-400 mt-1">{link.sub}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CLOSING ─── */}
      <section
        className="py-24 px-6 text-center"
        style={{ backgroundColor: '#2D2319' }}
      >
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-6">
          PICC × A Curious Tractor
        </p>
        <h2 className="font-serif italic text-3xl md:text-4xl text-white mb-4">
          The Sovereignty of Care
        </h2>
        <p className="text-white/40 text-sm mb-8">
          Strategic technology partner for the next 20 years
        </p>
        <p className="text-picc-ochre/50 text-xs tracking-[0.15em]">
          Empathy Ledger · CivicScope · PCAP Sovereignty
        </p>
      </section>
    </div>
  )
}
