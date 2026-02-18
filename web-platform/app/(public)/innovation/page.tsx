import { Metadata } from 'next';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import { ArrowRight, Lightbulb, Mic } from 'lucide-react';
import {
  HeroSection,
  TextSection,
  QuoteSection,
  ScrollReveal,
  StoryContainer,
} from '@/components/story-scroll';

export const metadata: Metadata = {
  title: 'Innovation on Country | Palm Island Community Company',
  description:
    'Five innovation projects driving community-led change, self-determination, and digital sovereignty on Palm Island.',
};

export const revalidate = 300;

interface ProjectCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: string;
  project_type: string;
}

export default async function InnovationPage() {
  const supabase = createServerSupabase();

  // Load innovation projects with their immersive story slugs
  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug, name, description, status, project_type')
    .eq('project_type', 'innovation')
    .order('name');

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    in_progress: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    planning: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Planning' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
  };

  return (
    <StoryContainer>
      {/* Hero */}
      <HeroSection
        title="Innovation on Country"
        subtitle="Our Community, Our Future, Our Way"
        height="screen"
        overlay="gradient"
        textPosition="center"
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
              our community on our terms. From a professional photo studio to an
              on-country server that keeps our data in our hands, each project below
              reflects decades of community wisdom meeting modern capability.
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

      {/* Project Cards Grid */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
              Our Innovation Projects
            </h2>
            <p className="text-lg text-gray-500 text-center mb-16 max-w-2xl mx-auto">
              Five projects driving community-led change across culture, technology,
              enterprise, and knowledge.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(projects as ProjectCard[] | null)?.map((project, index) => {
              const status = statusColors[project.status] || statusColors.planning;

              return (
                <ScrollReveal
                  key={project.id}
                  direction="up"
                  delay={index * 0.1}
                >
                  <article className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 ease-elegant overflow-hidden group h-full flex flex-col">
                    {/* Status bar */}
                    <div
                      className={`h-1.5 ${
                        project.status === 'active'
                          ? 'bg-green-500'
                          : project.status === 'completed'
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                      }`}
                    />

                    <div className="p-8 flex flex-col flex-1">
                      {/* Status + Category */}
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                        {project.name}
                      </h3>

                      <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                        {project.description}
                      </p>

                      {/* CTA */}
                      <Link
                        href={`/wiki/innovation/${project.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors group/link"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>

          {/* Fallback if no projects loaded */}
          {(!projects || projects.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Innovation projects are being prepared. Check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Elder Quote */}
      <QuoteSection
        quote="Innovation for our mob isn't about chasing what's new. It's about finding better ways to care for our people and protect what matters."
        author="PICC Elder Advisory"
        role="Palm Island Community Company"
        size="large"
      />

      {/* Road to 20 Years Teaser */}
      <section className="relative h-[60vh] overflow-hidden bg-gradient-to-br from-picc-earth-700 via-picc-earth to-picc-red flex items-center justify-center px-8">
        <div className="text-center">
          <ScrollReveal direction="up">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Road to 20 Years
            </h2>
            <p className="text-2xl text-white/90 mb-8">
              From community control to generational change
            </p>
            <Link
              href="/road-to-20-years"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold text-lg rounded-full shadow-2xl transition-all"
            >
              Explore Our Vision
              <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Voice Matters
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              These projects exist because community members spoke up about what they
              needed. Have an idea? Want to share your story?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/share-voice"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold text-lg rounded-full hover:bg-gray-100 transition-all"
              >
                <Mic className="w-5 h-5" />
                Share Your Voice
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
              >
                Read Community Stories
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </ScrollReveal>
          <p className="text-gray-500 text-sm mt-12">
            All content shared with permission. Cultural protocols observed.
          </p>
        </div>
      </section>
    </StoryContainer>
  );
}
