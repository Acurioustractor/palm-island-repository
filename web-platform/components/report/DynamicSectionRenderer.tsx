'use client'

import { Users, Heart } from 'lucide-react'
import {
  ReportHero,
  ImpactStatCard,
  ImpactStatsGrid,
  Section,
  SectionHeader,
  ScrollReveal,
  QuoteShowcase,
  LeadershipMessage,
  FeaturedVideo,
  PhotoGallery,
  ServiceImpact,
  Timeline,
  ProjectShowcase,
  Divider,
  PersonQuoteGrid,
  DollarBreakdown,
  FinancialDonut,
} from '@/components/report'
import { EditableSection } from '@/components/report/editors'

// Section data from database
export interface ReportSectionData {
  id: string
  report_id: string
  section_type: string
  section_title: string | null
  section_content: string | null
  display_order: number
  metadata?: any
}

// Context data passed to sections (images, services, projects, etc.)
export interface SectionContext {
  report: any
  heroImage?: string
  heroVideo?: string
  ceoImage?: string
  chairImage?: string
  services?: any[]
  projects?: any[]
  stories?: any[]
  galleryPhotos?: any[]
  milestones?: any[]
  quotes?: any[]
  communityVoices?: any[]
  stats?: any
  financialData?: any[]
  dollarBreakdownData?: any[]
  isEditMode: boolean
}

// Parse section content (could be JSON or plain text)
function parseContent(content: string | null): any {
  if (!content) return {}
  try {
    if (content.startsWith('{') || content.startsWith('[')) {
      return JSON.parse(content)
    }
  } catch {
    // Not JSON
  }
  return { text: content }
}

interface DynamicSectionRendererProps {
  section: ReportSectionData
  context: SectionContext
  index: number
  totalSections: number
}

export default function DynamicSectionRenderer({
  section,
  context,
  index,
  totalSections,
}: DynamicSectionRendererProps) {
  const { isEditMode } = context
  const content = parseContent(section.section_content)

  // Build data object for EditableSection
  const buildEditData = () => {
    return {
      id: section.id,
      title: section.section_title,
      content: section.section_content,
      ...content,
    }
  }

  // Render based on section type
  const renderSection = () => {
    switch (section.section_type) {
      case 'hero_image':
        return (
          <ReportHero
            title={content.title || context.report?.title || 'Annual Report'}
            subtitle={content.subtitle || context.report?.subtitle || context.report?.theme}
            year={context.report?.report_year}
            organization="Palm Island Community Company"
            tagline="Our Community, Our Future, Our Way"
            backgroundImage={content.image || context.heroImage}
            backgroundVideo={content.video || context.heroVideo}
          />
        )

      case 'stats_bar':
        const stats = content.stats || [
          { value: context.stats?.total_staff || 0, label: 'Staff Members', suffix: '' },
          { value: context.stats?.episodes_of_care || 0, label: 'Episodes of Care', suffix: '' },
        ]
        return (
          <ImpactStatsGrid background="gradient" columns={Math.min(stats.length, 4) as 2 | 3 | 4}>
            {stats.map((stat: any, idx: number) => (
              <ImpactStatCard
                key={idx}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                icon={idx === 0 ? Users : Heart}
                color="white"
                animateOnScroll
              />
            ))}
          </ImpactStatsGrid>
        )

      case 'executive_summary':
      case 'text':
        return (
          <Section background="white" padding="xl">
            {section.section_title && (
              <SectionHeader
                title={section.section_title}
                subtitle={content.subtitle}
              />
            )}
            <ScrollReveal animation="fadeUp" delay={200}>
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {content.text || section.section_content || context.report?.executive_summary || ''}
                </p>
              </div>
            </ScrollReveal>
          </Section>
        )

      case 'leadership_message':
        const isChair = section.section_title?.toLowerCase().includes('chair')
        return (
          <LeadershipMessage
            name={content.name || (isChair ? 'Board Chair' : 'CEO')}
            role={content.role || (isChair ? 'Board Chairperson' : 'Chief Executive Officer')}
            image={content.image || (isChair ? context.chairImage : context.ceoImage)}
            message={content.message || section.section_content || ''}
            signature={content.signature}
          />
        )

      case 'quote':
        const quoteIndex = context.quotes?.findIndex(q => q.id === section.id) ?? -1
        const fallbackQuote = context.quotes?.[quoteIndex >= 0 ? quoteIndex : 0]
        return (
          <QuoteShowcase
            quote={content.quote || fallbackQuote?.quote_text || section.section_content || ''}
            author={content.author || fallbackQuote?.attribution || section.section_title || ''}
            role={content.role || fallbackQuote?.impact_area}
            image={content.image || fallbackQuote?.photo_url}
            variant={index < 5 ? 'featured' : 'centered'}
            background={index % 3 === 0 ? 'gradient' : index % 3 === 1 ? 'ocean' : 'light'}
          />
        )

      case 'video':
        return (
          <Section background="white" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} />
            )}
            <div className="max-w-4xl mx-auto">
              {content.url ? (
                <FeaturedVideo
                  url={content.url}
                  title={content.title || section.section_title || ''}
                  description={content.description || ''}
                  thumbnail={content.thumbnail}
                  badge={content.badge}
                />
              ) : (
                <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                  <p className="text-gray-400">Click to add a video URL</p>
                </div>
              )}
            </div>
          </Section>
        )

      case 'photo_gallery':
        const photos = content.photos || context.galleryPhotos || []
        return (
          <Section background="light" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} subtitle="Moments that captured the spirit of our community" />
            )}
            {photos.length > 0 ? (
              <PhotoGallery photos={photos} columns={4} layout="masonry" />
            ) : (
              <div className="max-w-4xl mx-auto bg-gray-100 rounded-2xl h-48 flex items-center justify-center">
                <p className="text-gray-400">Click to add photos</p>
              </div>
            )}
          </Section>
        )

      case 'project_showcase':
        const projects = content.projects || context.projects || []
        return (
          <Section background="light" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} subtitle="Projects transforming our community" />
            )}
            {projects.length > 0 ? (
              <ProjectShowcase
                projects={projects.map((p: any) => ({
                  title: p.name || p.title,
                  description: p.description,
                  tagline: p.tagline,
                  category: p.project_type || p.category,
                  image: p.hero_image_url || p.image,
                  link: `/projects/${p.id}`,
                }))}
                variant="magazine"
              />
            ) : (
              <div className="max-w-4xl mx-auto bg-gray-100 rounded-2xl h-48 flex items-center justify-center">
                <p className="text-gray-400">Click to add projects</p>
              </div>
            )}
          </Section>
        )

      case 'services':
        const services = content.services || context.services || []
        return (
          <Section background="white" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} subtitle="Supporting our community across all aspects of life" />
            )}
            {services.length > 0 ? (
              <ServiceImpact
                services={services.map((s: any) => ({
                  name: s.name,
                  description: s.description,
                  category: s.category,
                  icon: s.icon,
                  color: s.color,
                }))}
              />
            ) : (
              <div className="max-w-4xl mx-auto bg-gray-100 rounded-2xl h-48 flex items-center justify-center">
                <p className="text-gray-400">Services will be loaded from database</p>
              </div>
            )}
          </Section>
        )

      case 'timeline':
        const events = content.events || context.milestones || []
        return (
          <Section background="earth" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} subtitle="Key milestones and achievements" />
            )}
            {events.length > 0 ? (
              <Timeline events={events} variant="vertical" />
            ) : (
              <div className="max-w-4xl mx-auto bg-gray-100 rounded-2xl h-48 flex items-center justify-center">
                <p className="text-gray-400">Click to add timeline events</p>
              </div>
            )}
          </Section>
        )

      case 'community_voices':
        const voices = content.voices || context.communityVoices || []
        return (
          <Section background="light" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} subtitle="Meet the people who make Palm Island strong" />
            )}
            {voices.length > 0 ? (
              <PersonQuoteGrid people={voices} />
            ) : (
              <div className="max-w-4xl mx-auto bg-gray-100 rounded-2xl h-48 flex items-center justify-center">
                <p className="text-gray-400">Click to add community voices</p>
              </div>
            )}
          </Section>
        )

      case 'financials':
        return (
          <Section background="light" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} subtitle="Where your support goes - every dollar makes a difference" />
            )}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <ScrollReveal animation="fadeRight">
                <FinancialDonut
                  data={context.financialData || []}
                  centerValue={content.centerValue || "$23.4M"}
                  centerLabel={content.centerLabel || "Total Revenue"}
                  interactive
                  showLegend
                  animateOnScroll
                />
              </ScrollReveal>
              <ScrollReveal animation="fadeLeft" delay={200}>
                <DollarBreakdown
                  items={context.dollarBreakdownData || []}
                  title="Where Each Dollar Goes"
                  subtitle="60 cents of every dollar goes directly to staff wages"
                  interactive
                />
              </ScrollReveal>
            </div>
          </Section>
        )

      case 'acknowledgments':
        return (
          <Section background="dark" padding="xl">
            <div className="text-center max-w-3xl mx-auto">
              <ScrollReveal animation="fadeUp">
                <h2 className="text-3xl font-bold text-white mb-6">{section.section_title || 'Acknowledgments'}</h2>
                <div className="text-gray-300 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
                  {content.text || section.section_content || context.report?.acknowledgments || ''}
                </div>
              </ScrollReveal>
              <ScrollReveal animation="fadeUp" delay={200}>
                <div className="mt-12 pt-8 border-t border-gray-700">
                  <p className="text-2xl font-light text-white/80 italic mb-4">
                    "Our Community, Our Future, Our Way"
                  </p>
                  <p className="text-gray-500 text-sm">
                    Palm Island Community Company &copy; {context.report?.report_year || new Date().getFullYear()}
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </Section>
        )

      case 'divider':
        return <Divider />

      default:
        // Fallback for unknown section types
        return (
          <Section background="white" padding="xl">
            {section.section_title && (
              <SectionHeader title={section.section_title} />
            )}
            <div className="max-w-3xl mx-auto">
              <div className="text-gray-700 whitespace-pre-wrap">
                {section.section_content || `Section type: ${section.section_type}`}
              </div>
            </div>
          </Section>
        )
    }
  }

  return (
    <EditableSection
      sectionId={section.id}
      sectionType={section.section_type}
      label={section.section_title || section.section_type.replace(/_/g, ' ')}
      isEditMode={isEditMode}
      data={buildEditData()}
    >
      {renderSection()}
    </EditableSection>
  )
}
