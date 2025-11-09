'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  FileText, Copy, Check, Download, Instagram, Facebook,
  Linkedin, Twitter, Image as ImageIcon, Mail, Sparkles
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  story_category: string;
  created_at: string;
  storyteller_id?: string;
}

export default function ContentStudioPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const supabase = createClient();

    // Simplified query without join - just get the stories
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, summary, content, story_category, created_at, storyteller_id')
      .eq('status', 'published')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading stories:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setStories(data as any);
    }
    setLoading(false);
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

  const getStorytellerName = (story: Story) => {
    // For now, all stories show as Community Voice
    // Could enhance this later to fetch storyteller names
    return 'Community Voice';
  };

  // Export formats
  const generateInstagramCaption = (story: Story) => {
    const storyteller = getStorytellerName(story);
    const excerpt = story.summary || story.content?.slice(0, 200) + '...';

    return `✨ ${story.title}

${excerpt}

Shared by: ${storyteller}

Read the full story on our website 🔗 (link in bio)

#PalmIsland #CommunityStories #IndigenousVoices #Empowerment #CommunityLed #FirstNations`;
  };

  const generateFacebookPost = (story: Story) => {
    const storyteller = getStorytellerName(story);
    const excerpt = story.summary || story.content?.slice(0, 300) + '...';

    return `${story.title}

${excerpt}

This story was shared by ${storyteller} as part of our community-controlled storytelling platform.

👉 Read the full story: [INSERT LINK]

#PalmIslandCommunity #IndigenousStories #CommunityVoices`;
  };

  const generateLinkedInPost = (story: Story) => {
    const storyteller = getStorytellerName(story);
    const excerpt = story.summary || story.content?.slice(0, 400) + '...';

    return `${story.title}

${excerpt}

This powerful story comes from ${storyteller}, highlighting the incredible work happening in Palm Island Community through community-controlled storytelling and data sovereignty.

Our platform enables community members to share their stories on their own terms, maintaining full control over their narratives and data.

Read more: [INSERT LINK]

#CommunityEmpowerment #DataSovereignty #IndigenousLeadership #SocialImpact`;
  };

  const generateTwitterThread = (story: Story) => {
    const storyteller = getStorytellerName(story);
    const excerpt = story.content?.slice(0, 200) || story.summary?.slice(0, 200) || '';

    return `🧵 ${story.title}

1/ ${excerpt}${excerpt.length >= 200 ? '...' : ''}

2/ Shared by ${storyteller} through our community-controlled platform, ensuring Palm Island stories are told with full data sovereignty.

3/ Read the full story: [INSERT LINK]

#PalmIsland #IndigenousVoices`;
  };

  const generateEmailNewsletter = (story: Story) => {
    const storyteller = getStorytellerName(story);
    const excerpt = story.summary || story.content?.slice(0, 300) + '...';

    return `📖 Featured Story: ${story.title}

${excerpt}

This story was shared by ${storyteller}.

[Read Full Story Button → INSERT LINK]

---

Palm Island Community Repository
Community-controlled storytelling | Data sovereignty | Empowerment`;
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
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Content Studio</h1>
        </div>
        <p className="text-gray-600">
          Export stories to social media, create shareable content, and amplify community voices
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
                      {getStorytellerName(story)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Export Formats */}
        <div className="lg:col-span-2">
          {!selectedStory ? (
            <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Select a Story</h3>
              <p className="text-gray-500">
                Choose a story from the list to see export options
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
                  By {getStorytellerName(selectedStory)}
                </p>
                {selectedStory.summary && (
                  <p className="text-gray-700">{selectedStory.summary}</p>
                )}
              </div>

              {/* Export Options */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Instagram */}
                <ExportCard
                  icon={<Instagram className="w-5 h-5" />}
                  title="Instagram Caption"
                  color="pink"
                  content={generateInstagramCaption(selectedStory)}
                  onCopy={() => copyToClipboard(generateInstagramCaption(selectedStory), 'instagram')}
                  copied={copiedFormat === 'instagram'}
                />

                {/* Facebook */}
                <ExportCard
                  icon={<Facebook className="w-5 h-5" />}
                  title="Facebook Post"
                  color="blue"
                  content={generateFacebookPost(selectedStory)}
                  onCopy={() => copyToClipboard(generateFacebookPost(selectedStory), 'facebook')}
                  copied={copiedFormat === 'facebook'}
                />

                {/* LinkedIn */}
                <ExportCard
                  icon={<Linkedin className="w-5 h-5" />}
                  title="LinkedIn Post"
                  color="sky"
                  content={generateLinkedInPost(selectedStory)}
                  onCopy={() => copyToClipboard(generateLinkedInPost(selectedStory), 'linkedin')}
                  copied={copiedFormat === 'linkedin'}
                />

                {/* Twitter */}
                <ExportCard
                  icon={<Twitter className="w-5 h-5" />}
                  title="Twitter Thread"
                  color="blue"
                  content={generateTwitterThread(selectedStory)}
                  onCopy={() => copyToClipboard(generateTwitterThread(selectedStory), 'twitter')}
                  copied={copiedFormat === 'twitter'}
                />

                {/* Email Newsletter */}
                <ExportCard
                  icon={<Mail className="w-5 h-5" />}
                  title="Email Newsletter"
                  color="purple"
                  content={generateEmailNewsletter(selectedStory)}
                  onCopy={() => copyToClipboard(generateEmailNewsletter(selectedStory), 'email')}
                  copied={copiedFormat === 'email'}
                />

                {/* Quote Card - Coming Soon */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <ImageIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">Quote Card Generator</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Create shareable quote images
                  </p>
                  <div className="text-xs text-gray-500 font-medium">
                    Coming soon...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ExportCardProps {
  icon: React.ReactNode;
  title: string;
  color: 'pink' | 'blue' | 'sky' | 'purple';
  content: string;
  onCopy: () => void;
  copied: boolean;
}

function ExportCard({ icon, title, color, content, onCopy, copied }: ExportCardProps) {
  const colorClasses = {
    pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    sky: 'bg-sky-100 text-sky-700 hover:bg-sky-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className={`${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold">{title}</h3>
          </div>
          <button
            onClick={onCopy}
            className="p-2 bg-white rounded-md hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto bg-gray-50 rounded p-3">
          {content}
        </div>
      </div>
    </div>
  );
}
