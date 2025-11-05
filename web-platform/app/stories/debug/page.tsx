'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugStoriesPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function test() {
      const supabase = createClient();

      // Test 1: Most basic query possible
      console.log('🔍 Testing basic query...');
      const test1 = await supabase
        .from('stories')
        .select('id, title')
        .limit(5);

      console.log('Test 1 (basic):', test1);

      // Test 2: With is_public filter
      console.log('🔍 Testing with is_public filter...');
      const test2 = await supabase
        .from('stories')
        .select('id, title')
        .eq('is_public', true)
        .limit(5);

      console.log('Test 2 (is_public):', test2);

      // Test 3: With storyteller
      console.log('🔍 Testing with storyteller join...');
      const test3 = await supabase
        .from('stories')
        .select(`
          id,
          title,
          storyteller:storyteller_id (full_name)
        `)
        .eq('is_public', true)
        .limit(5);

      console.log('Test 3 (with storyteller):', test3);

      setResult({
        test1: { data: test1.data, error: test1.error?.message },
        test2: { data: test2.data, error: test2.error?.message },
        test3: { data: test3.data, error: test3.error?.message },
      });
      setLoading(false);
    }

    test();
  }, []);

  if (loading) return <div className="p-8">Testing database queries...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Database Debug Page</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Test 1: Basic Query (id, title only)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result.test1, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Test 2: With is_public filter</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result.test2, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Test 3: With storyteller join</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result.test3, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <p className="font-bold">Next Steps:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>If Test 1 shows error: Database connection issue</li>
            <li>If Test 2 shows error or 0 rows: is_public column issue or no published stories</li>
            <li>If Test 3 shows error: storyteller_id foreign key issue</li>
            <li>If all tests pass: Issue is with organization/service/project joins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
