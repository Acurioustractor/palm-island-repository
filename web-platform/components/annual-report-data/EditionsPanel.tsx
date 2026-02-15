'use client';

import { useState, useEffect } from 'react';
import { BookCopy, Plus, FileText, CheckCircle2, Clock, Eye, Loader2, Trash2 } from 'lucide-react';
import { BespokeIcon, type BespokeIconName } from '@/components/ui/BespokeIcon';

interface Edition {
  id: string | null;
  report_id: string;
  edition_key: string;
  title: string;
  description: string;
  page_count: number;
  status: 'draft' | 'review' | 'approved' | 'published';
  created_at?: string;
}

interface EditionsPanelProps {
  reportId: string | null;
  onNavigateToPagePlan?: (edition: string) => void;
}

const EDITION_PRESETS: { key: string; title: string; description: string; icon: BespokeIconName; defaultPages: number }[] = [
  {
    key: 'standard',
    title: 'Standard Edition',
    description: 'Full annual report with all sections — services, financials, stories, governance.',
    icon: 'story',
    defaultPages: 17,
  },
  {
    key: 'elder',
    title: 'Elder Edition',
    description: 'Special edition featuring Hull River trip, elder portraits, quotes, and cultural content.',
    icon: 'aged-care',
    defaultPages: 12,
  },
  {
    key: 'community',
    title: 'Community Edition',
    description: 'Condensed version for community distribution — highlights, stories, and photos.',
    icon: 'community',
    defaultPages: 8,
  },
  {
    key: 'service',
    title: 'Service Edition',
    description: 'Focused on service delivery metrics, staff data, and service stories.',
    icon: 'governance',
    defaultPages: 10,
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: <Clock className="w-3.5 h-3.5" /> },
  review: { label: 'In Review', color: 'bg-amber-100 text-amber-700', icon: <Eye className="w-3.5 h-3.5" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  published: { label: 'Published', color: 'bg-blue-100 text-blue-700', icon: <FileText className="w-3.5 h-3.5" /> },
};

export default function EditionsPanel({ reportId, onNavigateToPagePlan }: EditionsPanelProps) {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    fetchEditions();
  }, [reportId]);

  const fetchEditions = async () => {
    if (!reportId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/annual-report-data/page-plan?report_id=${reportId}&edition=_list`);
      // The page-plan API doesn't have a list endpoint yet, so we query editions directly
      // For now, check which editions exist by trying known keys
      const editionsList: Edition[] = [];
      for (const preset of EDITION_PRESETS) {
        try {
          const r = await fetch(`/api/annual-report-data/page-plan?report_id=${reportId}&edition=${preset.key}`);
          if (r.ok) {
            const data = await r.json();
            editionsList.push({
              id: null,
              report_id: reportId,
              edition_key: preset.key,
              title: preset.title,
              description: preset.description,
              page_count: data.pages?.length || 0,
              status: data.is_template ? 'draft' : 'review',
            });
          }
        } catch {
          // Edition doesn't exist yet
        }
      }
      setEditions(editionsList);
    } catch {
      setEditions([]);
    } finally {
      setLoading(false);
    }
  };

  const createEdition = async (presetKey: string) => {
    if (!reportId) return;
    setCreating(presetKey);
    try {
      // Fetch the template (page-plan API returns template if none saved)
      const res = await fetch(`/api/annual-report-data/page-plan?report_id=${reportId}&edition=${presetKey}`);
      if (!res.ok) throw new Error('Failed to fetch template');
      const data = await res.json();

      // Save the template as the edition's page plan
      await fetch('/api/annual-report-data/page-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          edition: presetKey,
          pages: data.pages || [],
        }),
      });

      await fetchEditions();
    } catch (error) {
      console.error('Create edition error:', error);
    } finally {
      setCreating(null);
    }
  };

  const updateStatus = async (editionKey: string, newStatus: string) => {
    setEditions(prev =>
      prev.map(e => e.edition_key === editionKey ? { ...e, status: newStatus as Edition['status'] } : e)
    );
  };

  if (!reportId) {
    return (
      <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg p-4 text-sm text-picc-ochre">
        No annual report found for this fiscal year. Create one first.
      </div>
    );
  }

  const existingKeys = new Set(editions.filter(e => e.page_count > 0 && e.status !== 'draft').map(e => e.edition_key));

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookCopy className="w-5 h-5 text-picc-ochre" />
          Report Editions
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Create different versions of the report from the same content pool.
        </p>
      </div>

      {/* Active editions */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-picc-ochre" />
        </div>
      ) : (
        <>
          {editions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">Active Editions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editions.map(edition => {
                  const preset = EDITION_PRESETS.find(p => p.key === edition.edition_key);
                  const statusConfig = STATUS_CONFIG[edition.status] || STATUS_CONFIG.draft;
                  return (
                    <div
                      key={edition.edition_key}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <BespokeIcon name={preset?.icon || 'story'} size={28} />
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{edition.title}</h4>
                            <p className="text-xs text-gray-500">{edition.page_count} pages</p>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mb-4">{edition.description}</p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onNavigateToPagePlan?.(edition.edition_key)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-picc-ochre border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors text-center"
                        >
                          Edit Page Plan
                        </button>
                        <select
                          value={edition.status}
                          onChange={e => updateStatus(edition.edition_key, e.target.value)}
                          className="px-2 py-2 text-xs border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="review">In Review</option>
                          <option value="approved">Approved</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create from presets */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500">
              {editions.length > 0 ? 'Add Another Edition' : 'Create an Edition'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EDITION_PRESETS.filter(p => !existingKeys.has(p.key)).map(preset => (
                <div
                  key={preset.key}
                  className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-5 hover:border-picc-ochre-300 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl opacity-60">{preset.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">{preset.title}</h4>
                      <p className="text-xs text-gray-400">~{preset.defaultPages} pages</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{preset.description}</p>
                  <button
                    onClick={() => createEdition(preset.key)}
                    disabled={creating === preset.key}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-picc-ochre border border-warm-200 rounded-lg hover:bg-warm-50 disabled:opacity-50 transition-colors"
                  >
                    {creating === preset.key ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Edition
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
