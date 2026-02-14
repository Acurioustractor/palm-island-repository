'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Link2, Unlink, Star, Image, MessageSquare, Search, Filter, Calendar, Plus, CheckSquare, Square, X, ThumbsUp, Heart } from 'lucide-react';
import StoryCreatorPanel from './StoryCreatorPanel';
import EmptyState from './EmptyState';

interface LinkedStory {
  link_id: string;
  report_id?: string;
  story_id: string;
  is_featured: boolean;
  section_placement: string | null;
  display_order: number;
  title: string;
  storyteller_name: string | null;
  category: string | null;
  quality_score: number | null;
  featured_quote: string | null;
  hero_image_url: string | null;
  status: string | null;
  report_year?: number | null;
}

interface StoriesPanelProps {
  stories: LinkedStory[];
  reportId: string | null;
  onStoriesChange: (stories: LinkedStory[]) => void;
}

const SECTIONS = ['introduction', 'services', 'community', 'culture', 'leadership', 'innovation'];

const YEAR_LABELS: Record<number, string> = {
  2024: '2023-24',
  2025: '2024-25',
  2026: '2025-26',
};

export default function StoriesPanel({ stories, reportId, onStoriesChange }: StoriesPanelProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [availableStories, setAvailableStories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string>('current');
  const [allStories, setAllStories] = useState<LinkedStory[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [voteCounts, setVoteCounts] = useState<Record<string, { total_votes: number; upvotes: number; loves: number }>>({});
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);

  // Fetch all historical stories when switching to "all" filter
  useEffect(() => {
    if (yearFilter !== 'current' && allStories.length === 0) {
      fetchAllStories();
    }
  }, [yearFilter]);

  const fetchAllStories = async () => {
    setLoadingAll(true);
    try {
      const res = await fetch('/api/annual-report-data/stories?all=true');
      if (!res.ok) return;
      const data = await res.json();
      setAllStories(data.stories || []);
    } catch {
      setAllStories([]);
    } finally {
      setLoadingAll(false);
    }
  };

  // Fetch vote counts when reportId changes
  useEffect(() => {
    if (!reportId) return;
    fetch(`/api/annual-report-data/votes?report_id=${reportId}&content_type=story`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.counts)) {
          const map: Record<string, { total_votes: number; upvotes: number; loves: number }> = {};
          for (const c of data.counts) {
            map[c.content_id] = { total_votes: c.total_votes, upvotes: c.upvotes, loves: c.loves };
          }
          setVoteCounts(map);
        } else if (data.counts && typeof data.counts === 'object') {
          // Aggregated format from fallback
          const map: Record<string, { total_votes: number; upvotes: number; loves: number }> = {};
          for (const [key, val] of Object.entries(data.counts as Record<string, any>)) {
            const contentId = key.replace('story:', '');
            map[contentId] = val;
          }
          setVoteCounts(map);
        }
        if (data.user_votes) {
          setUserVotes(new Set(data.user_votes));
        }
      })
      .catch(() => {});
  }, [reportId]);

  const handleVote = async (storyId: string, voteType: 'upvote' | 'love') => {
    if (!reportId) return;
    const voteKey = `story:${storyId}:${voteType}`;
    const hasVoted = userVotes.has(voteKey);
    setVotingId(storyId);

    try {
      if (hasVoted) {
        await fetch(
          `/api/annual-report-data/votes?report_id=${reportId}&content_type=story&content_id=${storyId}&user_id=anonymous`,
          { method: 'DELETE' }
        );
        setUserVotes(prev => { const next = new Set(prev); next.delete(voteKey); return next; });
        setVoteCounts(prev => {
          const current = prev[storyId] || { total_votes: 0, upvotes: 0, loves: 0 };
          return {
            ...prev,
            [storyId]: {
              ...current,
              total_votes: Math.max(0, current.total_votes - 1),
              [voteType === 'upvote' ? 'upvotes' : 'loves']: Math.max(0, (current[voteType === 'upvote' ? 'upvotes' : 'loves'] || 0) - 1),
            },
          };
        });
      } else {
        await fetch('/api/annual-report-data/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_id: reportId,
            content_type: 'story',
            content_id: storyId,
            user_id: 'anonymous',
            vote_type: voteType,
          }),
        });
        setUserVotes(prev => new Set(prev).add(voteKey));
        setVoteCounts(prev => {
          const current = prev[storyId] || { total_votes: 0, upvotes: 0, loves: 0 };
          return {
            ...prev,
            [storyId]: {
              ...current,
              total_votes: current.total_votes + 1,
              [voteType === 'upvote' ? 'upvotes' : 'loves']: (current[voteType === 'upvote' ? 'upvotes' : 'loves'] || 0) + 1,
            },
          };
        });
      }
    } catch {
      // Silently fail
    } finally {
      setVotingId(null);
    }
  };

  // Determine which stories to display based on filter
  const displayStories = yearFilter === 'current'
    ? stories
    : yearFilter === 'all'
      ? allStories
      : allStories.filter(s => s.report_year === parseInt(yearFilter));

  // Get available years from all stories
  const availableYears = Array.from(new Set(allStories.map(s => s.report_year).filter(Boolean) as number[])).sort((a, b) => b - a);

  // Quick stats (based on displayed stories)
  const totalLinked = displayStories.length;
  const withQuotes = displayStories.filter(s => s.featured_quote).length;
  const withImages = displayStories.filter(s => s.hero_image_url).length;
  const bySection = SECTIONS.reduce((acc, section) => {
    acc[section] = displayStories.filter(s => s.section_placement === section).length;
    return acc;
  }, {} as Record<string, number>);

  const fetchAvailable = async () => {
    try {
      const res = await fetch('/api/stories?status=published&limit=100');
      if (!res.ok) return;
      const data = await res.json();
      const linkedIds = new Set(stories.map(s => s.story_id));
      setAvailableStories(
        (data.stories || []).filter((s: any) => !linkedIds.has(s.id))
      );
    } catch {
      setAvailableStories([]);
    }
  };

  const handleLink = async (storyId: string) => {
    if (!reportId) return;
    setSaving(storyId);
    try {
      const res = await fetch('/api/annual-report-data/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'link', report_id: reportId, story_id: storyId }),
      });
      if (!res.ok) throw new Error('Link failed');
      const storiesRes = await fetch(`/api/annual-report-data/stories?report_id=${reportId}`);
      const data = await storiesRes.json();
      onStoriesChange(data.stories || []);
      setAvailableStories(prev => prev.filter(s => s.id !== storyId));
    } catch (error) {
      console.error('Link error:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleUnlink = async (storyId: string) => {
    if (!reportId) return;
    setSaving(storyId);
    try {
      await fetch('/api/annual-report-data/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlink', report_id: reportId, story_id: storyId }),
      });
      onStoriesChange(stories.filter(s => s.story_id !== storyId));
    } catch (error) {
      console.error('Unlink error:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleToggleFeatured = async (linkId: string, current: boolean) => {
    setSaving(linkId);
    try {
      await fetch('/api/annual-report-data/stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: linkId, is_featured: !current }),
      });
      onStoriesChange(
        stories.map(s => s.link_id === linkId ? { ...s, is_featured: !current } : s)
      );
    } catch (error) {
      console.error('Toggle featured error:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleSectionChange = async (linkId: string, section: string) => {
    setSaving(linkId);
    try {
      await fetch('/api/annual-report-data/stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: linkId, section_placement: section || null }),
      });
      onStoriesChange(
        stories.map(s => s.link_id === linkId ? { ...s, section_placement: section || null } : s)
      );
    } catch (error) {
      console.error('Section change error:', error);
    } finally {
      setSaving(null);
    }
  };

  const toggleSelected = (linkId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(linkId)) next.delete(linkId);
      else next.add(linkId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(displayStories.map(s => s.link_id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const bulkSetSection = async (section: string) => {
    if (!reportId || selectedIds.size === 0) return;
    setBulkSaving(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(linkId =>
          fetch('/api/annual-report-data/stories', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link_id: linkId, section_placement: section || null }),
          })
        )
      );
      onStoriesChange(
        stories.map(s =>
          selectedIds.has(s.link_id) ? { ...s, section_placement: section || null } : s
        )
      );
      clearSelection();
    } catch (error) {
      console.error('Bulk section error:', error);
    } finally {
      setBulkSaving(false);
    }
  };

  const bulkFeature = async (featured: boolean) => {
    if (!reportId || selectedIds.size === 0) return;
    setBulkSaving(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(linkId =>
          fetch('/api/annual-report-data/stories', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link_id: linkId, is_featured: featured }),
          })
        )
      );
      onStoriesChange(
        stories.map(s =>
          selectedIds.has(s.link_id) ? { ...s, is_featured: featured } : s
        )
      );
      clearSelection();
    } catch (error) {
      console.error('Bulk feature error:', error);
    } finally {
      setBulkSaving(false);
    }
  };

  const bulkUnlink = async () => {
    if (!reportId || selectedIds.size === 0) return;
    setBulkSaving(true);
    try {
      const selectedStoryIds = stories
        .filter(s => selectedIds.has(s.link_id))
        .map(s => s.story_id);
      await Promise.all(
        selectedStoryIds.map(storyId =>
          fetch('/api/annual-report-data/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'unlink', report_id: reportId, story_id: storyId }),
          })
        )
      );
      onStoriesChange(stories.filter(s => !selectedIds.has(s.link_id)));
      clearSelection();
    } catch (error) {
      console.error('Bulk unlink error:', error);
    } finally {
      setBulkSaving(false);
    }
  };

  if (!reportId) {
    return (
      <div className="bg-picc-ochre-50 border border-picc-ochre-200 rounded-lg p-4 text-sm text-picc-ochre">
        No annual report found for this fiscal year. Create one first.
      </div>
    );
  }

  const isCurrentView = yearFilter === 'current';

  return (
    <div className="max-w-5xl space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Linked Stories" value={totalLinked} icon={<BookOpen className="w-4 h-4" />} />
        <StatCard label="With Quotes" value={withQuotes} icon={<MessageSquare className="w-4 h-4" />} />
        <StatCard label="With Images" value={withImages} icon={<Image className="w-4 h-4" />} />
        <StatCard label="Featured" value={displayStories.filter(s => s.is_featured).length} icon={<Star className="w-4 h-4" />} />
      </div>

      {/* Year Filter + Section breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter by Year
          </h3>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
            >
              <option value="current">Current Report</option>
              <option value="all">All Years ({allStories.length || '...'})</option>
              {availableYears.map(y => (
                <option key={y} value={y.toString()}>
                  FY {YEAR_LABELS[y] || y} ({allStories.filter(s => s.report_year === y).length})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(s => (
            <span key={s} className="px-2.5 py-1 text-xs font-medium bg-gray-100 rounded-full text-gray-600">
              {s}: {bySection[s]}
            </span>
          ))}
        </div>
      </div>

      {/* Header with Link button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {isCurrentView ? 'Linked Stories' : `Stories — ${yearFilter === 'all' ? 'All Years' : `FY ${YEAR_LABELS[parseInt(yearFilter)] || yearFilter}`}`}
        </h2>
        {isCurrentView && (
          <div className="flex items-center gap-2">
            {displayStories.length > 0 && (
              <button
                onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  bulkMode
                    ? 'text-picc-ochre bg-warm-100 border border-warm-300'
                    : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                {bulkMode ? 'Cancel' : 'Select'}
              </button>
            )}
            <button
              onClick={() => setShowCreator(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-sage-600 border border-sage-200 rounded-lg hover:bg-sage-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Story
            </button>
            <button
              onClick={() => { setShowPicker(true); fetchAvailable(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-picc-ochre border border-warm-200 rounded-lg hover:bg-warm-50 transition-colors"
            >
              <Link2 className="w-4 h-4" />
              Link More Stories
            </button>
          </div>
        )}
      </div>

      {/* Loading state for all stories */}
      {loadingAll && !isCurrentView && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-picc-ochre" />
        </div>
      )}

      {/* Stories list */}
      <div className="space-y-3">
        {displayStories.map(story => (
          <div key={story.link_id} className={`bg-white rounded-xl border p-4 flex items-start gap-4 ${
            bulkMode && selectedIds.has(story.link_id) ? 'border-warm-300 bg-warm-50/30' : 'border-gray-200'
          }`}>
            {bulkMode && isCurrentView && (
              <button
                onClick={() => toggleSelected(story.link_id)}
                className="flex-shrink-0 mt-1 text-gray-400 hover:text-picc-ochre transition-colors"
              >
                {selectedIds.has(story.link_id) ? (
                  <CheckSquare className="w-5 h-5 text-picc-ochre" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            )}
            {story.hero_image_url ? (
              <img
                src={story.hero_image_url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Image className="w-6 h-6 text-gray-300" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {story.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {story.storyteller_name || 'Unknown storyteller'}
                    {story.category && ` \u00B7 ${story.category}`}
                    {story.quality_score != null && ` \u00B7 Score: ${story.quality_score}`}
                    {!isCurrentView && story.report_year && (
                      <span className="ml-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">
                        FY {YEAR_LABELS[story.report_year] || story.report_year}
                      </span>
                    )}
                  </p>
                </div>
                {isCurrentView && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleToggleFeatured(story.link_id, story.is_featured)}
                      disabled={saving === story.link_id}
                      className={`p-1.5 rounded transition-colors ${
                        story.is_featured
                          ? 'text-picc-ochre hover:text-picc-ochre bg-picc-ochre-50'
                          : 'text-gray-300 hover:text-gray-500'
                      }`}
                      title={story.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star className="w-4 h-4" fill={story.is_featured ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => handleUnlink(story.story_id)}
                      disabled={saving === story.story_id}
                      className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                      title="Unlink"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {story.featured_quote && (
                <p className="text-xs text-gray-600 italic mt-1 line-clamp-2">
                  &ldquo;{story.featured_quote}&rdquo;
                </p>
              )}

              {/* Vote buttons */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => handleVote(story.story_id, 'upvote')}
                  disabled={votingId === story.story_id}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                    userVotes.has(`story:${story.story_id}:upvote`)
                      ? 'text-blue-600 bg-blue-50 border border-blue-200'
                      : 'text-gray-400 hover:text-blue-500 border border-gray-100 hover:border-blue-200'
                  }`}
                  title="Upvote for report inclusion"
                >
                  <ThumbsUp className="w-3.5 h-3.5" fill={userVotes.has(`story:${story.story_id}:upvote`) ? 'currentColor' : 'none'} />
                  <span>{voteCounts[story.story_id]?.upvotes || 0}</span>
                </button>
                <button
                  onClick={() => handleVote(story.story_id, 'love')}
                  disabled={votingId === story.story_id}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                    userVotes.has(`story:${story.story_id}:love`)
                      ? 'text-pink-600 bg-pink-50 border border-pink-200'
                      : 'text-gray-400 hover:text-pink-500 border border-gray-100 hover:border-pink-200'
                  }`}
                  title="Love this story"
                >
                  <Heart className="w-3.5 h-3.5" fill={userVotes.has(`story:${story.story_id}:love`) ? 'currentColor' : 'none'} />
                  <span>{voteCounts[story.story_id]?.loves || 0}</span>
                </button>
                {(voteCounts[story.story_id]?.total_votes || 0) > 0 && (
                  <span className="text-[10px] text-gray-400">
                    {voteCounts[story.story_id].total_votes} vote{voteCounts[story.story_id].total_votes !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {isCurrentView && (
                <div className="mt-2">
                  <select
                    value={story.section_placement || ''}
                    onChange={e => handleSectionChange(story.link_id, e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-200 rounded-md focus:border-picc-ochre-300 focus:outline-none"
                  >
                    <option value="">No section</option>
                    {SECTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}

        {displayStories.length === 0 && !loadingAll && (
          isCurrentView ? (
            <EmptyState
              icon={<BookOpen className="w-6 h-6" />}
              title="No stories linked yet"
              description="Link published stories to this report or create a new one."
              action={{ label: 'Link Stories', onClick: () => { setShowPicker(true); fetchAvailable(); } }}
              secondaryAction={{ label: 'Create New Story', href: '#' }}
            />
          ) : (
            <EmptyState
              icon={<BookOpen className="w-6 h-6" />}
              title="No stories found"
              description="No stories match the selected year filter."
            />
          )
        )}
      </div>

      {/* Bulk Action Bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="sticky bottom-4 mx-auto max-w-3xl bg-white rounded-xl border border-warm-200 shadow-lg p-3 flex items-center gap-3 z-40">
          <div className="flex items-center gap-2 text-sm font-medium text-picc-ochre">
            <CheckSquare className="w-4 h-4" />
            {selectedIds.size} selected
          </div>
          <button
            onClick={selectAll}
            className="text-xs text-picc-ochre hover:underline"
          >
            Select all
          </button>
          <div className="flex-1" />
          <select
            onChange={e => { if (e.target.value) bulkSetSection(e.target.value); e.target.value = ''; }}
            disabled={bulkSaving}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-picc-ochre-300 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Set Section...</option>
            <option value="">No section</option>
            {SECTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={() => bulkFeature(true)}
            disabled={bulkSaving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-picc-ochre border border-picc-ochre-200 rounded-lg hover:bg-picc-ochre-50 disabled:opacity-50 transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            Feature All
          </button>
          <button
            onClick={() => bulkUnlink()}
            disabled={bulkSaving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Unlink className="w-3.5 h-3.5" />
            Unlink All
          </button>
          <button
            onClick={clearSelection}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Story Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Link Stories to Report</h3>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search stories..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-picc-ochre-300 focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {availableStories
                .filter(s =>
                  !searchQuery ||
                  s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.storyteller_name?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((story: any) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-warm-200 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {story.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {story.storyteller_name || 'Unknown'}
                        {story.category && ` \u00B7 ${story.category}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLink(story.id)}
                      disabled={saving === story.id}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-picc-ochre border border-warm-200 rounded-md hover:bg-warm-50 disabled:opacity-50 transition-colors"
                    >
                      <Link2 className="w-3 h-3" />
                      Link
                    </button>
                  </div>
                ))}
              {availableStories.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-8">
                  No published stories available to link.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Story Creator Modal */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <StoryCreatorPanel
            onClose={() => setShowCreator(false)}
            onStoryCreated={() => {
              setShowCreator(false);
              // Refresh the stories list
              if (reportId) {
                fetch(`/api/annual-report-data/stories?report_id=${reportId}`)
                  .then(r => r.json())
                  .then(d => onStoriesChange(d.stories || []))
                  .catch(() => {});
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
