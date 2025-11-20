import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

export default function CreateStoryPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Story</h1>
        <p className="text-gray-600 mb-8">
          Use the Share Your Voice tool to create new stories. You can write text, record audio, or upload video.
        </p>

        <Link
          href="/share-voice"
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Open Share Your Voice</span>
          <ArrowRight className="w-5 h-5" />
        </Link>

        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Note</h2>
          <p className="text-blue-800 text-sm">
            Share Your Voice will open in a new tab. After creating your story,
            return here to manage it in the PICC dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
