'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import {
  ArrowLeft, CheckCircle, FileText, Loader2, Sparkles, Wand2,
  Plus, GripVertical, Trash2, Image, Film, BarChart3, Quote,
  Users, Layout, ChevronDown, ChevronUp, Camera,
  User, Award, Calendar, X, Eye
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Available section/block types
const SECTION_TYPES = [
  { id: 'text', label: 'Text Section', icon: FileText, description: 'Rich text content block' },
  { id: 'hero_image', label: 'Hero Image', icon: Image, description: 'Full-width featured image' },
  { id: 'photo_gallery', label: 'Photo Gallery', icon: Camera, description: 'Grid of community images' },
  { id: 'video', label: 'Video Embed', icon: Film, description: 'YouTube or external video' },
  { id: 'stats_bar', label: 'Stats Bar', icon: BarChart3, description: 'Key metrics display' },
  { id: 'quote', label: 'Featured Quote', icon: Quote, description: 'Quote with attribution' },
  { id: 'leadership_message', label: 'Leadership Message', icon: User, description: 'CEO/Chair message' },
  { id: 'community_voices', label: 'Community Voices', icon: Users, description: 'People quotes grid' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, description: 'Milestones list' },
  { id: 'project_showcase', label: 'Projects', icon: Award, description: 'Innovation projects' },
  { id: 'divider', label: 'Divider', icon: Layout, description: 'Section separator' },
];

type EditableSection = {
  id?: string;
  section_type: string;
  section_title?: string | null;
  section_content?: string | null;
  display_order: number;
  expanded?: boolean;
};

// Add Block Button with dropdown
function AddBlockButton({ onAdd }: { onAdd: (type: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-picc-ochre-700 hover:text-picc-ochre-900 hover:bg-picc-ochre-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Block
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-20 py-2 max-h-80 overflow-y-auto">
            {SECTION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    onAdd(type.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-3 py-2 hover:bg-picc-ochre-50 text-left"
                >
                  <Icon className="w-4 h-4 text-picc-ochre-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Block Editor - renders different fields based on block type
function BlockEditor({
  section,
  sectionType,
  onChange,
}: {
  section: EditableSection;
  sectionType: typeof SECTION_TYPES[number];
  onChange: (updated: Partial<EditableSection>) => void;
}) {
  // Parse config from section_content if it's JSON
  const getConfig = () => {
    try {
      return JSON.parse(section.section_content || '{}');
    } catch {
      return {};
    }
  };

  const updateConfig = (key: string, value: any) => {
    const config = getConfig();
    config[key] = value;
    onChange({ section_content: JSON.stringify(config) });
  };

  const config = getConfig();

  // Different editors based on section type
  switch (section.section_type) {
    case 'hero_image':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title Overlay</label>
            <input
              value={section.section_title || ''}
              onChange={(e) => onChange({ section_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Optional title on image"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
            <input
              value={config.image_url || ''}
              onChange={(e) => updateConfig('image_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://... or select from media library"
            />
          </div>
          <p className="text-xs text-gray-500">
            Tip: Use the <Link href={`/picc/annual-reports/${section.id}/images`} className="text-picc-ochre underline">Images Manager</Link> to select report images
          </p>
        </div>
      );

    case 'video':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Video Title</label>
            <input
              value={section.section_title || ''}
              onChange={(e) => onChange({ section_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Video title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Video URL (YouTube, Vimeo)</label>
            <input
              value={config.video_url || ''}
              onChange={(e) => updateConfig('video_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={2}
              placeholder="Video description..."
            />
          </div>
        </div>
      );

    case 'stats_bar':
      const stats = config.stats || [{ label: '', value: '' }];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
            <input
              value={section.section_title || ''}
              onChange={(e) => onChange({ section_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Impact at a Glance"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Statistics</label>
            <div className="space-y-2">
              {stats.map((stat: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={stat.value || ''}
                    onChange={(e) => {
                      const newStats = [...stats];
                      newStats[i] = { ...newStats[i], value: e.target.value };
                      updateConfig('stats', newStats);
                    }}
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="197"
                  />
                  <input
                    value={stat.label || ''}
                    onChange={(e) => {
                      const newStats = [...stats];
                      newStats[i] = { ...newStats[i], label: e.target.value };
                      updateConfig('stats', newStats);
                    }}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Staff Members"
                  />
                  <input
                    value={stat.suffix || ''}
                    onChange={(e) => {
                      const newStats = [...stats];
                      newStats[i] = { ...newStats[i], suffix: e.target.value };
                      updateConfig('stats', newStats);
                    }}
                    className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="% or M"
                  />
                  <button
                    type="button"
                    onClick={() => updateConfig('stats', stats.filter((_: any, j: number) => j !== i))}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateConfig('stats', [...stats, { label: '', value: '' }])}
                className="text-xs text-picc-ochre hover:text-picc-earth"
              >
                + Add stat
              </button>
            </div>
          </div>
        </div>
      );

    case 'quote':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Quote Text</label>
            <textarea
              value={section.section_content || ''}
              onChange={(e) => onChange({ section_content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={3}
              placeholder="The quote text..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Attribution</label>
              <input
                value={section.section_title || ''}
                onChange={(e) => onChange({ section_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Person's name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <input
                value={config.role || ''}
                onChange={(e) => updateConfig('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Community Elder"
              />
            </div>
          </div>
        </div>
      );

    case 'leadership_message':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
              <input
                value={section.section_title || ''}
                onChange={(e) => onChange({ section_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Rachel Atkinson"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                value={config.role || 'ceo'}
                onChange={(e) => updateConfig('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="ceo">Chief Executive Officer</option>
                <option value="chair">Board Chairperson</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={section.section_content || ''}
              onChange={(e) => onChange({ section_content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={6}
              placeholder="Leadership message content..."
            />
          </div>
        </div>
      );

    case 'photo_gallery':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Gallery Title</label>
            <input
              value={section.section_title || ''}
              onChange={(e) => onChange({ section_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Year in Pictures"
            />
          </div>
          <div className="bg-picc-ochre-50 rounded-lg p-3">
            <p className="text-sm text-picc-ochre-800 mb-2">
              Gallery images are managed through the Images Manager
            </p>
            <p className="text-xs text-picc-ochre-600">
              Tag images with <code className="bg-picc-ochre-100 px-1 rounded">report-section:gallery</code> to include them
            </p>
          </div>
        </div>
      );

    case 'timeline':
      const milestones = config.milestones || [{ date: '', title: '', description: '' }];
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Timeline Title</label>
            <input
              value={section.section_title || ''}
              onChange={(e) => onChange({ section_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Key Milestones"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Milestones</label>
            <div className="space-y-2">
              {milestones.map((m: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <input
                    value={m.date || ''}
                    onChange={(e) => {
                      const newMilestones = [...milestones];
                      newMilestones[i] = { ...newMilestones[i], date: e.target.value };
                      updateConfig('milestones', newMilestones);
                    }}
                    className="w-24 px-2 py-1.5 border border-gray-300 rounded text-xs"
                    placeholder="Jul 2024"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      value={m.title || ''}
                      onChange={(e) => {
                        const newMilestones = [...milestones];
                        newMilestones[i] = { ...newMilestones[i], title: e.target.value };
                        updateConfig('milestones', newMilestones);
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                      placeholder="Milestone title"
                    />
                    <input
                      value={m.description || ''}
                      onChange={(e) => {
                        const newMilestones = [...milestones];
                        newMilestones[i] = { ...newMilestones[i], description: e.target.value };
                        updateConfig('milestones', newMilestones);
                      }}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                      placeholder="Brief description"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig('milestones', milestones.filter((_: any, j: number) => j !== i))}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => updateConfig('milestones', [...milestones, { date: '', title: '', description: '' }])}
                className="text-xs text-picc-ochre-600 hover:text-picc-ochre-800"
              >
                + Add milestone
              </button>
            </div>
          </div>
        </div>
      );

    case 'divider':
      return (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Divider Style</label>
          <select
            value={config.style || 'line'}
            onChange={(e) => updateConfig('style', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="line">Simple Line</option>
            <option value="dots">Dots</option>
            <option value="wave">Wave</option>
            <option value="space">Space Only</option>
          </select>
        </div>
      );

    // Default text section
    default:
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Section Title</label>
            <input
              value={section.section_title || ''}
              onChange={(e) => onChange({ section_title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Section title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={section.section_content || ''}
              onChange={(e) => onChange({ section_content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              rows={5}
              placeholder="Section content..."
            />
          </div>
        </div>
      );
  }
}

function ReportGeneratorPageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [config, setConfig] = useState({
    fiscalYearStart: (() => {
      const now = new Date();
      return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    })(),
    theme: 'Building Stronger Foundations',
    storyLimit: 18,
    includeQuotes: true,
    includeMedia: true,
    publishStatus: false,
  });

  const [edit, setEdit] = useState<{
    loading: boolean;
    reportId: string | null;
    reportYear: number | null;
    title: string;
    subtitle: string;
    theme: string;
    status: string;
    executive_summary: string;
    sections: EditableSection[];
  }>({
    loading: false,
    reportId: null,
    reportYear: null,
    title: '',
    subtitle: '',
    theme: '',
    status: 'drafting',
    executive_summary: '',
    sections: [],
  });

  const [status, setStatus] = useState<
    | { state: 'idle' }
    | { state: 'working'; message: string }
    | { state: 'done'; reportId: string; reportYear: number }
    | { state: 'error'; message: string }
  >({ state: 'idle' });

  useEffect(() => {
    if (!editId) return;

    let cancelled = false;
    (async () => {
      try {
        setEdit((p) => ({ ...p, loading: true }));
        const res = await fetch(`/api/annual-reports/${editId}`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Failed to load report');
        if (cancelled) return;

        const report = json.report || {};
        const sections = (json.sections || []) as EditableSection[];

        setEdit({
          loading: false,
          reportId: report.id || editId,
          reportYear: report.report_year || null,
          title: report.title || '',
          subtitle: report.subtitle || '',
          theme: report.theme || '',
          status: report.status || 'drafting',
          executive_summary: report.executive_summary || '',
          sections: sections
            .map((s, index) => ({
              id: s.id,
              section_type: s.section_type,
              section_title: s.section_title ?? '',
              section_content: s.section_content ?? '',
              display_order: Number.isFinite((s as any).display_order) ? (s as any).display_order : index,
            }))
            .sort((a, b) => a.display_order - b.display_order),
        });
      } catch (e: any) {
        if (!cancelled) setStatus({ state: 'error', message: e?.message || 'Failed to load report' });
      } finally {
        if (!cancelled) setEdit((p) => ({ ...p, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const fiscalYearLabel = useMemo(() => {
    const end = config.fiscalYearStart + 1;
    return `${config.fiscalYearStart}-${end.toString().slice(-2)}`;
  }, [config.fiscalYearStart]);

  const reportYear = useMemo(() => config.fiscalYearStart + 1, [config.fiscalYearStart]);

  const title = useMemo(
    () => `Palm Island Community Company Annual Report ${fiscalYearLabel}`,
    [fiscalYearLabel]
  );

  const reportingPeriodStart = useMemo(
    () => `${config.fiscalYearStart}-07-01`,
    [config.fiscalYearStart]
  );

  const reportingPeriodEnd = useMemo(
    () => `${config.fiscalYearStart + 1}-06-30`,
    [config.fiscalYearStart]
  );

  const generateAnnualReport = async () => {
    try {
      setStatus({ state: 'working', message: 'Creating report record…' });

      const createRes = await fetch('/api/annual-reports', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          report_year: reportYear,
          reporting_period_start: reportingPeriodStart,
          reporting_period_end: reportingPeriodEnd,
          title,
          subtitle: 'Our Community, Our Future, Our Way',
          theme: config.theme,
          status: config.publishStatus ? 'published' : 'drafting',
          template_name: 'traditional',
        }),
      });

      const createJson = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createJson?.error || 'Failed to create report');
      }

      const createdReportId = createJson?.report?.id as string | undefined;
      const createdReportYear = createJson?.report?.report_year as number | undefined;

      if (!createdReportId || !createdReportYear) {
        throw new Error('Report created but missing id/year in response');
      }

      setStatus({ state: 'working', message: 'Auto-selecting best stories, photos, and quotes…' });

      const populateRes = await fetch(`/api/annual-reports/${createdReportId}/populate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storyLimit: config.storyLimit,
          includeQuotes: config.includeQuotes,
          includeMedia: config.includeMedia,
          publish: config.publishStatus,
        }),
      });

      const populateJson = await populateRes.json();
      if (!populateRes.ok) {
        throw new Error(populateJson?.error || 'Failed to populate report');
      }

      setStatus({ state: 'done', reportId: createdReportId, reportYear: createdReportYear });
    } catch (e: any) {
      setStatus({ state: 'error', message: e?.message || 'Something went wrong' });
    }
  };

  const saveEdits = async () => {
    if (!edit.reportId) return;
    try {
      setStatus({ state: 'working', message: 'Saving report text and sections…' });

      const updateRes = await fetch(`/api/annual-reports/${edit.reportId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: edit.title,
          subtitle: edit.subtitle,
          theme: edit.theme,
          status: edit.status,
          executive_summary: edit.executive_summary,
        }),
      });
      const updateJson = await updateRes.json().catch(() => ({}));
      if (!updateRes.ok) throw new Error(updateJson?.error || 'Failed to update report');

      const sectionsRes = await fetch(`/api/annual-reports/${edit.reportId}/sections`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sections: edit.sections
            .slice()
            .sort((a, b) => a.display_order - b.display_order)
            .map((s, index) => ({
              id: s.id,
              section_type: s.section_type,
              section_title: s.section_title ?? null,
              section_content: s.section_content ?? null,
              display_order: index,
            })),
        }),
      });
      const sectionsJson = await sectionsRes.json().catch(() => ({}));
      if (!sectionsRes.ok) throw new Error(sectionsJson?.error || 'Failed to update sections');

      setEdit((p) => ({
        ...p,
        sections: (sectionsJson.sections || []).map((s: any, idx: number) => ({
          id: s.id,
          section_type: s.section_type,
          section_title: s.section_title ?? '',
          section_content: s.section_content ?? '',
          display_order: Number.isFinite(s.display_order) ? s.display_order : idx,
        })),
      }));

      setStatus({ state: 'done', reportId: edit.reportId, reportYear: edit.reportYear || reportYear });
    } catch (e: any) {
      setStatus({ state: 'error', message: e?.message || 'Failed to save edits' });
    }
  };

  const rerunPopulate = async () => {
    if (!edit.reportId) return;
    try {
      setStatus({ state: 'working', message: 'Re-running auto-select (stories/photos/quotes)…' });
      const res = await fetch(`/api/annual-reports/${edit.reportId}/populate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storyLimit: config.storyLimit,
          includeQuotes: config.includeQuotes,
          includeMedia: config.includeMedia,
          publish: config.publishStatus,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Failed to populate report');
      setStatus({ state: 'done', reportId: edit.reportId, reportYear: edit.reportYear || reportYear });
    } catch (e: any) {
      setStatus({ state: 'error', message: e?.message || 'Failed to re-run auto-select' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/picc/annual-reports"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Annual Reports
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-picc-ochre-100 rounded-xl">
              <FileText className="h-7 w-7 text-picc-ochre-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Annual Report Generator</h1>
          </div>
          <p className="text-gray-600">
            One-click generation using the best stories, photos, quotes, and innovation projects already on the site.
          </p>
        </div>

        {editId && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Existing Report</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update text/sections here. To change report photos, use the Media Library and tag images with <span className="font-mono">annual-report</span>.
                </p>
                {edit.reportYear && (
                  <p className="text-xs text-gray-500 mt-1">
                    Public preview: <Link className="underline" href={`/annual-report/${edit.reportYear}`}>/annual-report/{edit.reportYear}</Link>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  value={edit.title}
                  onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  value={edit.subtitle}
                  onChange={(e) => setEdit((p) => ({ ...p, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <input
                  value={edit.theme}
                  onChange={(e) => setEdit((p) => ({ ...p, theme: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Executive Summary</label>
                <textarea
                  value={edit.executive_summary}
                  onChange={(e) => setEdit((p) => ({ ...p, executive_summary: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={6}
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Content Blocks</h3>
                  <AddBlockButton
                    onAdd={(type) =>
                      setEdit((p) => ({
                        ...p,
                        sections: [
                          ...p.sections,
                          {
                            section_type: type,
                            section_title: SECTION_TYPES.find(t => t.id === type)?.label || 'New Section',
                            section_content: type === 'stats_bar' ? JSON.stringify({ stats: [
                              { label: 'Stat 1', value: 100 },
                              { label: 'Stat 2', value: 200 },
                            ]}) : '',
                            display_order: p.sections.length,
                            expanded: true,
                          },
                        ],
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  {edit.sections.map((section, idx) => {
                    const sectionType = SECTION_TYPES.find(t => t.id === section.section_type) ||
                      SECTION_TYPES.find(t => t.id === 'text')!;
                    const Icon = sectionType?.icon || FileText;
                    const isExpanded = section.expanded !== false;

                    return (
                      <div
                        key={section.id || `new-${idx}`}
                        className={`rounded-lg border ${isExpanded ? 'border-picc-ochre-200 bg-picc-ochre-50/30' : 'border-gray-200'} overflow-hidden`}
                      >
                        {/* Block Header */}
                        <div
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${isExpanded ? 'bg-picc-ochre-100/50' : 'bg-gray-50 hover:bg-gray-100'}`}
                          onClick={() =>
                            setEdit((p) => ({
                              ...p,
                              sections: p.sections.map((s, i) =>
                                i === idx ? { ...s, expanded: !s.expanded } : s
                              ),
                            }))
                          }
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          <Icon className="w-4 h-4 text-picc-ochre-600" />
                          <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                            {section.section_title || sectionType.label}
                          </span>
                          <span className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded">
                            {sectionType.label}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (idx > 0) {
                                  setEdit((p) => {
                                    const newSections = [...p.sections];
                                    [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
                                    return { ...p, sections: newSections.map((s, i) => ({ ...s, display_order: i })) };
                                  });
                                }
                              }}
                              disabled={idx === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (idx < edit.sections.length - 1) {
                                  setEdit((p) => {
                                    const newSections = [...p.sections];
                                    [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
                                    return { ...p, sections: newSections.map((s, i) => ({ ...s, display_order: i })) };
                                  });
                                }
                              }}
                              disabled={idx === edit.sections.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEdit((p) => ({
                                  ...p,
                                  sections: p.sections.filter((_, i) => i !== idx).map((s, i) => ({ ...s, display_order: i })),
                                }));
                              }}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Block Content (expanded) */}
                        {isExpanded && (
                          <div className="p-3 border-t border-gray-200 bg-white">
                            <BlockEditor
                              section={section}
                              sectionType={sectionType}
                              onChange={(updated) =>
                                setEdit((p) => ({
                                  ...p,
                                  sections: p.sections.map((s, i) => (i === idx ? { ...s, ...updated } : s)),
                                }))
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {edit.sections.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Layout className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No content blocks yet</p>
                      <p className="text-xs text-gray-400">Click "Add Block" to start building your report</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={saveEdits}
                disabled={status.state === 'working' || edit.loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status.state === 'working' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                Save Changes
              </button>
              <button
                onClick={rerunPopulate}
                disabled={status.state === 'working' || edit.loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-picc-ochre-600 to-picc-ochre-700 hover:from-picc-ochre-700 hover:to-picc-ochre-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status.state === 'working' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                Re-run Auto-Select
              </button>
              {edit.reportId && (
                <Link
                  href={`/picc/annual-reports/${edit.reportId}/images`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium border border-picc-ochre-300 text-picc-ochre-700 hover:bg-picc-ochre-50"
                >
                  <Image className="w-5 h-5" />
                  Manage Report Images
                </Link>
              )}
              <Link
                href="/picc/media/gallery"
                className="w-full text-center px-6 py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Open Media Library
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiscal Year (July–June)
              </label>
              <select
                value={config.fiscalYearStart}
                onChange={(e) => setConfig((prev) => ({ ...prev, fiscalYearStart: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre-500 focus:border-transparent"
              >
                {Array.from({ length: 6 }).map((_, i) => {
                  const now = new Date();
                  const currentStart = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
                  const start = currentStart - i;
                  const end = start + 1;
                  return (
                    <option key={start} value={start}>
                      {start}-{end.toString().slice(-2)}
                    </option>
                  );
                })}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Creates report year {reportYear} for period {reportingPeriodStart} → {reportingPeriodEnd}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <input
                type="text"
                value={config.theme}
                onChange={(e) => setConfig((prev) => ({ ...prev, theme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Used as a high-level framing theme.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stories to Include</label>
              <input
                type="number"
                min={6}
                max={40}
                value={config.storyLimit}
                onChange={(e) => setConfig((prev) => ({ ...prev, storyLimit: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-ochre-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Automatically prioritises report-worthy + photo-rich stories.</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={config.includeMedia}
                  onChange={(e) => setConfig((prev) => ({ ...prev, includeMedia: e.target.checked }))}
                  className="rounded text-picc-ochre-600 focus:ring-2 focus:ring-picc-ochre-500"
                />
                Prioritise photos (media library + story images)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={config.includeQuotes}
                  onChange={(e) => setConfig((prev) => ({ ...prev, includeQuotes: e.target.checked }))}
                  className="rounded text-picc-ochre-600 focus:ring-2 focus:ring-picc-ochre-500"
                />
                Pull validated quotes (if available)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={config.publishStatus}
                  onChange={(e) => setConfig((prev) => ({ ...prev, publishStatus: e.target.checked }))}
                  className="rounded text-picc-ochre-600 focus:ring-2 focus:ring-picc-ochre-500"
                />
                Mark as published automatically
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={generateAnnualReport}
              disabled={status.state === 'working'}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-picc-ochre-600 to-picc-ochre-700 hover:from-picc-ochre-700 hover:to-picc-ochre-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status.state === 'working' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Generate {fiscalYearLabel} Annual Report
            </button>

            {status.state === 'working' && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-picc-ochre-600" />
                {status.message}
              </div>
            )}

            {status.state === 'done' && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-800 font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Generated successfully
                </div>
                <div className="text-sm text-green-700 mt-1">
                  View it at{' '}
                  <Link className="underline" href={`/annual-report/${status.reportYear}`}>
                    /annual-report/{status.reportYear}
                  </Link>
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Report ID: <span className="font-mono">{status.reportId}</span>
                </div>
              </div>
            )}

            {status.state === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {status.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportGeneratorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading report generator...</div>}>
      <ReportGeneratorPageContent />
    </Suspense>
  );
}
