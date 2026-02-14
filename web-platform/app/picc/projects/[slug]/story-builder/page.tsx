'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Save, Eye, Trash2, GripVertical,
  Type, Quote, Image as ImageIcon, Video, Layout, Mountain,
  Calendar, Grid3x3, MoveUp, MoveDown, BookOpen, X, Check, Sparkles
} from 'lucide-react';
import { MediaUpload } from '@/components/story-builder/MediaUpload';
import {
  TextSectionEditor,
  QuoteSectionEditor,
  SideBySideSectionEditor,
  VideoSectionEditor,
  FullBleedImageEditor,
  GallerySectionEditor,
  TimelineSectionEditor,
  ParallaxSectionEditor,
} from '@/components/story-builder/SectionEditors';

interface Section {
  id: string;
  type: 'text' | 'quote' | 'sidebyside' | 'video' | 'fullbleed' | 'gallery' | 'timeline' | 'parallax';
  order: number;
  data: any;
}

export default function StoryBuilderPage({ params }: { params: { slug: string } }) {
  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storySubtitle, setStorySubtitle] = useState('');
  const [heroMedia, setHeroMedia] = useState<{ url: string; type: 'image' | 'video' }>({ url: '', type: 'image' });
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [storytellersLoading, setStorytellersLoading] = useState(false);
  const [storytellers, setStorytellers] = useState<Array<{ id: string; full_name: string; preferred_name?: string; is_elder?: boolean; profile_image_url?: string }>>([]);
  const [selectedStorytellerIds, setSelectedStorytellerIds] = useState<Record<string, boolean>>({});
  const [projectName, setProjectName] = useState('');

  const sectionTypes = [
    { type: 'text', icon: Type, label: 'Text Section', color: 'blue' },
    { type: 'quote', icon: Quote, label: 'Quote', color: 'picc-ochre' },
    { type: 'sidebyside', icon: Layout, label: 'Side by Side', color: 'green' },
    { type: 'video', icon: Video, label: 'Video', color: 'red' },
    { type: 'fullbleed', icon: ImageIcon, label: 'Full Image', color: 'orange' },
    { type: 'gallery', icon: Grid3x3, label: 'Gallery', color: 'picc-red' },
    { type: 'timeline', icon: Calendar, label: 'Timeline', color: 'sage' },
    { type: 'parallax', icon: Mountain, label: 'Parallax', color: 'warm' },
  ];

  // Load existing story if it exists
  useEffect(() => {
    setStoryId(null);
    setStoryTitle('');
    setStorySubtitle('');
    setHeroMedia({ url: '', type: 'image' });
    setSections([]);
    setProjectName('');
    loadEditorData();
  }, [params.slug]);

  const loadEditorData = async () => {
    try {
      const res = await fetch(`/api/story-builder?projectSlug=${encodeURIComponent(params.slug)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load story');

      if (json?.project?.name) setProjectName(json.project.name);

      const story = json?.story;
      if (story) {
        setStoryId(story.id);
        setStoryTitle(story.title || '');
        setStorySubtitle(story.subtitle || '');
        setHeroMedia({
          url: story.hero_media_url || '',
          type: story.hero_media_type || 'image',
        });
        setSections(json?.sections || []);
      }
    } catch (error: any) {
      console.error('Failed to load story editor data:', error);
    }
  };

  const getDefaultDataForType = (type: string) => {
    switch (type) {
      case 'text':
        return { title: '', content: '' };
      case 'quote':
        return { quote: '', author: '', role: '', photoUrl: '' };
      case 'sidebyside':
        return { title: '', content: '', mediaUrl: '', mediaType: 'image', mediaPosition: 'right' };
      case 'video':
        return { title: '', videoUrl: '', caption: '' };
      case 'fullbleed':
        return { imageUrl: '', alt: '', caption: '' };
      case 'gallery':
        return { title: '', images: [] };
      case 'timeline':
        return { title: '', events: [] };
      case 'parallax':
        return { imageUrl: '', text: '', subtitle: '' };
      default:
        return {};
    }
  };

  const addSection = (type: string) => {
    const newSection: Section = {
      id: `new-${Date.now()}`,
      type: type as any,
      order: sections.length,
      data: getDefaultDataForType(type),
    };
    setSections([...sections, newSection]);
    setEditingSection(newSection.id);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    newSections.forEach((s, i) => s.order = i);
    setSections(newSections);
  };

  const deleteSection = (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      setSections(sections.filter(s => s.id !== id));
      if (editingSection === id) {
        setEditingSection(null);
      }
    }
  };

  const updateSection = (id: string, data: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, data } : s));
  };

  const handleSave = async () => {
    if (!storyTitle) {
      alert('Please enter a story title');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/story-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectSlug: params.slug,
          title: storyTitle,
          subtitle: storySubtitle,
          heroMedia,
          sections,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save story');

      if (json?.storyId) setStoryId(json.storyId);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert('Story saved successfully!');
    } catch (error: any) {
      console.error('Save error:', error);
      alert('Failed to save story: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerateModalOpen(true);
    setStorytellersLoading(true);
    try {
      const res = await fetch('/api/storytellers');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load storytellers');
      const list = (json?.data || []) as any[];
      setStorytellers(list);
      const elders = list.filter((p) => p.is_elder).slice(0, 12);
      const defaultSelection: Record<string, boolean> = {};
      elders.forEach((p) => (defaultSelection[p.id] = true));
      setSelectedStorytellerIds(defaultSelection);
    } catch (e: any) {
      console.error('Failed to load storytellers:', e);
      alert('Failed to load storytellers: ' + (e?.message || 'Unknown error'));
      setGenerateModalOpen(false);
    } finally {
      setStorytellersLoading(false);
    }
  };

  const applyGenerated = (json: any) => {
    if (typeof json?.storyTitle === 'string') setStoryTitle(json.storyTitle);
    if (typeof json?.storySubtitle === 'string') setStorySubtitle(json.storySubtitle);
    if (json?.heroMedia?.url) setHeroMedia({ url: json.heroMedia.url, type: json.heroMedia.type === 'video' ? 'video' : 'image' });
    if (Array.isArray(json?.sections)) {
      setSections(json.sections);
      setEditingSection(json.sections[0]?.id || null);
    }
  };

  const runGenerateQuick = async () => {
    const ok = confirm('Generate a draft from this project’s description, media, and updates? This will replace your current sections.');
    if (!ok) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/story-builder/generate?projectSlug=${encodeURIComponent(params.slug)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate story');
      applyGenerated(json);
      setGenerateModalOpen(false);
    } catch (error: any) {
      console.error('Generate error:', error);
      alert('Failed to generate story: ' + (error?.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const runGenerateFromElders = async () => {
    const ids = Object.entries(selectedStorytellerIds).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) {
      alert('Select at least one storyteller');
      return;
    }
    const ok = confirm('Generate a draft using selected Elders’ transcripts/quotes (plus tagged media)? This will replace your current sections.');
    if (!ok) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/story-builder/generate-from-interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug: params.slug, storytellerIds: ids }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to generate story');
      applyGenerated(json);
      setGenerateModalOpen(false);
    } catch (error: any) {
      console.error('Generate error:', error);
      alert('Failed to generate story: ' + (error?.message || 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!storyId) {
      alert('Please save your story first before previewing');
      return;
    }
    const slug = `${params.slug}-story`;
    window.open(`/immersive-stories/${slug}`, '_blank');
  };

  const getSectionIcon = (type: string) => {
    const sectionType = sectionTypes.find(st => st.type === type);
    return sectionType ? sectionType.icon : Type;
  };

  const getSectionColor = (type: string) => {
    const sectionType = sectionTypes.find(st => st.type === type);
    return sectionType ? sectionType.color : 'gray';
  };

	  const renderSectionEditor = (section: Section) => {
	    const props = {
	      data: section.data,
	      onChange: (newData: any) => updateSection(section.id, newData),
	      projectSlug: params.slug,
	    };

    switch (section.type) {
      case 'text':
        return <TextSectionEditor {...props} />;
      case 'quote':
        return <QuoteSectionEditor {...props} />;
      case 'sidebyside':
        return <SideBySideSectionEditor {...props} />;
      case 'video':
        return <VideoSectionEditor {...props} />;
      case 'fullbleed':
        return <FullBleedImageEditor {...props} />;
      case 'gallery':
        return <GallerySectionEditor {...props} />;
      case 'timeline':
        return <TimelineSectionEditor {...props} />;
      case 'parallax':
        return <ParallaxSectionEditor {...props} />;
      default:
        return <div>Unknown section type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <Link
          href={`/picc/projects/${params.slug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {projectName || 'Project'}</span>
        </Link>

        <div className="bg-gradient-to-r from-picc-red via-picc-ochre to-picc-red rounded-xl shadow-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Story Builder</h1>
              </div>
              <p className="text-white/90 text-lg">
                Build your immersive story visually - add sections, upload media, and preview in real-time
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Auto-generate</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Story</span>
                  </>
                )}
              </button>
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-all"
              >
                <Eye className="w-5 h-5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {generateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900">Auto-generate Story</div>
                  <div className="text-xs text-gray-600">Start with a draft, then refine in the editor.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-56px)] space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    disabled={generating}
                    onClick={runGenerateQuick}
                    className="p-4 border border-gray-200 rounded-xl hover:border-picc-red-300 hover:bg-warm-50 text-left transition-colors disabled:opacity-50"
                  >
                    <div className="font-bold text-gray-900 mb-1">Quick draft</div>
                    <div className="text-sm text-gray-600">Uses project description, tagged media, and project updates timeline.</div>
                  </button>

                  <button
                    type="button"
                    disabled={generating}
                    onClick={runGenerateFromElders}
                    className="p-4 border border-gray-200 rounded-xl hover:border-picc-ochre-300 hover:bg-warm-100 text-left transition-colors disabled:opacity-50"
                  >
                    <div className="font-bold text-gray-900 mb-1">Draft from Elders’ transcripts</div>
                    <div className="text-sm text-gray-600">Adds quotes with portraits from selected storytellers + trip media.</div>
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-gray-900">Select storytellers</div>
                    {storytellersLoading && <div className="text-sm text-gray-600">Loading…</div>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {storytellers.map((p) => (
                      <label key={p.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={!!selectedStorytellerIds[p.id]}
                          onChange={(e) => setSelectedStorytellerIds((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                        />
                        {p.profile_image_url ? (
                          <img src={p.profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {p.preferred_name || p.full_name}
                          </div>
                          <div className="text-xs text-gray-600">{p.is_elder ? 'Elder' : 'Storyteller'}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Story Settings & Add Section */}
          <div className="space-y-6">
            {/* Story Settings */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Story Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="Our Stories, Our Camera"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={storySubtitle}
                    onChange={(e) => setStorySubtitle(e.target.value)}
                    placeholder="How Palm Island built a photography studio"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-picc-red focus:border-transparent"
                  />
                </div>

                <MediaUpload
                  label="Hero Media"
                  accept="both"
                  currentUrl={heroMedia.url}
                  projectSlug={params.slug}
                  usageContext="immersive_story"
                  onUpload={(url, type) => setHeroMedia({ url, type })}
                />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Add Section</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sectionTypes.map((st) => {
                    const Icon = st.icon;
                    return (
                      <button
                        key={st.type}
                        onClick={() => addSection(st.type)}
                        className="p-3 border border-gray-200 hover:border-picc-red-300 hover:bg-warm-50 rounded-lg transition-colors text-left group"
                      >
                        <Icon className="w-4 h-4 text-gray-600 group-hover:text-picc-red mb-1" />
                        <div className="text-xs font-semibold text-gray-900">{st.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Section List */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Story Sections ({sections.length})
                </h2>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No sections yet</p>
                  <p className="text-sm text-gray-500">
                    Click a section type on the left to add your first section
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, index) => {
                    const Icon = getSectionIcon(section.type);
                    const color = getSectionColor(section.type);
                    const isEditing = editingSection === section.id;

                    return (
                      <div
                        key={section.id}
                        className={`border rounded-lg transition-colors ${
                          isEditing
                            ? 'border-picc-red-300 bg-warm-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center gap-3 flex-1 cursor-pointer"
                              onClick={() => setEditingSection(isEditing ? null : section.id)}
                            >
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                              <div className={`p-2 bg-${color}-100 rounded-lg`}>
                                <Icon className={`w-4 h-4 text-${color}-600`} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {section.data.title || section.data.quote?.substring(0, 30) || sectionTypes.find(st => st.type === section.type)?.label}
                                  {section.data.quote && section.data.quote.length > 30 && '...'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Section {index + 1}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => moveSection(index, 'up')}
                                disabled={index === 0}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <MoveUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => moveSection(index, 'down')}
                                disabled={index === sections.length - 1}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <MoveDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteSection(section.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Section Editor */}
          <div>
            {editingSection ? (
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Section
                  </h2>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {sections.find(s => s.id === editingSection) &&
                  renderSectionEditor(sections.find(s => s.id === editingSection)!)}
              </div>
            ) : (
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                <div className="text-gray-400 mb-3">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-gray-600">
                  Click a section to edit its content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
