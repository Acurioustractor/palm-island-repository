'use client';

import Link from 'next/link';
import {
  HeroSection,
  TextSection,
  ScrollReveal,
  FullBleedImage,
  QuoteSection,
  SideBySideSection,
  ImageGallery,
  TimelineSection,
  StoryContainer,
} from '@/components/story-scroll';
import { ArrowRight } from 'lucide-react';
import ArtifactsList from '@/components/history/ArtifactsList';
import { assetUrl } from '@/lib/media/asset-url';
import type { ChapterArtifacts } from '@/lib/history/get-artifacts';

// ─── Language Groups ───────────────────────────────────────────────────────────
const LANGUAGE_GROUPS = [
  { name: 'Manbarra', origin: 'Palm Island (Traditional Owners)' },
  { name: 'Wulgurukaba', origin: 'Townsville / Magnetic Island' },
  { name: 'Djiru', origin: 'Mission Beach / Tully' },
  { name: 'Kandju', origin: 'Cape York' },
  { name: 'Kuku Yalanji', origin: 'Daintree / Mossman' },
  { name: 'Yidinji', origin: 'Cairns / Atherton' },
  { name: 'Kongkandji', origin: 'Yarrabah' },
  { name: 'Birri Gubba', origin: 'Bowen / Collinsville' },
  { name: 'Kalkadoon', origin: 'Mount Isa' },
  { name: 'Warrgamay', origin: 'Ingham / Herbert River' },
  { name: 'Girramay', origin: 'Cardwell / Murray Upper' },
  { name: 'Jirrbal', origin: 'Ravenshoe / Herberton' },
  { name: 'Gugu Badhun', origin: 'Valley of Lagoons' },
  { name: 'Nywaigi', origin: 'Ingham / Halifax Bay' },
  { name: 'Bandjin', origin: 'Hinchinbrook Island' },
  { name: 'Gulnay', origin: 'Greenvale / Mt Garnet' },
  { name: 'Warungnu', origin: 'Ravenshoe' },
  { name: 'Bindal', origin: 'Townsville' },
  { name: 'Kokoimudji', origin: 'Proserpine' },
  { name: 'Torres Strait Islander', origin: 'Torres Strait Islands' },
];

// ─── PICC Timeline Events ──────────────────────────────────────────────────────
const PICC_TIMELINE = [
  {
    date: '1985',
    title: 'PICC Founded',
    description:
      'Concerned residents form the Palm Island Community Company to take control of local services and economic development.',
    isComplete: true,
  },
  {
    date: '2007',
    title: 'The Beginning',
    description:
      'Rachel Atkinson becomes the sole employee. PICC transitions to the CATSI Act — laying the legal foundation for community control.',
    isComplete: true,
  },
  {
    date: '2009',
    title: 'The 20-Year Vision Begins',
    description:
      'Year 1 of 20. Staff count: 1. Annual income: near zero. The journey to self-determination starts with a plan and a promise.',
    isComplete: true,
  },
  {
    date: '2012',
    title: 'First Major Contracts',
    description:
      'PICC wins contracts for municipal services, proving the community can manage its own infrastructure. Staff grows to 40+.',
    isComplete: true,
  },
  {
    date: '2016',
    title: 'Service Expansion',
    description:
      'Family services, health programs, and youth initiatives launch. Revenue crosses $5M. The model is working.',
    isComplete: true,
  },
  {
    date: '30 September 2021',
    title: 'Full Community Control',
    description:
      'The moment everything changed. PICC takes over all remaining government-run services. 100% community-controlled for the first time in over a century.',
    isComplete: true,
  },
  {
    date: '2023',
    title: 'Digital Service Centre & Delegated Authority',
    description:
      'PICC opens a Digital Service Centre and receives Delegated Authority — the first Indigenous community company in Queensland to do so.',
    isComplete: true,
  },
  {
    date: '2025',
    title: 'Elders Journey to Hull River',
    description:
      'Community Elders travel to the site of the former Hull River settlement — reconnecting with the land where their ancestors were held before the cyclone.',
  },
  {
    date: '2029',
    title: 'Year 20 — The Vision Complete',
    description:
      'The completion of the 20-year plan. Staff 197+, revenue $23.4M+, 16 integrated services. A model for Indigenous self-determination across Australia.',
  },
];

// ─── Gallery Photos ─────────────────────────────────────────────────────────────
const GALLERY_PHOTOS = [
  { url: assetUrl('/annual-report-photos/2009-10/photo-001.jpg'), alt: 'PICC early days, 2009-10', caption: 'Foundation — 2009' },
  { url: assetUrl('/annual-report-photos/2010-11/photo-002.jpg'), alt: 'Community gathering, 2010-11', caption: 'Growth begins — 2010' },
  { url: assetUrl('/annual-report-photos/2011-12/photo-003.jpg'), alt: 'Service delivery, 2011-12', caption: 'Building capacity — 2011' },
  { url: assetUrl('/annual-report-photos/2013-14/photo-002.jpg'), alt: 'Team expansion, 2013-14', caption: 'Expanding services — 2013' },
  { url: assetUrl('/annual-report-photos/2015-16/photo-001.jpg'), alt: 'Community programs, 2015-16', caption: 'Community programs — 2015' },
  { url: assetUrl('/annual-report-photos/2017-18/photo-001.jpg'), alt: 'Youth engagement, 2017-18', caption: 'Youth engagement — 2017' },
  { url: assetUrl('/annual-report-photos/2019-20/photo-003.jpg'), alt: 'Service transition, 2019-20', caption: 'Transition era — 2019' },
  { url: assetUrl('/annual-report-photos/2020-21/photo-005.jpg'), alt: 'Community control milestone, 2020-21', caption: 'Community control — 2021' },
  { url: assetUrl('/annual-report-photos/2020-21/photo-010.jpg'), alt: 'Celebration, 2020-21', caption: 'Celebration — 2021' },
  { url: assetUrl('/annual-report-photos/2021-22/photo-002.jpg'), alt: 'Self-determination era, 2021-22', caption: 'Self-determination — 2022' },
  { url: assetUrl('/annual-report-photos/2022-23/photo-001.jpg'), alt: 'New services, 2022-23', caption: 'New era — 2023' },
  { url: assetUrl('/annual-report-photos/2023-24/photo-001.jpg'), alt: 'Looking forward, 2023-24', caption: 'Looking forward — 2024' },
];

// ─── Main Component ─────────────────────────────────────────────────────────────

interface HistoryContentProps {
  artifacts: ChapterArtifacts
}

export default function HistoryContent({ artifacts }: HistoryContentProps) {
  return (
    <StoryContainer>
      {/* ── Chapter 1: Hero ─────────────────────────────────────────────────── */}
      <HeroSection
        title="Our History, Our Country"
        subtitle="Manbarra & Bwgcolman — from before time, through storm and separation, to self-determination"
        backgroundVideo={assetUrl("/hero-assets/clips/palm-island-sunset.mp4")}
        overlay="gradient"
        textPosition="center"
      />

      {/* ── Chapter 2: Manbarra Country ─────────────────────────────────────── */}
      <SideBySideSection
        title="Manbarra Country"
        mediaUrl={assetUrl("/hero-assets/stills/waterfall.jpg")}
        mediaPosition="left"
        mediaAlt="Waterfall on Palm Island — Manbarra Country"
        content={
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-picc-ochre">
              Before 1914
            </p>
            <p>
              For thousands of years, the Manbarra people lived on these islands — part of the
              broader Wulgurukaba nation, the &ldquo;canoe people&rdquo; of the Halifax Bay coast.
              Their creation stories speak of Gabbul, the carpet snake, who shaped the land and
              waterways.
            </p>
            <p>
              Before European contact, the Manbarra population was around 200 people living in deep
              connection with land and sea. The bêche-de-mer (sea cucumber) trade from the 1850s
              brought outsiders, displacement, and disease. By the early 1900s, the population had
              fallen to roughly 50.
            </p>
            <p>
              In 1912, the island was briefly a holiday resort. Two years later, it would become
              something very different.
            </p>
            {artifacts.manbarra && (
              <ArtifactsList artifacts={artifacts.manbarra} title="Sources & Artifacts" />
            )}
          </div>
        }
      />

      {/* ── Chapter 3: The Reserve ──────────────────────────────────────────── */}
      <TextSection
        title="The Reserve"
        subtitle="20 June 1914 — Palm Island gazetted as an Aboriginal settlement"
        backgroundColor="bg-stone-50"
        content={
          <div className="space-y-4">
            <p>
              J.W. Bleakley, Queensland&apos;s Chief Protector of Aboriginals, selected Palm Island
              as &ldquo;a penitentiary for troublesome cases.&rdquo; Under the <em>Aboriginals
              Protection and Restriction of the Sale of Opium Act 1897</em>, the government could
              remove any Aboriginal person to any reserve, for any reason, without appeal.
            </p>
            <p>
              What had been a holiday resort just two years earlier became an instrument of control.
              Over the next six decades, thousands of Aboriginal people from across Queensland —
              speaking more than 40 different languages — would be forcibly relocated to Palm Island.
            </p>
            <p>
              Many were sent here as punishment: for speaking their language, for being
              &ldquo;troublesome,&rdquo; for loving the wrong person, or simply for being Aboriginal
              in a place where the government wanted them gone.
            </p>
            {artifacts.reserve && (
              <ArtifactsList artifacts={artifacts.reserve} title="Sources & Artifacts" />
            )}
          </div>
        }
      />

      {/* ── Chapter 4: Hull River ───────────────────────────────────────────── */}
      <FullBleedImage
        imageUrl={assetUrl("/hero-assets/stills/mountain-valley.jpg")}
        alt="The ranges of North Queensland — near the site of the former Hull River settlement"
        height="medium"
        caption="The ranges of North Queensland — near where Hull River settlement once stood"
      />

      <TextSection
        title="Hull River"
        subtitle="1914–1918 — Catastrophe on Djiru Country"
        backgroundColor="bg-stone-900"
        content={
          <div className="space-y-4 text-stone-300">
            <p>
              While Palm Island was being established, another settlement already existed 200km
              south — Hull River, on the traditional lands of the Djiru people near Tully. By 1917,
              490 Aboriginal people were confined there under Superintendent Kenny.
            </p>
            <p>
              Conditions were catastrophic. Malaria swept through the camp, killing approximately 200
              people in 1917 alone. There was no adequate medical care, no escape.
            </p>
            <p className="text-white font-semibold text-xl leading-relaxed">
              Then, on 10 March 1918 at 10 PM, a Category 5 cyclone struck. Winds of
              240–288 km/h. A 12-foot storm surge. The settlement was obliterated.
            </p>
            <p>
              Superintendent Kenny and his daughter were killed. Up to 100 Aboriginal people died —
              the true number was never properly counted. The survivors, traumatised and with nothing
              left, were transferred to Palm Island in June 1918.
            </p>
            <p>
              They carried with them their languages, their knowledge, their grief, and their
              determination to survive.
            </p>
            {artifacts['hull-river'] && (
              <ArtifactsList artifacts={artifacts['hull-river']} title="Sources & Artifacts" dark />
            )}
          </div>
        }
      />

      {/* ── Chapter 5: Many Tribes, One People ──────────────────────────────── */}
      <section className="bg-white editorial-section">
        <div className="max-w-6xl mx-auto px-8">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 tracking-[-0.02em] leading-[1.1]">
              Many Tribes, One People
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              1918–1972 — 3,950+ documented removals from across Queensland
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1}>
            <div className="prose prose-lg max-w-none mb-12">
              <p>
                Over more than fifty years, the Queensland government forcibly relocated Aboriginal
                people from every corner of the state to Palm Island. More than 3,950 individual
                removals are documented in government records — the true number is certainly higher.
              </p>
              <p>
                People arrived speaking different languages, carrying different songlines, from
                rainforest and reef, desert and river country. They were expected to simply become one
                community overnight, under the absolute authority of a government superintendent.
              </p>
              <p>
                Instead, they did something remarkable. Elder Dick Palm Island coined the word
                <strong> &ldquo;Bwgcolman&rdquo;</strong> — meaning <em>many tribes, one people</em>.
                It became the name for this new, forged-in-adversity community. Not a replacement for
                their original identities, but an acknowledgment of what they had built together.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              20+ Language Groups Brought Together
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LANGUAGE_GROUPS.map((group) => (
                <div
                  key={group.name}
                  className="bg-stone-50 border border-stone-200 rounded-lg p-3 hover:border-picc-ochre/50 transition-colors"
                >
                  <div className="font-semibold text-gray-900 text-sm">{group.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{group.origin}</div>
                </div>
              ))}
            </div>
            {artifacts.languages && (
              <ArtifactsList artifacts={artifacts.languages} title="Sources & Artifacts" />
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* ── Chapter 6: Life Under Government Control ────────────────────────── */}
      <QuoteSection
        quote="We had no rights. No say. The superintendent was God."
        author="Palm Island Elder"
        backgroundColor="bg-stone-900"
        textColor="text-white"
        size="medium"
      />

      <TextSection
        title="Life Under Government Control"
        subtitle="Decades of brutality, separation, and resistance"
        content={
          <div className="space-y-4">
            <p>
              Palm Island was run by a succession of government-appointed superintendents who held
              absolute power over every aspect of residents&apos; lives. They controlled who could
              marry, who could work, who could leave, and who would be punished.
            </p>
            <p>
              <strong>Robert Curry (1918–1930)</strong> was superintendent for twelve years. Under his
              rule, residents were subjected to floggings and exile to Eclipse Island as punishment.
              His tenure ended in tragedy in 1930 when he dynamited his own home and shot the
              settlement doctor before taking his own life.
            </p>
            <p>
              Later superintendents continued the pattern. Under Bartlam, residents described living
              in &ldquo;Gestapo times.&rdquo; The <strong>dormitory system (1923–1975)</strong>{' '}
              forcibly separated children from their families — part of the Stolen Generations that
              scarred Aboriginal communities across Australia.
            </p>
            <p>
              Every night at 9 PM, the electricity was cut. A bell rang. Curfew was enforced. For
              decades, this was life on Palm Island — total institutional control over a people who
              had never surrendered their sovereignty.
            </p>
            {artifacts.dormitories && (
              <ArtifactsList artifacts={artifacts.dormitories} title="Sources & Artifacts" />
            )}
          </div>
        }
      />

      {/* ── Chapter 7: The Strike of 1957 ───────────────────────────────────── */}
      <FullBleedImage
        imageUrl={assetUrl("/hero-assets/stills/pier-turquoise.jpg")}
        alt="Palm Island pier — where the seven strike leaders were taken before dawn"
        height="short"
        caption="Palm Island pier — where the strike leaders were taken in a dawn raid"
      />

      <SideBySideSection
        title="The Strike of 1957"
        mediaUrl={assetUrl("/hero-assets/stills/memorial-gathering.jpg")}
        mediaType="image"
        mediaPosition="right"
        mediaAlt="Community gathering on Palm Island"
        backgroundColor="bg-stone-50"
        content={
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-picc-red">
              10 June 1957 — A defining moment
            </p>
            <p>
              On 10 June 1957, Palm Island residents launched a five-day strike — one of the earliest
              and most significant acts of organised Aboriginal resistance in Australian history.
            </p>
            <p>
              The <strong>&ldquo;Magnificent Seven&rdquo;</strong> who led the strike were: Willie
              Thaiday, Albie Geia, Eric Lymburner, Sonny Sibley, Bill Congoo, George Watson, and
              Gordon Tapau.
            </p>
            <p>
              The government&apos;s response was swift and brutal. At 4 AM, police conducted a dawn
              raid. The seven leaders were handcuffed and tied to the mast of a boat. They and their
              families were banished from the island — scattered across the state as punishment for
              daring to resist.
            </p>
            <p>
              The strike failed to change conditions immediately. But it planted a seed. It proved
              that resistance was possible, that solidarity could hold even against overwhelming
              force. It became a founding story of the modern Aboriginal rights movement.
            </p>
            {artifacts['strike-1957'] && (
              <ArtifactsList artifacts={artifacts['strike-1957']} title="Sources & Artifacts" />
            )}
          </div>
        }
      />

      {/* ── Chapter 8: Fantome Island ───────────────────────────────────────── */}
      <TextSection
        title="Fantome Island"
        subtitle="The Lock Hospital & Lazaret — 1928–1973"
        backgroundColor="bg-stone-50"
        content={
          <div className="space-y-4">
            <p>
              Just off Palm Island lies Fantome Island, home to two institutions that cast long
              shadows over the community.
            </p>
            <p>
              The <strong>Lock Hospital (1928–1945)</strong> confined Aboriginal people diagnosed with
              sexually transmitted infections. Patients were transferred under police escort, often
              with no understanding of why they were being taken. The <strong>Lazaret
              (1939–1973)</strong> housed people with Hansen&apos;s disease (leprosy), run by
              religious orders.
            </p>
            <p>
              When the Health Department finally closed the Lazaret in 1973, they burned the
              buildings. But the graves remain. Most Palm Island families have at least one family
              member buried on Fantome Island.
            </p>
            <p>
              Today, Fantome Island is a place of deep cultural significance — a site of remembrance,
              grief, and the enduring bonds between the living and the dead.
            </p>
          </div>
        }
      />

      {/* ── Chapter 9: Mulrunji ─────────────────────────────────────────────── */}
      <FullBleedImage
        imageUrl={assetUrl("/hero-assets/stills/palm-sunset-pier.jpg")}
        alt="Palm Island at sunset — a community that has endured"
        height="medium"
        caption="Palm Island — a community that has endured, and continues to endure"
      />

      <TextSection
        title="Mulrunji"
        subtitle="19 November 2004 — A death that shook the nation"
        backgroundColor="bg-stone-900"
        content={
          <div className="space-y-4 text-stone-300">
            <p>
              On 19 November 2004, Cameron Doomadgee — known to his community as Mulrunji — was
              arrested on Palm Island. He was dead within 60 minutes of entering the police station.
              He was 36 years old.
            </p>
            <p>
              The autopsy revealed injuries consistent with severe force — a ruptured liver and
              portal vein, four broken ribs, and a black eye. Yet the arresting officer, Senior
              Sergeant Chris Hurley, was acquitted of all charges in 2007.
            </p>
            <p>
              In the immediate aftermath, 400 community members took to the streets. The courthouse
              and police station were burned. Mulrunji&apos;s death was the 147th Aboriginal death in
              custody since the 1991 Royal Commission.
            </p>
            <p className="text-white">
              In 2016, the police response to the community uprising was ruled racially
              discriminatory by the court. In 2018, Queensland reached a $30 million settlement with
              the community.
            </p>
            <p>
              Mulrunji&apos;s death — and the community&apos;s refusal to accept it in silence —
              became a turning point. It galvanised calls for justice, accountability, and the urgent
              need for communities to control their own affairs.
            </p>
            {artifacts.mulrunji && (
              <ArtifactsList artifacts={artifacts.mulrunji} title="Legal Records & Sources" dark />
            )}
          </div>
        }
      />

      {/* ── Chapter 10: Self-Determination — PICC's Journey ─────────────────── */}
      <QuoteSection
        quote="From one staff member and no income to 197 staff and $23.4 million — this is what self-determination looks like."
        size="medium"
      />

      <TimelineSection
        title="Self-Determination — PICC's Journey"
        events={PICC_TIMELINE}
        backgroundColor="bg-white"
      />

      {/* ── Chapter 11: Photo Gallery ───────────────────────────────────────── */}
      <ImageGallery
        title="Through the Decades"
        images={GALLERY_PHOTOS}
        columns={3}
        backgroundColor="bg-stone-50"
      />

      {/* ── Chapter 12: Closing ─────────────────────────────────────────────── */}
      <QuoteSection
        quote="From Hull River to community control — Year 18 of 20"
        size="large"
        backgroundColor="bg-gradient-to-br from-picc-earth to-stone-900"
        textColor="text-white"
      />

      <section className="bg-white editorial-section">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <ScrollReveal direction="up">
            <p className="text-xl text-gray-700 mb-12 leading-relaxed">
              This history belongs to the Manbarra people, the Bwgcolman community, and every family
              whose story is woven into Palm Island. It is a history of profound injustice — and
              extraordinary resilience. The journey continues.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/20-years"
                className="group p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-picc-ochre/50 transition-all"
              >
                <div className="font-semibold text-gray-900 group-hover:text-picc-ochre text-sm">
                  The 20-Year Vision
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-picc-ochre mt-2 transition-colors" />
              </Link>
              <Link
                href="/wiki/timeline"
                className="group p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-picc-ochre/50 transition-all"
              >
                <div className="font-semibold text-gray-900 group-hover:text-picc-ochre text-sm">
                  Interactive Timeline
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-picc-ochre mt-2 transition-colors" />
              </Link>
              <Link
                href="/wiki/culture"
                className="group p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-picc-ochre/50 transition-all"
              >
                <div className="font-semibold text-gray-900 group-hover:text-picc-ochre text-sm">
                  Culture & Language
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-picc-ochre mt-2 transition-colors" />
              </Link>
              <Link
                href="/elders"
                className="group p-4 bg-stone-50 rounded-xl border border-stone-200 hover:border-picc-ochre/50 transition-all"
              >
                <div className="font-semibold text-gray-900 group-hover:text-picc-ochre text-sm">
                  Our Elders
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-picc-ochre mt-2 transition-colors" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </StoryContainer>
  );
}
