'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, ChevronUp, ChevronDown, Plus, Trash2, Save, RotateCcw, Loader2, ShieldAlert } from 'lucide-react';

interface PageAssignment {
  id: string | null;
  report_id: string;
  edition: string;
  page_number: number;
  page_type: string;
  content_config: Record<string, any>;
}

interface PagePlannerPanelProps {
  reportId: string | null;
  stories: any[];
  elderProfiles?: any[];
}

const PAGE_TYPES = [
  { value: 'cover', label: 'Cover' },
  { value: 'acknowledgement', label: 'Acknowledgement of Country' },
  { value: 'messages', label: 'CEO & Chair Messages' },
  { value: 'year_in_numbers', label: 'Year in Numbers' },
  { value: 'highlights', label: 'Key Highlights' },
  { value: 'story_spread', label: 'Story Spread' },
  { value: 'governance', label: 'Governance & Board' },
  { value: 'services', label: 'Services Overview' },
  { value: 'service_spotlight', label: 'Service Spotlight' },
  { value: 'staff_report', label: 'Staff Report Card' },
  { value: 'innovation', label: 'Innovation on Country' },
  { value: 'photo_gallery', label: 'Photo Gallery' },
  { value: 'financials', label: 'Financial Report' },
  { value: 'expenditure', label: 'Expenditure Breakdown' },
  { value: 'partners', label: 'Partners' },
  { value: 'elder_group', label: 'Elder Advisory Group' },
  { value: 'elder_portrait', label: 'Elder Portrait' },
  { value: 'elder_quotes', label: 'Elder Quotes Collection' },
  { value: 'trip_overview', label: 'Trip Overview' },
  { value: 'trip_timeline', label: 'Trip Timeline' },
  { value: 'back_cover', label: 'Back Cover' },
];

const PAGE_TYPE_COLORS: Record<string, string> = {
  cover: 'bg-blue-50 border-blue-200 text-blue-700',
  acknowledgement: 'bg-purple-50 border-purple-200 text-purple-700',
  messages: 'bg-blue-50 border-blue-200 text-blue-700',
  story_spread: 'bg-amber-50 border-amber-200 text-amber-700',
  governance: 'bg-slate-50 border-slate-200 text-slate-700',
  services: 'bg-green-50 border-green-200 text-green-700',
  service_spotlight: 'bg-green-50 border-green-200 text-green-700',
  financials: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  expenditure: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  photo_gallery: 'bg-pink-50 border-pink-200 text-pink-700',
  elder_group: 'bg-purple-50 border-purple-200 text-purple-700',
  elder_portrait: 'bg-purple-50 border-purple-200 text-purple-700',
  elder_quotes: 'bg-purple-50 border-purple-200 text-purple-700',
  trip_timeline: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  back_cover: 'bg-gray-50 border-gray-200 text-gray-700',
};

export default function PagePlannerPanel({ reportId, stories, elderProfiles }: PagePlannerPanelProps) {
  const [pages, setPages] = useState<PageAssignment[]>([]);
  const [edition, setEdition] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchPagePlan = useCallback(async () => {
    if (!reportId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/annual-report-data/page-plan?report_id=${reportId}&edition=${edition}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPages(data.pages || []);
      setIsTemplate(data.is_template || false);
      setHasChanges(false);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [reportId, edition]);

  useEffect(() => {
    fetchPagePlan();
  }, [fetchPagePlan]);

  const handleSave = async () => {
    if (!reportId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/annual-report-data/page-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, edition, pages }),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setPages(data.pages || pages);
      setIsTemplate(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPages.length) return;
    [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
    // Renumber
    newPages.forEach((p, i) => { p.page_number = i + 1; });
    setPages(newPages);
    setHasChanges(true);
  };

  const addPage = (afterIndex: number) => {
    const newPage: PageAssignment = {
      id: null,
      report_id: reportId || '',
      edition,
      page_number: afterIndex + 2,
      page_type: 'story_spread',
      content_config: {},
    };
    const newPages = [...pages];
    newPages.splice(afterIndex + 1, 0, newPage);
    newPages.forEach((p, i) => { p.page_number = i + 1; });
    setPages(newPages);
    setHasChanges(true);
  };

  const removePage = (index: number) => {
    const newPages = pages.filter((_, i) => i !== index);
    newPages.forEach((p, i) => { p.page_number = i + 1; });
    setPages(newPages);
    setHasChanges(true);
  };

  const updatePageType = (index: number, pageType: string) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], page_type: pageType, content_config: {} };
    setPages(newPages);
    setHasChanges(true);
  };

  const updateContentConfig = (index: number, key: string, value: any) => {
    const newPages = [...pages];
    newPages[index] = {
      ...newPages[index],
      content_config: { ...newPages[index].content_config, [key]: value },
    };
    setPages(newPages);
    setHasChanges(true);
  };

  if (!reportId) {
    return (
      <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg p-4 text-sm text-picc-ochre">
        No annual report found for this fiscal year. Create one first.
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Page Plan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Plan the page-by-page layout for the PDF report.
            {isTemplate && ' Using default template — save to customise.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={edition}
            onChange={e => setEdition(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
          >
            <option value="standard">Standard Edition</option>
            <option value="elder">Elder Edition</option>
            <option value="community">Community Edition</option>
          </select>
          <button
            onClick={fetchPagePlan}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reset to saved"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-picc-ochre rounded-lg hover:bg-picc-ochre/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Plan
          </button>
        </div>
      </div>

      {/* Page count summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{pages.length} pages</div>
            <div className="text-xs text-gray-500">{edition} edition</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(
            pages.reduce((acc, p) => {
              acc[p.page_type] = (acc[p.page_type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([type, count]) => (
            <span
              key={type}
              className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${PAGE_TYPE_COLORS[type] || 'bg-gray-50 border-gray-200 text-gray-600'}`}
            >
              {PAGE_TYPES.find(t => t.value === type)?.label || type} {count > 1 ? `×${count}` : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Cultural protocol warning */}
      {!loading && (() => {
        const elderPageTypes = ['elder_group', 'elder_portrait', 'elder_quotes', 'trip_overview', 'trip_timeline'];
        const elderPages = pages.filter(p => elderPageTypes.includes(p.page_type));
        if (elderPages.length === 0) return null;

        const unapprovedElders = elderProfiles?.filter(e => !e.elder_approval_given) || [];
        const hasUnapproved = unapprovedElders.length > 0;
        const assignedElderIds = elderPages
          .filter(p => p.content_config.elder_id)
          .map(p => p.content_config.elder_id);
        const assignedUnapproved = unapprovedElders.filter(e => assignedElderIds.includes(e.id));

        return (
          <div className={`rounded-xl border p-4 flex items-start gap-3 ${
            hasUnapproved
              ? 'bg-amber-50 border-amber-200'
              : 'bg-green-50 border-green-200'
          }`}>
            <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              hasUnapproved ? 'text-amber-600' : 'text-green-600'
            }`} />
            <div className="text-sm">
              <p className={`font-medium ${hasUnapproved ? 'text-amber-800' : 'text-green-800'}`}>
                Cultural Protocol Check
              </p>
              <p className={`mt-0.5 ${hasUnapproved ? 'text-amber-700' : 'text-green-700'}`}>
                {hasUnapproved ? (
                  <>
                    {unapprovedElders.length} elder{unapprovedElders.length > 1 ? 's' : ''} missing approval.
                    {assignedUnapproved.length > 0 && (
                      <> <strong>{assignedUnapproved.map(e => e.full_name || 'Unknown').join(', ')}</strong> assigned to pages but not yet approved.</>
                    )}
                    {' '}Unapproved elder content will be excluded from the generated PDF.
                  </>
                ) : (
                  <>This plan includes {elderPages.length} elder content page{elderPages.length > 1 ? 's' : ''}. All elder profiles have approval.</>
                )}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-picc-ochre" />
        </div>
      )}

      {/* Page cards */}
      {!loading && (
        <div className="space-y-2">
          {pages.map((page, index) => (
            <div
              key={`${page.page_number}-${index}`}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors"
            >
              {/* Page number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">{page.page_number}</span>
              </div>

              {/* A4 thumbnail placeholder */}
              <div className={`flex-shrink-0 w-12 h-16 rounded border-2 flex items-center justify-center text-[8px] font-medium ${PAGE_TYPE_COLORS[page.page_type] || 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                {(PAGE_TYPES.find(t => t.value === page.page_type)?.label || page.page_type).split(' ').slice(0, 2).join('\n')}
              </div>

              {/* Page type selector */}
              <div className="flex-1 min-w-0">
                <select
                  value={page.page_type}
                  onChange={e => updatePageType(index, e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
                >
                  {PAGE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {/* Content config for story_spread */}
                {page.page_type === 'story_spread' && stories.length > 0 && (
                  <select
                    value={page.content_config.story_id || page.content_config.story_index || ''}
                    onChange={e => updateContentConfig(index, 'story_id', e.target.value)}
                    className="mt-1 w-full px-3 py-1 text-xs border border-gray-100 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
                  >
                    <option value="">Auto-select story</option>
                    {stories.map((s: any, i: number) => (
                      <option key={s.story_id || i} value={s.story_id}>
                        {s.title || `Story ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}

                {/* Content config for elder_portrait */}
                {page.page_type === 'elder_portrait' && elderProfiles && elderProfiles.length > 0 && (
                  <select
                    value={page.content_config.elder_id || page.content_config.elder_index || ''}
                    onChange={e => updateContentConfig(index, 'elder_id', e.target.value)}
                    className="mt-1 w-full px-3 py-1 text-xs border border-gray-100 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
                  >
                    <option value="">Auto-select elder</option>
                    {elderProfiles.map((e: any, i: number) => (
                      <option key={e.id || i} value={e.id}>
                        {e.full_name || `Elder ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Reorder + actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => movePage(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => movePage(index, 'down')}
                  disabled={index === pages.length - 1}
                  className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => addPage(index)}
                  className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"
                  title="Add page after"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removePage(index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add page at end */}
          <button
            onClick={() => addPage(pages.length - 1)}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-400 hover:text-picc-ochre hover:border-picc-ochre-200 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        </div>
      )}
    </div>
  );
}
