'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Image as ImageIcon, Download, ArrowLeft, Palette, Type } from 'lucide-react';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  content: string;
  storyteller_id: string;
}

interface Profile {
  id: string;
  full_name: string;
}

export default function QuoteCardsPage() {
  const supabase = createClientComponentClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [quoteText, setQuoteText] = useState('');
  const [attribution, setAttribution] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1e40af');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(48);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStory) {
      const story = stories.find(s => s.id === selectedStory);
      if (story) {
        const profile = profiles[story.storyteller_id];
        setAttribution(profile?.full_name || 'Palm Island Community');
      }
    }
  }, [selectedStory, stories, profiles]);

  useEffect(() => {
    drawCard();
  }, [quoteText, attribution, backgroundColor, textColor, fontSize]);

  const loadData = async () => {
    const { data: storiesData } = await supabase
      .from('stories')
      .select('id, title, content, storyteller_id')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);

    if (storiesData) {
      setStories(storiesData);

      // Load profiles
      const storytellerIds = [...new Set(storiesData.map(s => s.storyteller_id).filter(Boolean))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', storytellerIds);

      if (profilesData) {
        const profilesMap: { [key: string]: Profile } = {};
        profilesData.forEach(p => {
          profilesMap[p.id] = p;
        });
        setProfiles(profilesMap);
      }
    }
  };

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 1200;

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Quote text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap
    const maxWidth = canvas.width - 120;
    const words = quoteText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    // Draw quote text
    const lineHeight = fontSize * 1.3;
    const totalHeight = lines.length * lineHeight;
    let y = (canvas.height - totalHeight) / 2;

    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, y);
      y += lineHeight;
    });

    // Attribution
    if (attribution) {
      ctx.font = `italic ${fontSize * 0.5}px Inter, sans-serif`;
      ctx.fillText(`— ${attribution}`, canvas.width / 2, canvas.height - 150);
    }

    // Logo/Branding
    ctx.font = `600 ${fontSize * 0.4}px Inter, sans-serif`;
    ctx.fillStyle = textColor + '80'; // 50% opacity
    ctx.fillText('Palm Island Community Company', canvas.width / 2, canvas.height - 80);
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `quote-card-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const colorPresets = [
    { name: 'Ocean Blue', bg: '#1e40af', text: '#ffffff' },
    { name: 'Sunset', bg: '#dc2626', text: '#ffffff' },
    { name: 'Forest', bg: '#15803d', text: '#ffffff' },
    { name: 'Purple', bg: '#7c3aed', text: '#ffffff' },
    { name: 'Teal', bg: '#0d9488', text: '#ffffff' },
    { name: 'Dark', bg: '#1f2937', text: '#ffffff' },
    { name: 'Light', bg: '#f3f4f6', text: '#1f2937' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/picc/content-studio" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Content Studio
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="h-8 w-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">Quote Card Generator</h1>
          </div>
          <p className="text-gray-600">Create shareable quote cards for social media</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-6">
            {/* Story Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Story</h2>
              <select
                value={selectedStory}
                onChange={(e) => {
                  setSelectedStory(e.target.value);
                  const story = stories.find(s => s.id === e.target.value);
                  if (story) {
                    // Extract a good quote (first sentence or up to 150 chars)
                    const firstSentence = story.content.match(/[^.!?]+[.!?]/)?.[0] || story.content.substring(0, 150);
                    setQuoteText(firstSentence.trim());
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
              >
                <option value="">Choose a story...</option>
                {stories.map(story => (
                  <option key={story.id} value={story.id}>{story.title}</option>
                ))}
              </select>
            </div>

            {/* Quote Text */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Type className="h-5 w-5" />
                Quote Text
              </h2>
              <textarea
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                placeholder="Enter a powerful quote..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
              />
              <input
                type="text"
                value={attribution}
                onChange={(e) => setAttribution(e.target.value)}
                placeholder="Attribution (e.g., Elder Mary Smith)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Style Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Style Options
              </h2>

              {/* Color Presets */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Preset</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorPresets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setBackgroundColor(preset.bg);
                        setTextColor(preset.text);
                      }}
                      className="aspect-square rounded-lg border-2 border-gray-200 hover:border-pink-500 transition-all relative group"
                      style={{ backgroundColor: preset.bg }}
                      title={preset.name}
                    >
                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity" style={{ color: preset.text }}>
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="32"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview</h2>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={downloadCard}
                disabled={!quoteText}
                className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                Download Quote Card
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-900 font-medium mb-1">Social Media Tips</div>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Cards are 1200x1200px (perfect for Instagram)</li>
                <li>• Keep quotes short and impactful (under 30 words)</li>
                <li>• Use high contrast for readability</li>
                <li>• Always attribute quotes to storytellers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
