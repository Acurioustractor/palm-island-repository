'use client';

import { useState } from 'react';
import { Tag, AlertCircle, CheckCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  story_type: string;
  report_section?: string;
  quality_score?: number;
  report_worthy?: boolean;
  access_level: string;
}

interface ThematicAnalysisPanelProps {
  story: Story;
  onUpdate: (updates: Partial<Story>) => void;
}

// Common themes for Palm Island stories
const COMMON_THEMES = [
  { value: 'community_resilience', label: 'Community Resilience', color: 'blue' },
  { value: 'cultural_preservation', label: 'Cultural Preservation', color: 'purple' },
  { value: 'intergenerational_knowledge', label: 'Intergenerational Knowledge', color: 'amber' },
  { value: 'environmental_connection', label: 'Environmental Connection', color: 'green' },
  { value: 'health_wellbeing', label: 'Health & Wellbeing', color: 'pink' },
  { value: 'education_youth', label: 'Education & Youth', color: 'indigo' },
  { value: 'leadership_governance', label: 'Leadership & Governance', color: 'red' },
  { value: 'economic_development', label: 'Economic Development', color: 'teal' },
  { value: 'traditional_practices', label: 'Traditional Practices', color: 'orange' },
  { value: 'family_kinship', label: 'Family & Kinship', color: 'rose' },
];

const PRIVACY_LEVELS = [
  { value: 'public', label: 'Public', description: 'Anyone can view', icon: '🌍' },
  { value: 'community', label: 'Community', description: 'Registered members only', icon: '👥' },
  { value: 'restricted', label: 'Restricted', description: 'PICC staff only', icon: '🔒' },
  { value: 'private', label: 'Private', description: 'Special permissions', icon: '🚫' },
];

export default function ThematicAnalysisPanel({ story, onUpdate }: ThematicAnalysisPanelProps) {
  const [localStory, setLocalStory] = useState(story);
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdate = (field: string, value: any) => {
    setLocalStory({ ...localStory, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(localStory);
    setHasChanges(false);
  };

  const toggleTag = (tag: string) => {
    const currentTags = localStory.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    handleUpdate('tags', newTags);
  };

  const addCustomTag = (tag: string) => {
    if (tag.trim() && !localStory.tags.includes(tag.trim())) {
      handleUpdate('tags', [...localStory.tags, tag.trim()]);
    }
  };

  // Extract potential identifying information (simple pattern matching)
  const privacyWarnings = [];
  const content = localStory.content.toLowerCase();

  if (content.match(/\b(uncle|auntie|aunty)\s+\w+/i)) privacyWarnings.push('Contains family titles with names');
  if (content.match(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/)) privacyWarnings.push('Contains specific dates');
  if (content.match(/\b\d+\s+\w+\s+(street|road|avenue|drive)\b/i)) privacyWarnings.push('Contains street addresses');
  if (content.match(/\b\d{3,}\b/)) privacyWarnings.push('Contains numbers (phone/address?)');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Thematic Analysis
        </h3>
        {hasChanges && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Privacy Review */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Privacy Review
        </h4>

        {privacyWarnings.length > 0 ? (
          <div className="space-y-1">
            <p className="text-sm text-amber-800 font-medium">⚠️ Potential identifying information detected:</p>
            <ul className="text-sm text-amber-700 list-disc list-inside">
              {privacyWarnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
            <p className="text-xs text-amber-600 mt-2">
              Review before publishing or including in reports. Consider using "Community Voice" or de-identifying content.
            </p>
          </div>
        ) : (
          <p className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            No obvious identifying information detected
          </p>
        )}

        {/* Access Level */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-amber-900 mb-2">Access Level</label>
          <div className="grid grid-cols-2 gap-2">
            {PRIVACY_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => handleUpdate('access_level', level.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  localStory.access_level === level.value
                    ? 'border-amber-500 bg-amber-100'
                    : 'border-gray-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{level.icon}</span>
                  <span className="font-medium text-sm">{level.label}</span>
                </div>
                <p className="text-xs text-gray-600">{level.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Theme Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thematic Categories</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_THEMES.map(theme => {
            const isSelected = (localStory.tags || []).includes(theme.value);
            return (
              <button
                key={theme.value}
                onClick={() => toggleTag(theme.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? `bg-${theme.color}-100 text-${theme.color}-800 border-2 border-${theme.color}-400`
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                {theme.label}
              </button>
            );
          })}
        </div>

        {/* Custom Tags */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Add custom tag..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCustomTag((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Press Enter to add custom tags</p>
        </div>

        {/* Current Tags */}
        {localStory.tags && localStory.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {localStory.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Report Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Report Section</label>
          <select
            value={localStory.report_section || ''}
            onChange={(e) => handleUpdate('report_section', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Not for reports</option>
            <option value="community_resilience">Community Resilience</option>
            <option value="cultural_preservation">Cultural Preservation</option>
            <option value="health_services">Health Services</option>
            <option value="education_programs">Education Programs</option>
            <option value="youth_engagement">Youth Engagement</option>
            <option value="elder_wisdom">Elder Wisdom</option>
            <option value="environmental_care">Environmental Care</option>
            <option value="economic_initiatives">Economic Initiatives</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quality Score</label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={localStory.quality_score || 50}
            onChange={(e) => handleUpdate('quality_score', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span className="font-bold text-purple-600">{localStory.quality_score || 50}</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* Report Worthy Flag */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="report-worthy"
          checked={localStory.report_worthy || false}
          onChange={(e) => handleUpdate('report_worthy', e.target.checked)}
          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
        />
        <label htmlFor="report-worthy" className="flex-1">
          <div className="font-medium text-gray-900">Include in Annual Report</div>
          <div className="text-sm text-gray-600">
            This story is suitable for annual reports and thematic summaries (will be de-identified)
          </div>
        </label>
      </div>

      {/* Summary for Reports */}
      {localStory.report_worthy && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-bold text-purple-900 mb-2">De-identified Summary</h4>
          <p className="text-sm text-purple-700 mb-3">
            This summary will be used in reports instead of the full story to protect privacy:
          </p>
          <textarea
            placeholder="Optional: Write a de-identified version of this story for use in reports..."
            rows={4}
            className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-purple-600 mt-2">
            💡 Tip: Remove names, dates, and specific details. Focus on themes, feelings, and general outcomes.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{localStory.tags?.length || 0}</div>
          <div className="text-xs text-gray-600">Themes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{localStory.quality_score || 50}</div>
          <div className="text-xs text-gray-600">Quality</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {localStory.report_worthy ? '✓' : '—'}
          </div>
          <div className="text-xs text-gray-600">Report Ready</div>
        </div>
      </div>
    </div>
  );
}
