'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  FileText, Copy, Check, Instagram, Facebook,
  Linkedin, Twitter, Sparkles, RefreshCw, Edit2, AlertCircle
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  storyteller_id?: string;
}

interface GeneratedContent {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
}

interface GeneratingState {
  instagram: boolean;
  facebook: boolean;
  linkedin: boolean;
  twitter: boolean;
}

export default function ContentStudioPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});
  const [generating, setGenerating] = useState<GeneratingState>({
    instagram: false,
    facebook: false,
    linkedin: false,
    twitter: false
  });
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');
  const [aiProvider, setAiProvider] = useState<string>('Loading...');

  useEffect(() => {
    loadStories();
    checkAIProvider();
  }, []);

  const checkAIProvider = async () => {
    try {
      const response = await fetch('/api/ai-provider');
      const data = await response.json();
      setAiProvider(data.provider === 'ollama' ? 'Ollama (Local)' : 'Claude Sonnet 4.5 (Cloud)');
    } catch (error) {
      console.error('Error checking AI provider:', error);
      setAiProvider('Unknown');
    }
  };

  useEffect(() => {
    // Reset generated content when story changes
    if (selectedStory) {
      setGeneratedContent({});
      setEditingPlatform(null);
    }
  }, [selectedStory?.id]);

  const loadStories = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('stories')
      .select('id, title, content, created_at, storyteller_id')
      .eq('status', 'published')
      .eq('is_public', true)
      .order('created_at', { ascending: false})
      .limit(50);

    if (error) {
      console.error('Error loading stories:', error);
      alert(`Error loading stories: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data) {
      setStories(data as any);
    }
    setLoading(false);
  };

  const generateContent = async (platform: string, regenerate: boolean = false) => {
    if (!selectedStory) return;

    setGenerating(prev => ({ ...prev, [platform]: true }));

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: selectedStory,
          platform
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      setGeneratedContent(prev => ({
        ...prev,
        [platform]: data.content
      }));

      if (data.suggestion === 'skip') {
        // Show warning for fragments
        console.log('Fragment detected - showing skip recommendation');
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGenerating(prev => ({ ...prev, [platform]: false }));
    }
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard');
    }
  };

  const startEditing = (platform: string, content: string) => {
    setEditingPlatform(platform);
    setEditedContent(content);
  };

  const saveEdit = (platform: string) => {
    setGeneratedContent(prev => ({
      ...prev,
      [platform]: editedContent
    }));
    setEditingPlatform(null);
  };

  const cancelEdit = () => {
    setEditingPlatform(null);
    setEditedContent('');
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="uppercase font-bold mb-2" style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}>
          PICC admin · content studio
        </p>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <Sparkles className="w-7 h-7" style={{ color: '#C8963E' }} />
          <h1 className="font-fraunces font-bold leading-tight" style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Content studio.
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded" style={{ backgroundColor: '#C8963E22', color: '#C8963E', letterSpacing: '0.15em' }}>
            AI-powered
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded" style={{ backgroundColor: '#0B4F6C22', color: '#0B4F6C', letterSpacing: '0.15em' }}>
            {aiProvider}
          </span>
        </div>
        <p className="text-gray-600">
          Generate authentic social media content using AI trained on PICC's voice
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Story Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select a Story</h2>

            {stories.length === 0 ? (
              <p className="text-gray-500 text-sm">No published stories yet</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {stories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedStory?.id === story.id
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {story.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      Community Voice
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Generation Area */}
        <div className="lg:col-span-2">
          {!selectedStory ? (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Select a Story</h3>
              <p className="text-gray-500">
                Choose a story to generate AI-powered social media content
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Story Preview */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedStory.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  By Community Voice
                </p>
                {selectedStory.content && (
                  <p className="text-gray-700 line-clamp-3">{selectedStory.content}</p>
                )}
              </div>

              {/* Platform Generators */}
              <div className="grid md:grid-cols-2 gap-4">
                <AIExportCard
                  icon={<Instagram className="w-5 h-5" />}
                  title="Instagram"
                  platform="instagram"
                  color="picc-red"
                  content={generatedContent.instagram}
                  generating={generating.instagram}
                  onGenerate={() => generateContent('instagram')}
                  onRegenerate={() => generateContent('instagram', true)}
                  onCopy={() => copyToClipboard(generatedContent.instagram!, 'instagram')}
                  copied={copiedFormat === 'instagram'}
                  isEditing={editingPlatform === 'instagram'}
                  editedContent={editedContent}
                  onEdit={() => startEditing('instagram', generatedContent.instagram!)}
                  onSaveEdit={() => saveEdit('instagram')}
                  onCancelEdit={cancelEdit}
                  onEditChange={setEditedContent}
                />

                <AIExportCard
                  icon={<Facebook className="w-5 h-5" />}
                  title="Facebook"
                  platform="facebook"
                  color="blue"
                  content={generatedContent.facebook}
                  generating={generating.facebook}
                  onGenerate={() => generateContent('facebook')}
                  onRegenerate={() => generateContent('facebook', true)}
                  onCopy={() => copyToClipboard(generatedContent.facebook!, 'facebook')}
                  copied={copiedFormat === 'facebook'}
                  isEditing={editingPlatform === 'facebook'}
                  editedContent={editedContent}
                  onEdit={() => startEditing('facebook', generatedContent.facebook!)}
                  onSaveEdit={() => saveEdit('facebook')}
                  onCancelEdit={cancelEdit}
                  onEditChange={setEditedContent}
                />

                <AIExportCard
                  icon={<Linkedin className="w-5 h-5" />}
                  title="LinkedIn"
                  platform="linkedin"
                  color="warm"
                  content={generatedContent.linkedin}
                  generating={generating.linkedin}
                  onGenerate={() => generateContent('linkedin')}
                  onRegenerate={() => generateContent('linkedin', true)}
                  onCopy={() => copyToClipboard(generatedContent.linkedin!, 'linkedin')}
                  copied={copiedFormat === 'linkedin'}
                  isEditing={editingPlatform === 'linkedin'}
                  editedContent={editedContent}
                  onEdit={() => startEditing('linkedin', generatedContent.linkedin!)}
                  onSaveEdit={() => saveEdit('linkedin')}
                  onCancelEdit={cancelEdit}
                  onEditChange={setEditedContent}
                />

                <AIExportCard
                  icon={<Twitter className="w-5 h-5" />}
                  title="Twitter/X"
                  platform="twitter"
                  color="blue"
                  content={generatedContent.twitter}
                  generating={generating.twitter}
                  onGenerate={() => generateContent('twitter')}
                  onRegenerate={() => generateContent('twitter', true)}
                  onCopy={() => copyToClipboard(generatedContent.twitter!, 'twitter')}
                  copied={copiedFormat === 'twitter'}
                  isEditing={editingPlatform === 'twitter'}
                  editedContent={editedContent}
                  onEdit={() => startEditing('twitter', generatedContent.twitter!)}
                  onSaveEdit={() => saveEdit('twitter')}
                  onCancelEdit={cancelEdit}
                  onEditChange={setEditedContent}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AIExportCardProps {
  icon: React.ReactNode;
  title: string;
  platform: string;
  color: 'picc-red' | 'blue' | 'warm';
  content?: string;
  generating: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  copied: boolean;
  isEditing: boolean;
  editedContent: string;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (value: string) => void;
}

function AIExportCard({
  icon,
  title,
  platform,
  color,
  content,
  generating,
  onGenerate,
  onRegenerate,
  onCopy,
  copied,
  isEditing,
  editedContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onEditChange
}: AIExportCardProps) {
  const colorClasses = {
    'picc-red': 'bg-picc-red/10 text-picc-red',
    blue: 'bg-blue-100 text-blue-700',
    warm: 'bg-warm-100 text-picc-red',
  };

  const isFragment = content?.includes('[RECOMMENDATION: Skip social media');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className={`${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold">{title}</h3>
          </div>
          {content && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="p-2 bg-white rounded-md hover:bg-gray-50 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={onRegenerate}
                className="p-2 bg-white rounded-md hover:bg-gray-50 transition-colors"
                disabled={generating}
                title="Regenerate"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${generating ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onCopy}
                className="p-2 bg-white rounded-md hover:bg-gray-50 transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {!content && !generating && (
          <button
            onClick={onGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-picc-ochre to-picc-red hover:from-picc-ochre/90 hover:to-picc-red/90 text-white font-medium rounded-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </button>
        )}

        {generating && (
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-picc-ochre"></div>
            <p className="text-gray-600">AI is writing...</p>
          </div>
        )}

        {content && !generating && (
          <>
            {isFragment && (
              <div className="mb-4 p-3 bg-picc-ochre/10 border border-picc-ochre/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-picc-ochre flex-shrink-0 mt-0.5" />
                <p className="text-sm text-picc-ochre">
                  This appears to be a brief fragment. Consider skipping social media or combining with other stories.
                </p>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editedContent}
                  onChange={(e) => onEditChange(e.target.value)}
                  className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={onSaveEdit}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                {content}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
