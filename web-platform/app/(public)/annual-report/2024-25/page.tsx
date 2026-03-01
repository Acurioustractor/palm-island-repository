import { Suspense } from 'react';
import { getReportData } from '@/lib/annual-report/fetch-report-data';
import { PICC_KNOWLEDGE_BASE } from '@/lib/picc-knowledge-base';
import {
  getPageMedia,
  getHeroImage,
  getHeroVideo,
  getMediaByTags,
  getRecentMedia,
} from '@/lib/media/utils';
import { getCuratedQuotes } from '@/lib/quotes/get-curated-quotes';
import { createServerSupabase } from '@/lib/supabase/client';
import { assetUrl } from '@/lib/media/asset-url';
import { AnnualReportContent } from './AnnualReportContent';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function AnnualReport2025Page() {
  // Fetch all data in parallel
  const [
    reportData,
    heroImage,
    heroVideo,
    galleryMedia,
    elderMedia,
    leadershipMedia,
    communityMedia,
    serviceMedia,
    recentMedia,
    elderQuotes,
    communityVoices,
  ] = await Promise.all([
    getReportData('2024-25'),
    getHeroImage('annual-report'),
    getHeroVideo('annual-report'),
    getMediaByTags(['is_featured' as any], 24, 'image'),
    getMediaByTags(['content:elders', 'content:portrait'], 8, 'image'),
    getMediaByTags(['person:rachel-atkinson', 'person:luella-bligh', 'role:ceo', 'role:chair', 'board'], 10, 'image'),
    getMediaByTags(['content:outdoor', 'content:documentary', 'subject:first-nations'], 20, 'image'),
    getMediaByTags(['content:indoor', 'content:ceremony'], 12, 'image'),
    getRecentMedia(30),
    getCuratedQuotes({ source_type: 'elder', limit: 6 }),
    getCuratedQuotes({ limit: 6 }),
  ]);

  // Build gallery from available sources
  const allPhotos = [
    ...galleryMedia,
    ...communityMedia,
    ...serviceMedia,
    ...recentMedia,
  ];
  // Deduplicate by URL
  const seenUrls = new Set<string>();
  const uniquePhotos = allPhotos.filter((p) => {
    if (!p.public_url || seenUrls.has(p.public_url)) return false;
    seenUrls.add(p.public_url);
    return true;
  });

  // Get CEO/Chair photos from leadership table (professional portraits)
  const supabase = createServerSupabase();
  const [{ data: ceoRow }, { data: chairRow }] = await Promise.all([
    supabase.from('leadership').select('photo_url').eq('leadership_type', 'executive').eq('is_active', true).order('position_order').limit(1).maybeSingle(),
    supabase.from('leadership').select('photo_url').eq('position', 'Chair of the Board').eq('is_active', true).limit(1).maybeSingle(),
  ]);
  const ceoPhoto = ceoRow?.photo_url ? { public_url: ceoRow.photo_url } : leadershipMedia.find(
    (m: any) => m.tags?.includes('role:ceo') || m.tags?.includes('person:rachel-atkinson')
  );
  const chairPhoto = chairRow?.photo_url ? { public_url: chairRow.photo_url } : leadershipMedia.find(
    (m: any) => m.tags?.includes('role:chair') || m.tags?.includes('person:luella-bligh')
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/50 text-sm tracking-widest uppercase">Loading</p>
          </div>
        </div>
      }
    >
      <AnnualReportContent
        reportData={reportData}
        knowledgeBase={PICC_KNOWLEDGE_BASE}
        elderQuotes={elderQuotes}
        communityVoices={communityVoices}
        media={{
          heroImage: heroImage || undefined,
          heroVideoUrl: heroVideo?.public_url || assetUrl('/video/hero-desktop-web.mp4'),
          ceoPhotoUrl: ceoPhoto?.public_url || undefined,
          chairPhotoUrl: chairPhoto?.public_url || undefined,
          elderPhotos: elderMedia.map((m: any) => ({
            url: m.public_url,
            caption: m.title || m.alt_text,
          })),
          galleryPhotos: uniquePhotos.slice(0, 24).map((m: any) => ({
            url: m.public_url,
            caption: m.title || m.alt_text || m.caption,
            category: m.tags?.[0],
          })),
        }}
      />
    </Suspense>
  );
}
