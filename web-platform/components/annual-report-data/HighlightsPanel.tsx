'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, MessageSquare, Trophy } from 'lucide-react';
import EmptyState from './EmptyState';

interface Highlight {
  id?: string;
  report_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  impact_achieved: string | null;
  highlight_type: string | null;
  is_featured: boolean;
  display_order: number;
}

interface LeadershipMessage {
  id: string;
  full_name: string;
  position: string;
  leadership_type: string;
  message_title: string | null;
  message_content: string | null;
  message_excerpt: string | null;
  featured_quote: string | null;
}

interface HighlightsPanelProps {
  highlights: Highlight[];
  leadership: LeadershipMessage[];
  reportId: string | null;
  onHighlightsChange: (highlights: Highlight[]) => void;
  onLeadershipChange: (leadership: LeadershipMessage[]) => void;
  onSaveHighlight: (highlight: Highlight) => Promise<void>;
  onDeleteHighlight: (id: string) => Promise<void>;
  onSaveLeadership: (leader: LeadershipMessage) => Promise<void>;
}

export default function HighlightsPanel({
  highlights,
  leadership,
  reportId,
  onHighlightsChange,
  onLeadershipChange,
  onSaveHighlight,
  onDeleteHighlight,
  onSaveLeadership,
}: HighlightsPanelProps) {
  const [saving, setSaving] = useState<string | null>(null);

  const addHighlight = () => {
    if (!reportId) return;
    const newHighlight: Highlight = {
      report_id: reportId,
      title: '',
      subtitle: null,
      description: null,
      impact_achieved: null,
      highlight_type: 'achievement',
      is_featured: false,
      display_order: highlights.length,
    };
    onHighlightsChange([...highlights, newHighlight]);
  };

  const updateHighlight = (idx: number, updates: Partial<Highlight>) => {
    const updated = [...highlights];
    updated[idx] = { ...updated[idx], ...updates };
    onHighlightsChange(updated);
  };

  const handleSaveHighlight = async (hl: Highlight) => {
    setSaving(hl.id || 'new');
    try {
      await onSaveHighlight(hl);
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteHighlight = async (id: string) => {
    await onDeleteHighlight(id);
  };

  const handleSaveLeadership = async (leader: LeadershipMessage) => {
    setSaving(leader.id);
    try {
      await onSaveLeadership(leader);
    } finally {
      setSaving(null);
    }
  };

  const updateLeader = (id: string, updates: Partial<LeadershipMessage>) => {
    onLeadershipChange(
      leadership.map(l => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Key Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Key Achievements</h2>
          {reportId && (
            <button
              onClick={addHighlight}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-picc-ochre border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>

        {!reportId && (
          <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg p-4 text-sm text-picc-ochre">
            No annual report found for this fiscal year. Create one first in the Annual
            Reports section.
          </div>
        )}

        {highlights.length === 0 && reportId && (
          <EmptyState
            icon={<Trophy className="w-6 h-6" />}
            title="No achievements yet"
            description="Add your first key achievement or milestone for this fiscal year."
            action={{ label: 'Add Achievement', onClick: addHighlight }}
          />
        )}

        <div className="space-y-4">
          {highlights.map((hl, idx) => (
            <div
              key={hl.id || idx}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={hl.title}
                    onChange={e => updateHighlight(idx, { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                    placeholder="Achievement title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Type
                  </label>
                  <select
                    value={hl.highlight_type || 'achievement'}
                    onChange={e =>
                      updateHighlight(idx, { highlight_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                  >
                    <option value="achievement">Achievement</option>
                    <option value="innovation">Innovation</option>
                    <option value="community_impact">Community Impact</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description
                </label>
                <textarea
                  value={hl.description || ''}
                  onChange={e =>
                    updateHighlight(idx, {
                      description: e.target.value || null,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                  placeholder="Describe the achievement..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Impact
                </label>
                <input
                  type="text"
                  value={hl.impact_achieved || ''}
                  onChange={e =>
                    updateHighlight(idx, {
                      impact_achieved: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                  placeholder="e.g., 500 community members served"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hl.is_featured}
                    onChange={e =>
                      updateHighlight(idx, { is_featured: e.target.checked })
                    }
                    className="rounded border-gray-300 text-picc-ochre"
                  />
                  Featured
                </label>
                <div className="flex items-center gap-2">
                  {hl.id && (
                    <button
                      onClick={() => handleDeleteHighlight(hl.id!)}
                      className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleSaveHighlight(hl)}
                    disabled={saving === (hl.id || 'new')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-picc-ochre rounded-lg hover:bg-picc-ochre-600 disabled:opacity-50 transition-colors"
                  >
                    {saving === (hl.id || 'new') ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Messages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Leadership Messages
        </h2>

        <div className="space-y-4">
          {leadership.map(leader => (
            <div
              key={leader.id}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <div className="font-medium text-gray-900">{leader.full_name}</div>
                  <div className="text-sm text-gray-500">{leader.position}</div>
                </div>
                <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  {leader.leadership_type}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Message Title
                  </label>
                  <input
                    type="text"
                    value={leader.message_title || ''}
                    onChange={e =>
                      updateLeader(leader.id, {
                        message_title: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                    placeholder="e.g., Message from the CEO"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Message Content
                  </label>
                  <textarea
                    value={leader.message_content || ''}
                    onChange={e =>
                      updateLeader(leader.id, {
                        message_content: e.target.value || null,
                      })
                    }
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                    placeholder="Full message content..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Featured Quote
                  </label>
                  <input
                    type="text"
                    value={leader.featured_quote || ''}
                    onChange={e =>
                      updateLeader(leader.id, {
                        featured_quote: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                    placeholder="Pull quote from the message..."
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleSaveLeadership(leader)}
                  disabled={saving === leader.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-picc-ochre rounded-lg hover:bg-picc-ochre-600 disabled:opacity-50 transition-colors"
                >
                  {saving === leader.id ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Message
                </button>
              </div>
            </div>
          ))}

          {leadership.length === 0 && (
            <EmptyState
              icon={<MessageSquare className="w-6 h-6" />}
              title="No leadership messages"
              description="Add leaders in the Board tab first, then write their messages here."
            />
          )}
        </div>
      </div>
    </div>
  );
}
