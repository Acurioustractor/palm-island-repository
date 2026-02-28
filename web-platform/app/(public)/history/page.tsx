import { getArtifactsByChapter } from '@/lib/history/get-artifacts';
import HistoryContent from './HistoryContent';

export const dynamic = 'force-dynamic';

export default async function PalmIslandHistoryPage() {
  let artifacts = {};
  try {
    artifacts = await getArtifactsByChapter();
  } catch {
    // Gracefully degrade — page works without artifacts
  }

  return <HistoryContent artifacts={artifacts} />;
}
