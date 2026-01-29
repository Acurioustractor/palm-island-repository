'use client';

import { useState, useEffect } from 'react';
import { Printer, Settings, ChevronDown, Check, Pencil } from 'lucide-react';
import {
  audienceProfiles,
  allSections,
  type AudienceType,
  type SectionConfig,
} from '@/lib/annual-report/audience-profiles';

interface Props {
  currentAudience: AudienceType | null;
  editMode: boolean;
}

export function PrintReportConfigurator({ currentAudience, editMode }: Props) {
  const [audience, setAudience] = useState<AudienceType | null>(currentAudience);
  const [showSections, setShowSections] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());

  // Initialize hidden sections from audience profile
  useEffect(() => {
    if (audience) {
      const profile = audienceProfiles[audience];
      const hidden = new Set<string>();
      profile.sections.forEach((s) => {
        if (!s.defaultVisible) hidden.add(s.id);
      });
      setHiddenSections(hidden);
      // Apply visibility to DOM
      applyVisibility(hidden);
    } else {
      setHiddenSections(new Set());
      applyVisibility(new Set());
    }
  }, [audience]);

  function applyVisibility(hidden: Set<string>) {
    allSections.forEach((s) => {
      const el = document.querySelector(`[data-section="${s.id}"]`);
      if (el) {
        (el as HTMLElement).style.display = hidden.has(s.id) ? 'none' : '';
      }
    });
  }

  function toggleSection(sectionId: string) {
    const next = new Set(hiddenSections);
    if (next.has(sectionId)) {
      next.delete(sectionId);
    } else {
      next.add(sectionId);
    }
    setHiddenSections(next);
    applyVisibility(next);
  }

  function switchAudience(a: AudienceType | null) {
    setAudience(a);
    // Update URL without reload
    const url = new URL(window.location.href);
    if (a) {
      url.searchParams.set('audience', a);
    } else {
      url.searchParams.delete('audience');
    }
    if (editMode) url.searchParams.set('edit', '1');
    window.history.replaceState({}, '', url.toString());
  }

  return (
    <div className="no-print fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Section toggles panel */}
      {showSections && (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-72 max-h-[60vh] overflow-y-auto">
          <h4 className="font-bold text-gray-900 text-sm mb-3">Report Sections</h4>
          <div className="space-y-1">
            {allSections.map((s) => {
              const isHidden = hiddenSections.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSection(s.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    isHidden
                      ? 'text-gray-400 bg-gray-50'
                      : 'text-gray-900 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isHidden
                        ? 'border-gray-300'
                        : 'border-purple-600 bg-purple-600'
                    }`}
                  >
                    {!isHidden && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-full shadow-2xl border border-gray-200 px-4 py-2 flex items-center gap-3">
        {/* Audience selector */}
        <div className="relative">
          <select
            value={audience || ''}
            onChange={(e) =>
              switchAudience((e.target.value as AudienceType) || null)
            }
            className="appearance-none bg-gray-100 text-sm font-medium text-gray-700 pl-3 pr-8 py-2 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Full Report</option>
            {Object.values(audienceProfiles).map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {/* Section toggle button */}
        <button
          onClick={() => setShowSections(!showSections)}
          className={`p-2 rounded-lg transition-colors ${
            showSections ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Toggle sections"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Edit mode indicator */}
        {editMode && (
          <div className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">
            <Pencil className="w-3.5 h-3.5" />
            Edit Mode
          </div>
        )}

        {/* Print button */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>
    </div>
  );
}

export default PrintReportConfigurator;
