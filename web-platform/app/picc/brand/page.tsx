'use client'

import { useState } from 'react'
import { Download, Copy, Check, Palette, Type, Image as ImageIcon, Grid3X3, Loader2, Video, Package } from 'lucide-react'

// ── Brand Colors (mirrored from lib/pdf/theme.ts) ──────────
const colorGroups = {
  Primary: [
    { name: 'Blue', hex: '#2563eb', token: 'blue' },
    { name: 'Blue Dark', hex: '#1e3a8a', token: 'blueDark' },
    { name: 'Blue Deep', hex: '#1e40af', token: 'blueDeep' },
    { name: 'Blue 50', hex: '#eff6ff', token: 'blue50' },
    { name: 'Blue 100', hex: '#dbeafe', token: 'blue100' },
  ],
  Accent: [
    { name: 'Purple', hex: '#9333ea', token: 'purple' },
    { name: 'Purple 50', hex: '#faf5ff', token: 'purple50' },
    { name: 'Purple 100', hex: '#f3e8ff', token: 'purple100' },
    { name: 'Purple Dark', hex: '#6b21a8', token: 'purpleDark' },
  ],
  Status: [
    { name: 'Green', hex: '#16a34a', token: 'green' },
    { name: 'Green 50', hex: '#f0fdf4', token: 'green50' },
    { name: 'Amber', hex: '#d97706', token: 'amber' },
    { name: 'Amber 50', hex: '#fffbeb', token: 'amber50' },
    { name: 'Orange', hex: '#ea580c', token: 'orange' },
    { name: 'Teal', hex: '#0f766e', token: 'teal' },
  ],
  Text: [
    { name: 'Primary', hex: '#111827', token: 'textPrimary' },
    { name: 'Secondary', hex: '#4b5563', token: 'textSecondary' },
    { name: 'Muted', hex: '#9ca3af', token: 'textMuted' },
    { name: 'Light', hex: '#d1d5db', token: 'textLight' },
  ],
  Background: [
    { name: 'White', hex: '#ffffff', token: 'white' },
    { name: 'Light', hex: '#f9fafb', token: 'bgLight' },
    { name: 'Section', hex: '#f3f4f6', token: 'bgSection' },
    { name: 'Dark', hex: '#1f2937', token: 'bgDark' },
  ],
}

const serviceColors: { name: string; category: string; hex: string }[] = [
  { name: 'Health', category: 'health', hex: '#16a34a' },
  { name: 'Family', category: 'family', hex: '#2563eb' },
  { name: 'Justice', category: 'justice', hex: '#9333ea' },
  { name: 'Crisis', category: 'crisis', hex: '#ea580c' },
  { name: 'Digital', category: 'digital', hex: '#0f766e' },
  { name: 'Economic', category: 'economic', hex: '#d97706' },
  { name: 'Children & Family', category: 'children', hex: '#ec4899' },
  { name: 'Culture', category: 'culture', hex: '#1e3a8a' },
]

const bespokeIcons = [
  'health', 'family', 'culture', 'land', 'knowledge', 'children', 'justice', 'crisis',
  'digital', 'economic', 'youth', 'aged-care', 'community', 'governance', 'housing',
  'sport', 'mental-health', 'disability', 'education', 'photo', 'video', 'audio',
  'story', 'person', 'collection', 'positive', 'inspiring', 'reflective', 'grateful',
  'hopeful', 'determined', 'proud', 'traditional-knowledge', 'public', 'community-only',
  'restricted', 'timeline', 'quote', 'vision', 'campfire', 'ocean', 'search',
]

// ── Quick-Copy Snippets for Grant Proposals ──────────
const snippets = [
  {
    title: 'Organisation Overview',
    text: 'Palm Island Community Company (PICC) is an Aboriginal and Torres Strait Islander community-controlled organisation based on Palm Island, Queensland. Established over 20 years ago, PICC delivers culturally safe programs across health, family support, justice, crisis intervention, digital services, and economic development. PICC employs over 190 staff, with approximately 95% identifying as Aboriginal and/or Torres Strait Islander, and serves the entire Palm Island community.',
  },
  {
    title: 'Key Statistics',
    text: 'PICC operates 8+ service programs, employs 190+ staff (95% Indigenous), manages an annual budget exceeding $24 million, and serves a community of approximately 3,000 residents on Palm Island. PICC holds CATSI Act compliance and ORIC registration.',
  },
  {
    title: 'Service Delivery Statement',
    text: 'PICC provides holistic, culturally appropriate services that address the needs of the Palm Island community. Our service model integrates health and wellbeing, family support, child protection, justice services, crisis intervention, digital inclusion, and economic development \u2014 all delivered by local community members who understand the unique context of Palm Island.',
  },
]

// ── Video Library (static fallback until external_videos table is populated) ──────────
const FALLBACK_VIDEOS = [
  { title: 'Palm Island - Our Story', url: 'https://www.youtube.com/watch?v=placeholder', description: 'Overview of Palm Island and PICC' },
  { title: 'PICC 20 Year Journey', url: '/video/road-to-20-years-poster.jpg', description: 'Celebrating 20 years of community service' },
]

function SnippetCard({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{text}</p>
      </div>
      <button
        onClick={copyText}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        title={`Copy "${title}" to clipboard`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600">Copy</span>
          </>
        )}
      </button>
    </div>
  )
}

function VideoCard({ title, url, description }: { title: string; url: string; description: string }) {
  const [copied, setCopied] = useState(false)

  const copyEmbed = () => {
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
    const embedCode = isYouTube
      ? `<iframe width="560" height="315" src="${url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe>`
      : `<video src="${url}" controls width="560"></video>`
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <Video className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline truncate"
        >
          {url}
        </a>
        <button
          onClick={copyEmbed}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-600">Copy Embed Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function ColorSwatch({ name, hex, token }: { name: string; hex: string; token: string }) {
  const [copied, setCopied] = useState(false)
  const isLight = ['#ffffff', '#f9fafb', '#f3f4f6', '#eff6ff', '#dbeafe', '#faf5ff', '#f3e8ff', '#f0fdf4', '#fffbeb', '#d1d5db'].includes(hex)

  const copyHex = () => {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copyHex}
      className="group flex flex-col items-start gap-2 text-left"
      title={`Click to copy ${hex}`}
    >
      <div
        className={`w-full aspect-square rounded-xl transition-transform group-hover:scale-105 ${isLight ? 'border border-gray-200' : ''}`}
        style={{ backgroundColor: hex }}
      />
      <div className="w-full">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <div className="flex items-center gap-1">
          <code className="text-xs text-gray-500">{hex}</code>
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
        <p className="text-[10px] text-gray-400 font-mono">C.{token}</p>
      </div>
    </button>
  )
}

export default function BrandHubPage() {
  const [pdfLoading, setPdfLoading] = useState(false)

  const downloadBrandPdf = async () => {
    setPdfLoading(true)
    try {
      const res = await fetch('/api/pdf/generate?type=brand-guide')
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'PICC-Brand-Guide.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Brand PDF download failed:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Brand Hub</h1>
          </div>
          <p className="text-gray-500 text-lg">PICC brand assets, colors, typography, and icons</p>
        </div>
        <button
          onClick={downloadBrandPdf}
          disabled={pdfLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Brand Guide PDF
        </button>
      </div>

      {/* Logo */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Logo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Light background */}
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-4">
            <img src="/logo/picc-logo-full.png" alt="PICC Logo" className="h-24 w-auto object-contain" />
            <p className="text-xs text-gray-400">On light background</p>
            <a
              href="/logo/picc-logo-full.png"
              download="picc-logo-full.png"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3 h-3" /> Download PNG
            </a>
          </div>
          {/* Dark background */}
          <div className="bg-gray-900 rounded-xl p-8 flex flex-col items-center gap-4">
            <img src="/logo/picc-logo-full.png" alt="PICC Logo" className="h-24 w-auto object-contain" />
            <p className="text-xs text-gray-400">On dark background</p>
          </div>
          {/* Small size */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-4 justify-center">
            <img src="/logo/picc-logo-full.png" alt="PICC Logo" className="h-10 w-auto object-contain" />
            <p className="text-xs text-gray-400">Minimum size (40px height)</p>
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Colors</h2>
        </div>
        <p className="text-sm text-gray-500 mb-8">Click any swatch to copy its hex code. Tokens reference <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">C.tokenName</code> from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">lib/pdf/theme.ts</code></p>

        {Object.entries(colorGroups).map(([group, colors]) => (
          <div key={group} className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">{group}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {colors.map(c => <ColorSwatch key={c.token} {...c} />)}
            </div>
          </div>
        ))}
      </section>

      {/* Service Category Colors */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Service Category Colors</h2>
        <p className="text-sm text-gray-500 mb-6">Each PICC service category has a designated color for consistency across reports and UI.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {serviceColors.map(sc => (
            <div key={sc.category} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: sc.hex }} />
              <div>
                <p className="text-sm font-medium text-gray-900">{sc.name}</p>
                <code className="text-xs text-gray-400">{sc.hex}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Type className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Typography</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Display Font</h3>
            <p className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Caveat, cursive' }}>
              Caveat Bold
            </p>
            <p className="text-2xl text-gray-700 mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
              Used for headings, hero text, and display numbers
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p>H1: 32pt Caveat Bold — main titles</p>
              <p>H2: 24pt Caveat Bold — section headings</p>
              <p>Stat values: 32pt Caveat Bold — dashboard numbers</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Body Font</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">Inter Bold</p>
            <p className="text-lg font-semibold text-gray-700 mb-1">Inter SemiBold</p>
            <p className="text-base text-gray-600 mb-4">Inter Regular — used for body copy, descriptions, and UI text</p>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
              <p>H3: 14pt Inter Bold — sub-headings</p>
              <p>H4: 11pt Inter Bold — labels</p>
              <p>Body: 9.5pt Inter Regular — paragraph text</p>
              <p>Small: 8.5pt Inter Regular — captions, metadata</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bespoke Icons */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Grid3X3 className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Bespoke Icons</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">{bespokeIcons.length} custom icons in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">public/icons/bespoke/</code></p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
          {bespokeIcons.map(icon => (
            <a
              key={icon}
              href={`/icons/bespoke/${icon}.png`}
              download={`${icon}.png`}
              className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              title={`Download ${icon}.png`}
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={`/icons/bespoke/${icon}.png`}
                  alt={icon}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-[10px] text-gray-500 text-center truncate w-full">{icon}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Themed Reports */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Focused Reports</h2>
        <p className="text-sm text-gray-500 mb-6">Generate themed PDF reports focused on a specific service, project, or theme. These can also be generated from individual service and project admin pages.</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-600">
            Visit any <a href="/picc/services" className="text-blue-600 hover:underline">Service</a> or{' '}
            <a href="/picc/innovation" className="text-blue-600 hover:underline">Innovation Project</a> admin page
            and click the &quot;Generate Report&quot; button to create a focused PDF report.
          </p>
        </div>
      </section>

      {/* Quick-Copy Snippets for Grant Proposals */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Copy className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Quick-Copy Snippets</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Ready-to-use text blocks for grant proposals, funding applications, and presentations. Click to copy.</p>
        <div className="space-y-4">
          {snippets.map(snippet => (
            <SnippetCard key={snippet.title} {...snippet} />
          ))}
        </div>
      </section>

      {/* Video Library */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Video className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Video Library</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">PICC videos available for embedding in presentations and proposals.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FALLBACK_VIDEOS.map(video => (
            <VideoCard key={video.title} {...video} />
          ))}
        </div>
      </section>

      {/* Asset Downloads */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Asset Downloads</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Download brand assets for presentations, proposals, and marketing materials.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Logo Pack */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Logo Pack</h3>
                <p className="text-xs text-gray-500">Full-size logo files</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Download individual logo files from the Logo section above, or use the direct link below.</p>
            <a
              href="/logo/picc-logo-full.png"
              download="picc-logo-full.png"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              Download Logo PNG
            </a>
          </div>

          {/* Service Icons Pack */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Service Icons</h3>
                <p className="text-xs text-gray-500">{bespokeIcons.length} bespoke icons</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Download individual icons from the Bespoke Icons section above. All icons are in PNG format.</p>
            <a
              href="/icons/bespoke/community.png"
              download="community.png"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors justify-center"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample Icon
            </a>
          </div>

          {/* Brand Guide PDF */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Brand Guide PDF</h3>
                <p className="text-xs text-gray-500">Complete brand reference</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Full brand guide with colors, typography, logo usage rules, and design principles.</p>
            <button
              onClick={downloadBrandPdf}
              disabled={pdfLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors justify-center disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Generate Brand Guide PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
