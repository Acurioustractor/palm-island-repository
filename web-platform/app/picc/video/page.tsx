'use client'

import React, { useState } from 'react'
import { Player } from '@remotion/player'
import { ImpactSummary } from '@/lib/video/compositions/ImpactSummary'
import type { ImpactSummaryProps } from '@/lib/video/compositions/ImpactSummary'
import { VIDEO } from '@/lib/video/theme'
import {
  Play, Film, Sparkles, Clock, Monitor,
  ChevronRight, Settings2,
} from 'lucide-react'
import { assetUrl } from '@/lib/media/asset-url'

// ── Shared assets ────────────────────────────────────
const LOGO = '/logo/picc-logo-full.png'

const HERO = {
  sunset: assetUrl('/hero-assets/stills/palm-sunset-pier.jpg'),
  waterfall: assetUrl('/hero-assets/stills/waterfall-landscape.jpg'),
  kids: assetUrl('/hero-assets/stills/kids-beach-palm.jpg'),
  gathering: assetUrl('/hero-assets/stills/memorial-gathering.jpg'),
  youth: assetUrl('/hero-assets/stills/centre-youth-landscaping.jpg'),
  pier: assetUrl('/hero-assets/stills/pier-turquoise.jpg'),
  playground: assetUrl('/hero-assets/stills/daycare-playground.jpg'),
  mountain: assetUrl('/hero-assets/stills/mountain-valley.jpg'),
  palmSunset: assetUrl('/hero-assets/stills/palm-sunset-palms.jpg'),
  sweeping: assetUrl('/hero-assets/stills/youth-sweeping-centre.jpg'),
  youthTeam: assetUrl('/hero-assets/stills/youth-team-photo.jpg'),
  dinner: assetUrl('/hero-assets/stills/group-dinner.jpg'),
  aerial: assetUrl('/hero-assets/stills/jetty-aerial.jpg'),
}

// ── Video presets ────────────────────────────────────
const PRESETS: Array<{
  id: string
  label: string
  description: string
  props: ImpactSummaryProps
  duration: number // seconds
}> = [
  {
    id: 'impact-2024',
    label: 'Impact Summary 2024-25',
    description: 'Full impact video — stats, photos, community voice. 60 seconds.',
    duration: 60,
    props: {
      title: 'Impact Summary',
      subtitle: 'Making Palm Island a safer, stronger and more prosperous place to live.',
      year: '2024-25',
      orgName: 'Palm Island Community Company',
      logoUrl: LOGO,
      photos: [
        HERO.sunset,
        HERO.waterfall,
        HERO.pier,
        HERO.kids,
        HERO.gathering,
        HERO.youth,
        HERO.playground,
        HERO.mountain,
      ],
      stats: [
        { label: 'Community Members Served', value: '2,847' },
        { label: 'Programs Delivered', value: '8' },
        { label: 'Staff Employed', value: '197' },
        { label: 'Stories Captured', value: '340+' },
      ],
      quote: {
        text: 'This place has given my family hope again. The kids are going to school, and I feel supported.',
        author: 'Community Member',
      },
    },
  },
  {
    id: 'youth-highlight',
    label: 'Youth Programs Highlight',
    description: 'Youth-focused video with program stats and community voices. 60 seconds.',
    duration: 60,
    props: {
      title: 'Youth Programs',
      subtitle: 'Investing in the next generation of Palm Island leaders.',
      year: '2024-25',
      orgName: 'Palm Island Community Company',
      logoUrl: LOGO,
      photos: [
        HERO.kids,
        HERO.youth,
        HERO.sweeping,
        HERO.youthTeam,
        HERO.playground,
        HERO.pier,
        HERO.mountain,
      ],
      stats: [
        { label: 'Young People Engaged', value: '412' },
        { label: 'Youth Programs', value: '3' },
        { label: 'School Attendance Up', value: '18%' },
        { label: 'Youth Mentors', value: '24' },
      ],
      quote: {
        text: 'The youth program gave me something to work towards. Now I want to help other kids the way they helped me.',
        author: 'Youth Program Participant',
      },
    },
  },
  {
    id: 'services-overview',
    label: 'Services Overview',
    description: 'All eight service areas showcased with community photos. 60 seconds.',
    duration: 60,
    props: {
      title: 'Our Services',
      subtitle: 'Eight programs delivering for community, run by community.',
      year: '2024-25',
      orgName: 'Palm Island Community Company',
      logoUrl: LOGO,
      photos: [
        HERO.gathering,
        HERO.aerial,
        HERO.dinner,
        HERO.playground,
        HERO.youth,
        HERO.sunset,
        HERO.waterfall,
        HERO.pier,
      ],
      stats: [
        { label: 'Health Consultations', value: '4,200+' },
        { label: 'Families Supported', value: '380' },
        { label: 'Justice Clients', value: '156' },
        { label: 'Digital Connections', value: '1,100+' },
      ],
      quote: {
        text: 'Having all these services run by our own people, on our own island — that is self-determination in action.',
        author: 'Board Member',
      },
    },
  },
  {
    id: 'community-voices',
    label: 'Community Voices',
    description: 'Stories and feedback from the people we serve. 60 seconds.',
    duration: 60,
    props: {
      title: 'Community Voices',
      subtitle: 'What our community is telling us — in their own words.',
      year: '2024-25',
      orgName: 'Palm Island Community Company',
      logoUrl: LOGO,
      photos: [
        HERO.gathering,
        HERO.sunset,
        HERO.kids,
        HERO.dinner,
        HERO.playground,
        HERO.mountain,
        HERO.waterfall,
      ],
      stats: [
        { label: 'Stories Shared', value: '340+' },
        { label: 'Feedback Received', value: '89' },
        { label: 'Visions Captured', value: '56' },
        { label: 'Community Reach', value: '78%' },
      ],
      quote: {
        text: 'When someone really listens to what you need — not what they think you need — everything changes. PICC listens.',
        author: 'Community Elder',
      },
    },
  },
]

export default function VideoPage() {
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0])

  const durationInFrames = selectedPreset.duration * VIDEO.fps

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-amber-500" />
            <h1 className="text-lg font-semibold">Video Studio</h1>
          </div>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
            Preview Mode
          </span>
          <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Monitor className="h-3.5 w-3.5" />
              1920 x 1080
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {selectedPreset.duration}s
            </span>
            <span className="flex items-center gap-1">
              <Settings2 className="h-3.5 w-3.5" />
              {VIDEO.fps} fps
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar — Preset Selection */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Compositions
            </h2>
            {PRESETS.map((preset) => {
              const isActive = selectedPreset.id === preset.id
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Play
                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-amber-500' : 'text-gray-600'
                      }`}
                    />
                    <div>
                      <div className={`font-medium text-sm ${isActive ? 'text-amber-400' : 'text-gray-300'}`}>
                        {preset.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {preset.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}

            {/* Divider */}
            <div className="border-t border-gray-800 my-4" />

            {/* Future: AI Generation teaser */}
            <div className="p-4 rounded-xl border border-dashed border-gray-700 bg-gray-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-400">AI Video Creator</span>
              </div>
              <p className="text-xs text-gray-600">
                Describe a video and let AI compose it from your community data. Coming in Option C.
              </p>
            </div>

            {/* Export teaser */}
            <div className="p-4 rounded-xl border border-dashed border-gray-700 bg-gray-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Film className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-400">MP4 Export</span>
              </div>
              <p className="text-xs text-gray-600">
                Render to MP4 via AWS Lambda. Coming in Option B.
              </p>
            </div>
          </div>

          {/* Main — Video Player */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-black/50">
              <div style={{ aspectRatio: '16/9' }}>
                <Player
                  component={ImpactSummary as unknown as React.FC<Record<string, unknown>>}
                  inputProps={selectedPreset.props}
                  durationInFrames={durationInFrames}
                  compositionWidth={VIDEO.width}
                  compositionHeight={VIDEO.height}
                  fps={VIDEO.fps}
                  style={{ width: '100%', height: '100%' }}
                  controls
                  autoPlay={false}
                  clickToPlay
                  doubleClickToFullscreen
                  spaceKeyToPlayOrPause
                />
              </div>
            </div>

            {/* Data cards below player */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedPreset.props.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-900/80 rounded-xl p-4 border border-gray-800"
                >
                  <div className="text-2xl font-bold text-amber-400">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Quote preview */}
            {selectedPreset.props.quote && (
              <div className="mt-4 bg-gray-900/80 rounded-xl p-6 border border-gray-800">
                <p className="text-gray-300 italic text-sm leading-relaxed">
                  &ldquo;{selectedPreset.props.quote.text}&rdquo;
                </p>
                {selectedPreset.props.quote.author && (
                  <p className="text-amber-500/70 text-xs mt-2 font-medium">
                    — {selectedPreset.props.quote.author}
                  </p>
                )}
              </div>
            )}

            {/* Photo count + info */}
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
              <span>{selectedPreset.props.photos.length} photos in montage</span>
              <ChevronRight className="h-3 w-3" />
              <span>Cultural protocols apply to all video output</span>
              <ChevronRight className="h-3 w-3" />
              <span>Data source: Static preview (live Supabase in Option B)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
