import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import { Eye, ArrowRight, BookOpen } from 'lucide-react';

export default async function PublishedStoriesPage() {
  const supabase = createServerSupabase();

  const { count } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Published Stories</h1>
        <p className="text-gray-600">View all live stories on the public site</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{count || 0}</div>
            <div className="text-sm text-gray-600">Published Stories</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/stories"
          target="_blank"
          className="p-6 bg-white border-2 border-gray-200 hover:border-green-300 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">View on Public Site</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            See how stories appear to the public
          </p>
          <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
            <span>Open</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/picc/admin/storytellers"
          className="p-6 bg-white border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Manage All Stories</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Edit, unpublish, or archive stories
          </p>
          <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
            <span>Manage</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
