'use client';

import Link from 'next/link';
import { ArrowLeft, Users, Activity, Calendar, Award, ExternalLink, Mic } from 'lucide-react';
import {
  HeroSection,
  TextSection,
  QuoteSection,
  SideBySideSection,
  ImageGallery,
  VideoSection,
} from '@/components/story-scroll';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import { getServiceIcon } from '@/lib/services/service-icons';

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  service_category: string | null;
  service_color: string | null;
  icon_name: string | null;
  metadata: any;
}

interface ServiceMetric {
  fiscal_year: string;
  clients_served: number | null;
  sessions_delivered: number | null;
  staff_count: number | null;
  events_held: number | null;
  key_achievement: string | null;
  headline_stat_value: string | null;
  headline_stat_label: string | null;
}

interface StoryItem {
  id: string;
  title: string;
  content: string | null;
  quote_text: string | null;
  summary: string | null;
  storyteller?: {
    full_name: string;
    preferred_name: string | null;
    profile_image_url: string | null;
    is_elder: boolean;
  } | null;
}

interface MediaItem {
  id: string;
  public_url: string;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  file_type: string;
}

interface VideoItem {
  id: string;
  public_url: string;
  title: string | null;
  caption: string | null;
  alt_text: string | null;
  file_type: string;
}

interface ELVoice {
  text: string;
  author: string;
  theme: string | null;
}

interface Props {
  service: ServiceData;
  metrics: ServiceMetric[];
  stories: StoryItem[];
  media: MediaItem[];
  heroImage: string | null;
  heroVideo: string | null;
  videos: VideoItem[];
  videoUrl: string | null;
  elVoices?: ELVoice[];
}

export function ServiceStoryPage({
  service,
  metrics,
  stories,
  media,
  heroImage,
  heroVideo,
  videos,
  videoUrl,
  elVoices = [],
}: Props) {
  const latestMetrics = metrics[0] || null;
  const quote = stories.find((s) => s.quote_text)?.quote_text || null;
  const quoteAuthor = stories.find((s) => s.quote_text)?.storyteller;
  const images = media.filter((m) => m.file_type === 'image');
  const statBadge = latestMetrics?.headline_stat_value
    ? `${latestMetrics.headline_stat_value} ${latestMetrics.headline_stat_label || ''}`
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero — prefer video background when available */}
      <HeroSection
        title={service.name}
        subtitle={statBadge || service.service_category?.replace(/_/g, ' ') || 'PICC Service'}
        backgroundImage={heroImage || undefined}
        backgroundVideo={heroVideo || undefined}
        height="tall"
        overlay="dark"
        textPosition="center"
      />

      {/* Back nav + service badge */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          All Services
        </Link>
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: service.service_color || '#C8922A' }}
          >
            <BespokeIcon name={getServiceIcon(service.slug)} size={18} darkMode />
          </div>
          <span className="font-medium text-gray-700 capitalize">
            {service.service_category?.replace(/_/g, ' ') || 'Service'}
          </span>
        </div>
      </div>

      {/* About Section */}
      {service.description && (
        <TextSection
          title="About This Service"
          content={
            <p className="text-lg text-gray-700 leading-relaxed">
              {service.description}
            </p>
          }
          maxWidth="medium"
        />
      )}

      {/* Impact Data */}
      {latestMetrics && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Impact Data — {latestMetrics.fiscal_year}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestMetrics.clients_served != null && (
                <MetricCard
                  icon={<Activity className="w-6 h-6" />}
                  value={latestMetrics.clients_served.toLocaleString()}
                  label="People Served"
                  color={service.service_color || '#C8922A'}
                />
              )}
              {latestMetrics.staff_count != null && (
                <MetricCard
                  icon={<Users className="w-6 h-6" />}
                  value={latestMetrics.staff_count.toString()}
                  label="Staff Members"
                  color={service.service_color || '#C8922A'}
                />
              )}
              {latestMetrics.sessions_delivered != null && (
                <MetricCard
                  icon={<Calendar className="w-6 h-6" />}
                  value={latestMetrics.sessions_delivered.toLocaleString()}
                  label="Sessions Delivered"
                  color={service.service_color || '#C8922A'}
                />
              )}
              {latestMetrics.key_achievement && (
                <MetricCard
                  icon={<Award className="w-6 h-6" />}
                  value=""
                  label={latestMetrics.key_achievement}
                  color={service.service_color || '#C8922A'}
                  isText
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Community Quote */}
      {quote && (
        <QuoteSection
          quote={quote}
          author={quoteAuthor?.preferred_name || quoteAuthor?.full_name || undefined}
          role={quoteAuthor?.is_elder ? 'Community Elder' : 'Community Member'}
          photoUrl={quoteAuthor?.profile_image_url || undefined}
        />
      )}

      {/* Photo Gallery */}
      {images.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Gallery
            </h2>
            <ImageGallery
              images={images.map((img) => ({
                url: img.public_url,
                caption: img.caption || img.title || img.alt_text || '',
                alt: img.alt_text || img.title || 'Service photo',
              }))}
              columns={images.length <= 4 ? 2 : images.length <= 9 ? 3 : 4}
            />
          </div>
        </section>
      )}

      {/* Videos — show all available, not just one */}
      {videos.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            {videos.length === 1 ? (
              <VideoSection
                videoUrl={videos[0].public_url}
                title={videos[0].title || `${service.name} — Video`}
                caption={videos[0].caption || undefined}
              />
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Videos
                </h2>
                <div className="space-y-12">
                  {videos.map((video) => (
                    <VideoSection
                      key={video.id}
                      videoUrl={video.public_url}
                      title={video.title || `${service.name} — Video`}
                      caption={video.caption || undefined}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Related Stories */}
      {stories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Community Stories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.slice(0, 6).map((story) => (
                <Link
                  key={story.id}
                  href={`/stories/${story.id}`}
                  className="group block"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-picc-ochre-300 hover:shadow-xl transition-all h-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-picc-ochre transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    {story.storyteller && (
                      <div className="text-sm text-gray-500 mb-3">
                        by {story.storyteller.preferred_name || story.storyteller.full_name}
                      </div>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {story.summary || (story.content || '').slice(0, 180)}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-picc-ochre font-semibold text-sm">
                      Read story
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-picc-earth-600 to-picc-earth text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Share Your Experience</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Have you been supported by {service.name}? Share your story and help
            strengthen our community record.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/share-voice"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-picc-earth-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
            >
              <Mic className="w-5 h-5" />
              Share Your Voice
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-picc-earth-600 transition-all"
            >
              All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ─── EMPATHY LEDGER VOICES — sovereign data ─── */}
      {elVoices.length > 0 && (
        <section className="py-20 px-6 bg-warm-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-picc-ochre mb-3">
                Empathy Ledger · Voices of {service.name}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Community voices behind this work
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Real voices from the sovereign archive — what {service.name.toLowerCase()} sounds like from inside the work.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elVoices.map((voice, i) => (
                <div
                  key={i}
                  className="bg-white border border-warm-100 rounded-2xl p-7 hover:border-picc-ochre/40 transition-colors"
                >
                  <div className="text-picc-ochre text-5xl font-serif leading-none mb-2 opacity-30">&ldquo;</div>
                  <p className="font-serif italic text-gray-700 leading-relaxed text-base mb-4 line-clamp-5 -mt-3">
                    {voice.text}
                  </p>
                  <p className="text-sm font-semibold text-picc-ochre">{voice.author}</p>
                  {voice.theme && (
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      {voice.theme.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/picc/pcap"
                className="inline-flex items-center gap-2 text-sm font-semibold text-picc-ochre hover:gap-3 transition-all"
              >
                Explore all 525 sovereign voices
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  color,
  isText,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
      <div
        className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      {isText ? (
        <p className="text-sm font-semibold text-gray-700">{label}</p>
      ) : (
        <>
          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </>
      )}
    </div>
  );
}

export default ServiceStoryPage;
