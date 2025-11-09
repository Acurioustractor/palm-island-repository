import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/client';
import { Users, ArrowRight } from 'lucide-react';

export default async function PICCStorytellersPage() {
  const supabase = createServerSupabase();

  const { data: storytellers, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false});

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Storytellers</h1>
        <p className="text-gray-600">Manage community members and their profiles</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-teal-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{count || 0}</div>
              <div className="text-sm text-gray-600">Total Storytellers</div>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/storytellers"
        target="_blank"
        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all"
      >
        <span>View Full Storytellers Page</span>
        <ArrowRight className="w-5 h-5" />
      </Link>

      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          The full storytellers page will open in a new tab. Advanced management features
          coming in Phase 2.
        </p>
      </div>
    </div>
  );
}
