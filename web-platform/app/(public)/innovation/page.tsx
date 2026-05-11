import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Lightbulb, Mic } from 'lucide-react';
import {
  HeroSection,
  TextSection,
  QuoteSection,
  ScrollReveal,
  StoryContainer,
} from '@/components/story-scroll';
import { createServerComponentClient } from '@/lib/supabase/server';
import { getCuratedQuotes } from '@/lib/quotes/get-curated-quotes';
import { getHeroImage, getMediaByTags } from '@/lib/media/utils';
import { assetUrl } from '@/lib/media/asset-url';
import { getELQuotes } from '@/lib/empathy-ledger/el-server';
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects';
import { C } from '@/components/annual-report/2024-25/almanac/tokens';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Innovation on Country | Palm Island Community Company',
  description:
    'Innovation projects driving community-led change, self-determination, and digital sovereignty on Palm Island.',
};

export const revalidate = 300;

/* ────────────────────────────────────────────────── */
/*  Types & display config                            */
/* ────────────────────────────────────────────────── */

type Theme = 'Culture & Country' | 'Technology & Sovereignty' | 'Employment & Enterprise';

const themeDescriptions: Record<Theme, string> = {
  'Culture & Country':
    'Strengthening cultural identity and connection to Country through creative and community-led initiatives.',
  'Technology & Sovereignty':
    'Building digital infrastructure that keeps community data and knowledge in community hands.',
  'Employment & Enterprise':
    'Creating local jobs and circular-economy enterprises that build long-term economic independence.',
};

const themePillColors: Record<Theme, string> = {
  'Culture & Country': 'bg-picc-ochre/15 text-picc-ochre',
  'Technology & Sovereignty': 'bg-picc-earth/15 text-picc-earth-700',
  'Employment & Enterprise': 'bg-picc-red/15 text-picc-red',
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  in_progress: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  planning: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Planning' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
  on_hold: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'On Hold' },
};

/**
 * Map tags/impact_areas to a theme bucket. Falls back to Technology & Sovereignty.
 */
function inferTheme(project: {
  tags?: string[] | null;
  impact_areas?: string[] | null;
}): Theme {
  const combined = [
    ...(project.tags || []),
    ...(project.impact_areas || []),
  ].map((t) => t.toLowerCase());

  if (combined.some((t) => ['culture', 'elders', 'cultural', 'country', 'photo', 'photo-studio'].includes(t))) {
    return 'Culture & Country';
  }
  if (combined.some((t) => ['employment', 'enterprise', 'economic', 'recycling', 'jobs'].includes(t))) {
    return 'Employment & Enterprise';
  }
  return 'Technology & Sovereignty';
}

/**
 * Pick a gradient based on theme
 */
function themeGradient(theme: Theme): string {
  switch (theme) {
    case 'Culture & Country':
      return 'from-picc-ochre to-picc-red';
    case 'Employment & Enterprise':
      return 'from-picc-ochre to-picc-earth';
    case 'Technology & Sovereignty':
    default:
      return 'from-picc-earth-700 via-picc-earth to-picc-red';
  }
}

/**
 * Pick an icon name based on tags or fallback
 */
function inferIcon(project: { tags?: string[] | null; slug?: string }): string {
  const tags = (project.tags || []).map((t) => t.toLowerCase());
  if (tags.includes('photo') || project.slug?.includes('photo')) return 'photo';
  if (tags.includes('culture') || project.slug?.includes('elder') || project.slug?.includes('cultural')) return 'culture';
  if (tags.includes('digital') || project.slug?.includes('server') || project.slug?.includes('digital')) return 'digital';
  if (tags.includes('knowledge') || project.slug?.includes('report')) return 'knowledge';
  if (tags.includes('economic') || project.slug?.includes('recycl') || project.slug?.includes('centre')) return 'economic';
  return 'community';
}

const themes: Theme[] = ['Culture & Country', 'Technology & Sovereignty', 'Employment & Enterprise'];

/* ────────────────────────────────────────────────── */
/*  Data fetching                                     */
/* ────────────────────────────────────────────────── */

async function getInnovationProjects() {
  // Empathy Ledger v2 is the canonical source. PICC's rule: every project
  // is an innovation project — there is no subset filter. We pull the full
  // active roster and pass it through.
  const projects = await getPiccProjects({ status: 'all' });

  return projects
    .filter((p) => p.status !== 'cancelled')
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      status: p.status,
      project_type: p.project_type,
      tags: p.themes,
      impact_areas: p.themes,
      hero_image_url: p.cover_image_url,
    }));
}

/* ────────────────────────────────────────────────── */
/*  Page                                              */
/* ────────────────────────────────────────────────── */

export default async function InnovationPage() {
  // Fetch all data in parallel
  const [projects, quotes, heroImageUrl, heroTagMedia, elQuotes] = await Promise.all([
    getInnovationProjects(),
    getCuratedQuotes({ limit: 1, source_type: 'elder' }),
    getHeroImage('innovation'),
    getMediaByTags(['innovation', 'hero'], 1, 'image'),
    getELQuotes({ limit: 300, minImpact: 50 }).catch(() => []),
  ]);

  const heroImage = heroImageUrl || heroTagMedia[0]?.public_url || null;
  const elderQuote = quotes[0] || null;

  // Pick 3 innovation-themed voices from EL
  const innovationVoices: { text: string; author: string; theme: string | null }[] = [];
  const seenVoiceAuthors = new Set<string>();
  for (const q of elQuotes) {
    const text = (q.quote_text || '').toLowerCase();
    if (!text || text.length < 50 || text.length > 280) continue;
    const isInnovation = /(innovat|future|build|new|change|technology|digital|sovereign|next|create|design)/i.test(text);
    if (!isInnovation) continue;
    const raw = (q.author_name || '').trim();
    const name = !raw || raw.toLowerCase() === 'unknown' ? 'Community Member' : raw;
    if (seenVoiceAuthors.has(name)) continue;
    seenVoiceAuthors.add(name);
    innovationVoices.push({
      text: q.quote_text || '',
      author: name,
      theme: Array.isArray(q.themes) && q.themes.length > 0 ? q.themes[0] : null,
    });
    if (innovationVoices.length >= 3) break;
  }

  // Group projects by theme
  const projectsByTheme = new Map<Theme, typeof projects>();
  for (const project of projects) {
    const theme = inferTheme(project);
    if (!projectsByTheme.has(theme)) {
      projectsByTheme.set(theme, []);
    }
    projectsByTheme.get(theme)!.push(project);
  }

  const hasProjects = projects.length > 0;

  return (
    <StoryContainer>
      {/* Hero */}
      <HeroSection
        title="Innovation on Country"
        subtitle="Our Community, Our Future, Our Way"
        height="screen"
        overlay="gradient"
        textPosition="center"
        backgroundImage={heroImage || undefined}
        backgroundVideo={assetUrl("/hero-assets/clips/centre-youth-work.mp4")}
      >
        <div className="mt-8">
          <Lightbulb className="w-16 h-16 text-white mx-auto opacity-80" />
        </div>
      </HeroSection>

      {/* Philosophy / The Why */}
      <TextSection
        title="Why We Innovate"
        content={
          <>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Every innovation at PICC starts with one question:{' '}
              <em>How do we make life better for our mob?</em>
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              In 1918, our people were moved from Hull River to Palm Island after a
              devastating cyclone. Over a century later, we are still here — stronger,
              more connected, and determined to shape our own future. Community control
              is not just a governance model. It is the foundation of every project we
              undertake.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Self-determination means building the tools, spaces, and systems that serve
              our community on our terms. Each project below reflects decades of community
              wisdom meeting modern capability.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              These are not pilot programs imposed from outside. They are community-led
              responses to real needs, designed by the people who understand them best.
            </p>
          </>
        }
        backgroundColor="bg-white"
        maxWidth="medium"
      />

      {/* Themed Project Sections */}
      {hasProjects ? (
        <section className="py-20 px-6" style={{ backgroundColor: C.shell }}>
          <div className="max-w-6xl mx-auto">
            <ScrollReveal direction="up">
              <p
                className="font-bold uppercase mb-4 text-center"
                style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
              >
                Innovation portfolio
              </p>
              <h2
                className="font-fraunces font-bold text-center mb-4"
                style={{ color: C.ocean, fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
              >
                Our innovation projects
              </h2>
              <p
                className="font-fraunces text-center mb-16 max-w-2xl mx-auto"
                style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
              >
                Community-led projects driving change across culture, technology, and enterprise.
              </p>
            </ScrollReveal>

            {themes.map((theme) => {
              const themeProjects = projectsByTheme.get(theme);
              if (!themeProjects || themeProjects.length === 0) return null;

              return (
                <div key={theme} className="mb-16 last:mb-0">
                  {/* Theme header */}
                  <ScrollReveal direction="up">
                    <div className="mb-8">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-3 ${themePillColors[theme]}`}
                      >
                        {theme}
                      </span>
                      <p className="text-gray-500 text-base max-w-2xl">
                        {themeDescriptions[theme]}
                      </p>
                    </div>
                  </ScrollReveal>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {themeProjects.map((project: any, index: number) => {
                      const projectTheme = inferTheme(project);
                      const status = statusConfig[project.status] || statusConfig['planning'];
                      const icon = inferIcon(project);
                      const gradient = themeGradient(projectTheme);

                      return (
                        <ScrollReveal
                          key={project.id}
                          direction="up"
                          delay={index * 0.1}
                        >
                          <article className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 ease-elegant overflow-hidden group h-full flex flex-col">
                            {/* Gradient thumbnail with icon */}
                            <div
                              className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center`}
                            >
                              <Image
                                src={assetUrl(`/icons/bespoke-white/${icon}.png`)}
                                alt=""
                                width={48}
                                height={48}
                                className="opacity-90"
                              />
                            </div>

                            <div className="p-8 flex flex-col flex-1">
                              {/* Category pill + Status badge */}
                              <div className="flex items-center gap-2 mb-4">
                                <span
                                  className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${themePillColors[projectTheme]}`}
                                >
                                  {projectTheme}
                                </span>
                                <span
                                  className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                                {project.name}
                              </h3>

                              {/* Tagline or description excerpt */}
                              <p className="text-gray-600 leading-relaxed mb-5">
                                {project.tagline || (project.description?.slice(0, 200) + (project.description?.length > 200 ? '...' : ''))}
                              </p>

                              {/* Status indicator */}
                              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-gray-400">
                                {project.status === 'active' || project.status === 'in_progress'
                                  ? 'Currently running'
                                  : project.status === 'planning'
                                    ? 'In development'
                                    : project.status === 'completed'
                                      ? 'Complete'
                                      : project.status === 'on_hold'
                                        ? 'On hold'
                                        : ''}
                              </span>
                            </div>
                          </article>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* Empty state — no innovation projects in database yet */
        <section className="py-20 px-6" style={{ backgroundColor: C.shell }}>
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal direction="up">
              <Lightbulb className="w-16 h-16 mx-auto mb-6" style={{ color: C.muted }} />
              <h2
                className="font-fraunces font-bold mb-4"
                style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.15 }}
              >
                Innovation projects
              </h2>
              <p className="font-fraunces" style={{ color: C.driftwood, fontSize: 18, lineHeight: 1.55 }}>
                Our innovation projects are being documented and will appear here soon. Check back
                for updates on community-led initiatives driving change on Palm Island.
              </p>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Elder Quote — only shown if real quote exists */}
      {elderQuote && (
        <QuoteSection
          quote={elderQuote.quote}
          author={elderQuote.speaker_name || undefined}
          role={elderQuote.speaker_role || undefined}
          photoUrl={elderQuote.photo_url || undefined}
          size="large"
        />
      )}

      {/* Community voices on innovation — Empathy Ledger */}
      {innovationVoices.length > 0 && (
        <section className="py-20 px-6" style={{ backgroundColor: C.shell }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p
                className="font-bold uppercase mb-4"
                style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.3em' }}
              >
                Empathy Ledger · Voices of innovation
              </p>
              <h2
                className="font-fraunces font-bold mb-4"
                style={{ color: C.ocean, fontSize: 'clamp(32px, 4.5vw, 44px)', lineHeight: 1.1 }}
              >
                What innovation sounds like
              </h2>
              <p
                className="font-fraunces max-w-2xl mx-auto"
                style={{ color: C.driftwood, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.55 }}
              >
                Real community voices from our sovereign data archive — what change looks like
                from inside the work.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {innovationVoices.map((voice, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-7 transition-colors"
                  style={{ backgroundColor: '#FFFFFF', border: `1px solid ${C.border}`, borderTopWidth: 3, borderTopColor: C.ochre }}
                >
                  <div className="font-fraunces leading-none mb-2" style={{ color: C.ochre, fontSize: 56, opacity: 0.35 }}>&ldquo;</div>
                  <p
                    className="font-fraunces italic leading-relaxed line-clamp-5 -mt-3 mb-4"
                    style={{ color: C.earth, fontSize: 16 }}
                  >
                    {voice.text}
                  </p>
                  <p className="font-bold uppercase" style={{ color: C.turtleRed, fontSize: 11, letterSpacing: '0.2em' }}>{voice.author}</p>
                  {voice.theme && (
                    <p className="capitalize mt-1" style={{ color: C.muted, fontSize: 11 }}>
                      {voice.theme.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/picc/pcap"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: C.ocean, color: '#FBF8EE', letterSpacing: '0.15em' }}
              >
                Explore all 525 sovereign voices
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Road to 20 Years Teaser */}
      <section
        className="relative h-[60vh] overflow-hidden flex items-center justify-center px-8"
        style={{ background: `linear-gradient(135deg, ${C.earth}, ${C.midnight} 60%, ${C.turtleRed})` }}
      >
        <div className="text-center">
          <ScrollReveal direction="up">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
            >
              The horizon
            </p>
            <h2
              className="font-fraunces font-bold mb-4"
              style={{ color: '#FFFFFF', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.05, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              Road to 20 years
            </h2>
            <p
              className="font-fraunces mb-8"
              style={{ color: 'rgba(255,255,255,0.92)', fontSize: 'clamp(18px, 2.4vw, 26px)', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            >
              From community control to generational change.
            </p>
            <Link
              href="/road-to-20-years"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
              style={{ backgroundColor: '#FFFFFF', color: C.ocean, letterSpacing: '0.15em' }}
            >
              Explore our vision
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer CTA */}
      <section
        className="text-white py-20"
        style={{ background: `linear-gradient(135deg, ${C.midnight}, ${C.earth})` }}
      >
        <div className="max-w-4xl mx-auto px-8 text-center">
          <ScrollReveal direction="up">
            <p
              className="font-bold uppercase mb-4"
              style={{ color: C.ochre, fontSize: 11, letterSpacing: '0.3em' }}
            >
              Add your voice
            </p>
            <h2
              className="font-fraunces font-bold mb-6"
              style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1 }}
            >
              Your voice matters
            </h2>
            <p
              className="font-fraunces mb-10 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(18px, 2.2vw, 22px)', lineHeight: 1.6 }}
            >
              These projects exist because community members spoke up about what they needed. Have
              an idea? Want to share your story?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/share-voice"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:opacity-90 transition"
                style={{ backgroundColor: '#FFFFFF', color: C.ocean, letterSpacing: '0.15em' }}
              >
                <Mic className="w-3.5 h-3.5" />
                Share your voice
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md font-bold uppercase text-xs hover:bg-white/15 transition"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}
              >
                Read community stories
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>
          <p className="font-fraunces italic mt-12" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            All content shared with permission. Cultural protocols observed.
          </p>
        </div>
      </section>
    </StoryContainer>
  );
}
