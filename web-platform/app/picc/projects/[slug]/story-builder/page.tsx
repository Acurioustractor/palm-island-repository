'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import {
  ArrowLeft, Plus, Save, Eye, Trash2, GripVertical,
  Type, Quote, Image as ImageIcon, Video, Layout, Mountain,
  Calendar, Grid3x3, MoveUp, MoveDown, BookOpen, X, Check
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
  const router = useRouter();
  const supabase = createClientSupabase();

  const [storyId, setStoryId] = useState<string | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [storySubtitle, setStorySubtitle] = useState('');
  const [heroMedia, setHeroMedia] = useState<{ url: string; type: 'image' | 'video' }>({ url: '', type: 'image' });
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projectName, setProjectName] = useState('');

  const sectionTypes = [
    { type: 'text', icon: Type, label: 'Text Section', color: 'blue' },
    { type: 'quote', icon: Quote, label: 'Quote', color: 'purple' },
    { type: 'sidebyside', icon: Layout, label: 'Side by Side', color: 'green' },
    { type: 'video', icon: Video, label: 'Video', color: 'red' },
    { type: 'fullbleed', icon: ImageIcon, label: 'Full Image', color: 'orange' },
    { type: 'gallery', icon: Grid3x3, label: 'Gallery', color: 'pink' },
    { type: 'timeline', icon: Calendar, label: 'Timeline', color: 'teal' },
    { type: 'parallax', icon: Mountain, label: 'Parallax', color: 'indigo' },
  ];

  // Load existing story if it exists
  useEffect(() => {
    loadStory();
    loadProject();
  }, [params.slug]);

  const loadProject = async () => {
    const { data } = await supabase
      .from('projects')
      .select('name')
      .eq('slug', params.slug)
      .single();

    if (data) {
      setProjectName(data.name);
    }
  };

  const loadStory = async () => {
    // First get the project ID
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!project) return;

    // Load existing story
    const { data: story } = await supabase
      .from('immersive_stories')
      .select('*')
      .eq('project_id', project.id)
      .single();

    if (story) {
      setStoryId(story.id);
      setStoryTitle(story.title || '');
      setStorySubtitle(story.subtitle || '');
      setHeroMedia({
        url: story.hero_media_url || '',
        type: story.hero_media_type || 'image',
      });

      // Load sections
      const { data: sectionsData } = await supabase
        .from('story_sections')
        .select('*')
        .eq('story_id', story.id)
        .order('section_order');

      if (sectionsData) {
        const loadedSections = await Promise.all(
          sectionsData.map(async (section: any) => {
            let data = {
              title: section.title,
              content: section.content,
              mediaUrl: section.media_url,
              mediaType: section.media_type,
              mediaPosition: section.media_position,
              caption: section.media_caption,
              alt: section.media_alt,
              quote: section.content,
              author: section.quote_author,
              role: section.quote_role,
              videoUrl: section.media_url,
              imageUrl: section.media_url,
              text: section.title,
              subtitle: section.content,
              images: [],
              events: [],
            };

            // Load timeline events if timeline section
            if (section.section_type === 'timeline') {
              const { data: events } = await supabase
                .from('story_timeline_events')
                .select('*')
                .eq('section_id', section.id)
                .order('event_order');

              data.events = events || [];
            }

            // Load gallery images if gallery section
            if (section.section_type === 'gallery') {
              const { data: images } = await supabase
                .from('story_gallery_images')
                .select('*')
                .eq('section_id', section.id)
                .order('image_order');

              data.images = images?.map((img: any) => ({
                url: img.image_url,
                alt: img.image_alt,
                caption: img.image_caption,
              })) || [];
            }

            return {
              id: section.id,
              type: section.section_type,
              order: section.section_order,
              data,
            };
          })
        );

        setSections(loadedSections);
      }
    }
  };

  const getDefaultDataForType = (type: string) => {
    switch (type) {
      case 'text':
        return { title: '', content: '' };
      case 'quote':
        return { quote: '', author: '', role: '' };
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
      // Get project ID
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', params.slug)
        .single();

      if (!project) throw new Error('Project not found');

      const { data: { user } } = await supabase.auth.getUser();

      let currentStoryId = storyId;

      // Create or update story
      if (storyId) {
        await supabase
          .from('immersive_stories')
          .update({
            title: storyTitle,
            subtitle: storySubtitle,
            hero_media_url: heroMedia.url,
            hero_media_type: heroMedia.type,
            updated_at: new Date().toISOString(),
          })
          .eq('id', storyId);
      } else {
        const slug = `${params.slug}-story`;
        const { data: newStory } = await supabase
          .from('immersive_stories')
          .insert({
            project_id: project.id,
            title: storyTitle,
            subtitle: storySubtitle,
            slug,
            hero_media_url: heroMedia.url,
            hero_media_type: heroMedia.type,
            created_by: user?.id,
          })
          .select()
          .single();

        if (newStory) {
          currentStoryId = newStory.id;
          setStoryId(newStory.id);
        }
      }

      if (!currentStoryId) throw new Error('Failed to create story');

      // Delete existing sections
      await supabase
        .from('story_sections')
        .delete()
        .eq('story_id', currentStoryId);

      // Save sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        const { data: savedSection } = await supabase
          .from('story_sections')
          .insert({
            story_id: currentStoryId,
            section_order: i,
            section_type: section.type,
            title: section.data.title || section.data.text || null,
            content: section.data.content || section.data.quote || section.data.subtitle || null,
            media_url: section.data.mediaUrl || section.data.videoUrl || section.data.imageUrl || null,
            media_type: section.data.mediaType || null,
            media_position: section.data.mediaPosition || null,
            media_caption: section.data.caption || null,
            media_alt: section.data.alt || null,
            quote_author: section.data.author || null,
            quote_role: section.data.role || null,
          })
          .select()
          .single();

        if (savedSection) {
          // Save timeline events
          if (section.type === 'timeline' && section.data.events) {
            for (let j = 0; j < section.data.events.length; j++) {
              const event = section.data.events[j];
              await supabase.from('story_timeline_events').insert({
                section_id: savedSection.id,
                event_order: j,
                event_date: event.date,
                event_title: event.title,
                event_description: event.description,
                is_complete: event.isComplete !== false,
              });
            }
          }

          // Save gallery images
          if (section.type === 'gallery' && section.data.images) {
            for (let j = 0; j < section.data.images.length; j++) {
              const image = section.data.images[j];
              if (image.url) {
                await supabase.from('story_gallery_images').insert({
                  section_id: savedSection.id,
                  image_order: j,
                  image_url: image.url,
                  image_alt: image.alt,
                  image_caption: image.caption,
                });
              }
            }
          }
        }
      }

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

  const handlePreview = () => {
    if (!storyId) {
      alert('Please save your story first before previewing');
      return;
    }
    const slug = `${params.slug}-story`;
    window.open(`/stories/${slug}`, '_blank');
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

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl p-8 text-white mb-8">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <MediaUpload
                  label="Hero Media"
                  accept="both"
                  currentUrl={heroMedia.url}
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
                        className="p-3 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg transition-colors text-left group"
                      >
                        <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600 mb-1" />
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
                            ? 'border-blue-400 bg-blue-50'
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
