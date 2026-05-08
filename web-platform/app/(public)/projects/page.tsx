/**
 * /projects — public index of every project at PICC.
 *
 * Server component. Pulls every public row from the `projects` table, hands
 * it to ProjectsGrid (client island) for filterable rendering. Mirrors the
 * column-set + theme-inference grammar used by /innovation so the two pages
 * read as the same family.
 *
 * The `/innovation` page lifts a curated subset (INNOVATION_SLUGS); this is
 * the front door for everything else.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import {
  HeroSection,
  ScrollReveal,
  StoryContainer,
} from '@/components/story-scroll'
import { getHeroImage, getMediaByTags } from '@/lib/media/utils'
import { C } from '@/components/annual-report/2024-25/almanac/tokens'
import { ProjectsGrid, type ProjectCardRow } from './ProjectsGrid'
import { getPiccProjects } from '@/lib/empathy-ledger/el-projects'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export const metadata: Metadata = {
  title: 'Projects on Country | Palm Island Community Company',
  description:
    'Every project PICC is building, planning, or has completed — community-led work across culture, technology, and enterprise.',
}

async function getPublicProjects(): Promise<ProjectCardRow[]> {
  // Empathy Ledger v2 is the canonical PICC project roster (Phase 1 of the
  // canonical migration — see thoughts/shared/plans/2026-05-08-el-canonical-migration.md).
  // We query 'all' so completed projects (PICC Centre Precinct etc.) still
  // surface; ProjectsGrid handles the status filter UI.
  const projects = await getPiccProjects({ status: 'all' })

  // Map the EL DTO to the grid's ProjectCardRow shape. The grid was written
  // against PICC Supabase column names; we keep that contract and adapt at
  // the boundary so the grid stays untouched.
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    status: p.status,
    project_type: p.project_type,
    // EL collapses tags + impact_areas into `themes`. inferTheme in the grid
    // reads both — feeding the same array into both keeps the matcher honest.
    tags: p.themes,
    impact_areas: p.themes,
    hero_image_url: p.cover_image_url,
  }))
}

export default async function ProjectsIndexPage() {
  const [projects, heroImageUrl, heroTagMedia] = await Promise.all([
    getPublicProjects(),
    getHeroImage('project').catch(() => null),
    getMediaByTags(['projects', 'hero'], 1, 'image').catch(() => []),
  ])

  const heroImage = heroImageUrl || heroTagMedia[0]?.public_url || null
  const total = projects.length

  return (
    <StoryContainer>
      {/* Hero — Saltwater Almanac grammar: full-bleed photo, big Fraunces, scroll motion */}
      <HeroSection
        title="Projects on Country"
        subtitle={
          total > 0
            ? `${total} project${total === 1 ? '' : 's'} community-led on Palm Island`
            : 'Community-led work on Palm Island'
        }
        height="tall"
        overlay="gradient"
        textPosition="bottom"
        backgroundImage={heroImage || undefined}
      />

      {/* Caption strip — sets the cadence below the hero */}
      <section className="px-6 md:px-12 pt-12 md:pt-16">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div
              className="text-[11px] font-bold uppercase mb-4"
              style={{ color: C.turtleRed, letterSpacing: '0.3em' }}
            >
              Every project, every stage
            </div>
            <h2
              className="font-fraunces font-bold leading-tight max-w-3xl"
              style={{ color: C.ocean, fontSize: 'clamp(28px, 4vw, 44px)' }}
            >
              The work the community is building, in plain view.
            </h2>
            <p
              className="mt-5 max-w-2xl leading-relaxed"
              style={{ color: C.driftwood, fontSize: 17, lineHeight: 1.6 }}
            >
              Some are running. Some are still being planned. Some are finished and live on
              in the community. This page lists every public project — filter by status
              to see where each one sits.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Innovation programmes callout — disambiguates /innovation for users who arrive here */}
      <section className="px-6 md:px-12 pt-10 md:pt-12">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <Link
              href="/innovation"
              className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl px-6 md:px-8 py-6 transition-colors duration-200"
              style={{
                backgroundColor: C.sand,
                border: `1px solid ${C.ochre}`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: C.ochre }}
                >
                  <Sparkles className="w-5 h-5" color="#FFFFFF" aria-hidden="true" />
                </div>
                <div>
                  <div
                    className="text-[11px] font-bold uppercase mb-1"
                    style={{ color: C.turtleRed, letterSpacing: '0.3em' }}
                  >
                    Looking for innovation?
                  </div>
                  <p
                    className="font-fraunces leading-snug"
                    style={{ color: C.ocean, fontSize: 20 }}
                  >
                    Innovation programmes have their own home — curated, themed, and the
                    next-20 working canvas.
                  </p>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold uppercase whitespace-nowrap"
                style={{ color: C.ochre, letterSpacing: '0.25em' }}
              >
                Open /innovation
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Filterable grid */}
      <section className="px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          {projects.length > 0 ? (
            <ProjectsGrid projects={projects} />
          ) : (
            // Empty state — recommend /innovation per spec
            <div
              className="rounded-2xl px-6 md:px-12 py-16 md:py-20 text-center"
              style={{ backgroundColor: C.shell, border: `1px solid ${C.border}` }}
            >
              <div
                className="text-[11px] font-bold uppercase mb-3"
                style={{ color: C.turtleRed, letterSpacing: '0.3em' }}
              >
                No public projects yet
              </div>
              <h3
                className="font-fraunces font-bold leading-tight max-w-xl mx-auto"
                style={{ color: C.ocean, fontSize: 'clamp(24px, 3.5vw, 36px)' }}
              >
                Project pages are still being prepared.
              </h3>
              <p
                className="mt-4 max-w-xl mx-auto leading-relaxed"
                style={{ color: C.driftwood, fontSize: 16 }}
              >
                In the meantime, the curated{' '}
                <Link
                  href="/innovation"
                  className="underline"
                  style={{ color: C.ochre }}
                >
                  Innovation on Country
                </Link>{' '}
                page surfaces the work that&rsquo;s ready to share.
              </p>
              <Link
                href="/innovation"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase font-bold"
                style={{
                  letterSpacing: '0.2em',
                  backgroundColor: C.ochre,
                  color: '#FFFFFF',
                }}
              >
                Visit innovation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA — match the cadence of /projects/[slug] */}
      <section
        className="px-6 md:px-12 py-16 md:py-20 text-center"
        style={{ backgroundColor: C.midnight }}
      >
        <div className="max-w-xl mx-auto">
          <h2
            className="font-fraunces font-bold"
            style={{ color: C.starGold, fontSize: 'clamp(28px, 4.5vw, 42px)' }}
          >
            Have a project to share?
          </h2>
          <p className="mt-4 text-white/85 leading-relaxed">
            Stories, voices, photos, art — every contribution shapes how this work lands.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/share-voice"
              className="px-5 py-2.5 rounded-full font-bold uppercase hover:opacity-90"
              style={{
                backgroundColor: C.starGold,
                color: C.midnight,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              Share a voice
            </Link>
            <Link
              href="/innovation"
              className="px-5 py-2.5 rounded-full font-bold uppercase border hover:opacity-90"
              style={{
                color: C.starGold,
                borderColor: C.starGold,
                fontSize: 11,
                letterSpacing: '0.2em',
              }}
            >
              See innovation
            </Link>
          </div>
        </div>
      </section>
    </StoryContainer>
  )
}
