import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

export default function CreateStoryPage() {
  return (
    <div className="p-8" style={{ backgroundColor: '#FBF8EE', minHeight: '100vh' }}>
      <div className="max-w-4xl">
        <p className="uppercase font-bold mb-2" style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}>
          PICC admin · create
        </p>
        <h1 className="font-fraunces font-bold leading-tight mb-4" style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}>
          Create new story.
        </h1>
        <p className="mb-8 text-sm" style={{ color: '#6B6560', maxWidth: '32rem' }}>
          Use the Share Your Voice tool to create new stories. Write text, record audio, or upload video.
        </p>

        <Link
          href="/share-voice"
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest rounded-md hover:opacity-90 transition"
          style={{ backgroundColor: '#0B4F6C', color: '#FBF8EE', letterSpacing: '0.15em' }}
        >
          <Plus className="w-4 h-4" />
          <span>Open Share Your Voice</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="mt-12 p-6 rounded-2xl" style={{ backgroundColor: '#F7F6F4', border: '1px solid #C8963E33' }}>
          <p className="uppercase font-bold mb-2" style={{ color: '#C8963E', fontSize: 11, letterSpacing: '0.3em' }}>Note</p>
          <p className="text-sm leading-relaxed" style={{ color: '#2D2319' }}>
            Share Your Voice will open in a new tab. After creating your story,
            return here to manage it in the PICC dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
