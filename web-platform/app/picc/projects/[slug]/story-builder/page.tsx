'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Save, Eye, Trash2, GripVertical,
  Type, Quote, Image as ImageIcon, Video, Layout, Mountain,
  Calendar, Grid3x3, MoveUp, MoveDown, BookOpen, Upload
} from 'lucide-react';

interface Section {
  id: string;
  type: 'hero' | 'text' | 'quote' | 'sidebyside' | 'video' | 'fullbleed' | 'gallery' | 'timeline' | 'parallax';
  order: number;
  data: any;
}

export default function StoryBuilderPage({ params }: { params: { slug: string } }) {
  const [sections, setSections] = useState<Section[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [storySubtitle, setStorySubtitle] = useState('');
  const [heroMedia, setHeroMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);

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

  const addSection = (type: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: type as any,
      order: sections.length,
      data: getDefaultDataForType(type),
    };
    setSections([...sections, newSection]);
    setEditingSection(newSection.id);
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

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    newSections.forEach((s, i) => s.order = i);
    setSections(newSections);
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, data: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, data } : s));
  };

  const getSectionIcon = (type: string) => {
    const sectionType = sectionTypes.find(st => st.type === type);
    return sectionType ? sectionType.icon : Type;
  };

  const getSectionColor = (type: string) => {
    const sectionType = sectionTypes.find(st => st.type === type);
    return sectionType ? sectionType.color : 'gray';
  };

  const handleSave = async () => {
    // TODO: Save to database
    console.log('Saving story:', { storyTitle, storySubtitle, heroMedia, sections });
    alert('Story builder coming soon! For now, use the template files.');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link
          href={`/picc/projects/${params.slug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project</span>
        </Link>

        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Story Builder</h1>
          </div>
          <p className="text-white/90 text-lg">
            Build your immersive story visually - add sections, upload media, and preview in real-time
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg mb-8">
          <div className="flex items-start gap-3">
            <Upload className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Visual Builder Coming Soon!</h3>
              <p className="text-amber-800 mb-3">
                This visual story builder is in development. For now, please use the template files provided:
              </p>
              <ul className="text-sm text-amber-700 space-y-1 ml-4">
                <li>• <code className="px-2 py-1 bg-amber-100 rounded">PHOTO-STUDIO-STORY-GUIDE.md</code> - Complete guide</li>
                <li>• <code className="px-2 py-1 bg-amber-100 rounded">TEMPLATE.tsx</code> - Copy and customize</li>
                <li>• <code className="px-2 py-1 bg-amber-100 rounded">CONTENT-CHECKLIST.md</code> - Planning tool</li>
              </ul>
              <p className="text-sm text-amber-700 mt-3">
                The visual builder will include drag-and-drop media upload, live preview, and automatic code generation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview of Visual Builder UI */}
      <div className="max-w-6xl mx-auto opacity-50 pointer-events-none">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Story Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Story Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Story Title
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hero Media
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Upload hero image or video</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Choose File
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Section</h2>
              <div className="grid grid-cols-2 gap-3">
                {sectionTypes.map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.type}
                      onClick={() => addSection(st.type)}
                      className={`p-4 border-2 border-${st.color}-200 bg-${st.color}-50 hover:bg-${st.color}-100 rounded-lg transition-colors text-left`}
                    >
                      <Icon className={`w-5 h-5 text-${st.color}-600 mb-2`} />
                      <div className="text-sm font-semibold text-gray-900">{st.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Section List */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Story Sections ({sections.length})</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Story</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <Plus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No sections yet. Add your first section!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, index) => {
                    const Icon = getSectionIcon(section.type);
                    const color = getSectionColor(section.type);

                    return (
                      <div
                        key={section.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                            <div className={`p-2 bg-${color}-100 rounded-lg`}>
                              <Icon className={`w-4 h-4 text-${color}-600`} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {section.data.title || sectionTypes.find(st => st.type === section.type)?.label}
                              </div>
                              <div className="text-sm text-gray-500">Section {index + 1}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30"
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === sections.length - 1}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30"
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
