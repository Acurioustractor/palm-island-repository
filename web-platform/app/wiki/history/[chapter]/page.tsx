import { notFound } from 'next/navigation';
import { getChapterArtifacts } from '@/lib/history/get-artifacts';
import { getChapterBySlug, HISTORY_CHAPTERS } from '@/lib/history/chapters';
import { getChapterHeroImage, getChapterGalleryPhotos } from '@/lib/wiki/get-photos';
import ChapterPage from '@/components/wiki/ChapterPage';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ chapter: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapter: slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return { title: 'Not Found' };

  return {
    title: `${chapter.title} — Palm Island History Wiki`,
    description: chapter.summary,
  };
}

export function generateStaticParams() {
  return HISTORY_CHAPTERS.map((c) => ({ chapter: c.slug }));
}

export default async function ChapterRoute({ params }: PageProps) {
  const { chapter: slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();

  let artifacts = await getChapterArtifacts(slug, 100);

  // Find adjacent chapters for navigation
  const idx = HISTORY_CHAPTERS.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? HISTORY_CHAPTERS[idx - 1] : null;
  const next = idx < HISTORY_CHAPTERS.length - 1 ? HISTORY_CHAPTERS[idx + 1] : null;

  const heroImage = getChapterHeroImage(slug);
  const photos = getChapterGalleryPhotos(slug);

  return (
    <ChapterPage
      chapter={chapter}
      artifacts={artifacts}
      prevChapter={prev}
      nextChapter={next}
      heroImage={heroImage}
      photos={photos}
    />
  );
}
