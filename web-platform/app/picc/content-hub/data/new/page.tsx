'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, Save, X, Database, Calendar, BarChart3 } from 'lucide-react';

export default function NewDataSnapshotPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    service_name: '',
    snapshot_date: new Date().toISOString().split('T')[0],
    snapshot_period: 'monthly',
    people_served: '',
    highlights: '',
    challenges: '',
    community_feedback: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();

      const { error } = await (supabase
        .from('data_snapshots') as any)
        .insert({
          service_name: formData.service_name,
          snapshot_date: formData.snapshot_date,
          snapshot_period: formData.snapshot_period,
          metrics: {
            people_served: formData.people_served ? parseInt(formData.people_served) : 0
          },
          highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
          challenges: formData.challenges ? formData.challenges.split('\n').filter(c => c.trim()) : [],
          community_feedback: formData.community_feedback || null,
          tenant_id: process.env.NEXT_PUBLIC_TENANT_ID,
          organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID
        });

      if (error) throw error;

      alert('Data snapshot saved!');
      router.push('/picc/content-hub');
    } catch (error: any) {
      console.error('Error saving snapshot:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/picc/content-hub"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Content Hub
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Add Data Snapshot</h1>
        </div>
        <p className="text-gray-600">
          Record service metrics and highlights for reporting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Snapshot Details</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Bwgcolman Healing Service"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Snapshot Period
              </label>
              <select
                value={formData.snapshot_period}
                onChange={(e) => setFormData({ ...formData, snapshot_period: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Snapshot Date
              </label>
              <input
                type="date"
                value={formData.snapshot_date}
                onChange={(e) => setFormData({ ...formData, snapshot_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BarChart3 className="w-4 h-4 inline mr-1" />
                People Served
              </label>
              <input
                type="number"
                value={formData.people_served}
                onChange={(e) => setFormData({ ...formData, people_served: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Highlights (one per line)
            </label>
            <textarea
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Key achievements this period..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Challenges (one per line)
            </label>
            <textarea
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Challenges faced..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Community Feedback
            </label>
            <textarea
              value={formData.community_feedback}
              onChange={(e) => setFormData({ ...formData, community_feedback: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="What the community is saying..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Link
            href="/picc/content-hub"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Snapshot</>}
          </button>
        </div>
      </form>
    </div>
  );
}
