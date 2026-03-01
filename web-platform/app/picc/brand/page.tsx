'use client'

import { useState, useEffect } from 'react'
import { Download, Copy, Check, Palette, Type, Image as ImageIcon, Grid3X3, Loader2, Video, Package, Sparkles, MessageSquareQuote, Brush, Users, Monitor, FileText } from 'lucide-react'
import { assetUrl } from '@/lib/media/asset-url'

// ═══════════════════════════════════════════════════════════════
//  DATA — Web Brand (tailwind.config.js)
// ═══════════════════════════════════════════════════════════════

const webColorGroups = {
  'Core Identity': [
    { name: 'PICC Red', hex: '#8B1A1A', token: 'picc-red' },
    { name: 'PICC Ochre', hex: '#C8922A', token: 'picc-ochre' },
    { name: 'PICC Earth', hex: '#2D2319', token: 'picc-earth' },
  ],
  'Warm Scale (sparse use)': [
    { name: 'Warm 50', hex: '#FDF8F0', token: 'warm-50' },
    { name: 'Warm 100', hex: '#FAF0E0', token: 'warm-100' },
    { name: 'Warm 200', hex: '#F2DFC0', token: 'warm-200' },
    { name: 'Warm 500', hex: '#8B7540', token: 'warm-500' },
    { name: 'Warm 800', hex: '#443A20', token: 'warm-800' },
    { name: 'Cream', hex: '#F5E6D3', token: 'cream' },
  ],
  'Accent': [
    { name: 'Sage', hex: '#5B7B5E', token: 'sage' },
  ],
  'Foundation — Gray (nav, sections)': [
    { name: 'White', hex: '#FFFFFF', token: 'white' },
    { name: 'Gray 50', hex: '#F9FAFB', token: 'gray-50' },
    { name: 'Gray 100', hex: '#F3F4F6', token: 'gray-100' },
    { name: 'Gray 500', hex: '#6B7280', token: 'gray-500' },
    { name: 'Gray 900', hex: '#111827', token: 'gray-900' },
  ],
  'Foundation — Stone (footer)': [
    { name: 'Stone 300', hex: '#D6D3D1', token: 'stone-300' },
    { name: 'Stone 500', hex: '#78716C', token: 'stone-500' },
    { name: 'Stone 900', hex: '#1C1917', token: 'stone-900' },
  ],
  'Status / Semantic': [
    { name: 'Green 100', hex: '#DCFCE7', token: 'green-100' },
    { name: 'Green 700', hex: '#15803D', token: 'green-700' },
    { name: 'Amber 100', hex: '#FEF3C7', token: 'amber-100' },
    { name: 'Amber 700', hex: '#B45309', token: 'amber-700' },
    { name: 'Blue 100', hex: '#DBEAFE', token: 'blue-100' },
    { name: 'Blue 700', hex: '#1D4ED8', token: 'blue-700' },
  ],
}

const webGradients = [
  { name: 'Hero Overlay', css: 'linear-gradient(to bottom, rgba(45,35,25,0.8), rgba(45,35,25,0.4), rgba(45,35,25,0.8))', usage: 'VideoBackground overlay — pure picc-earth at varying opacities' },
  { name: 'Hero Fallback', css: 'linear-gradient(to bottom right, #2D2319, #8B1A1A)', usage: 'Fallback when no poster image (picc-earth → picc-red)' },
  { name: 'Text Gradient', css: 'linear-gradient(to right, #D06060, #DAA84A, #D06060)', usage: 'Hero headline text (picc-red-300 → picc-ochre-300)' },
  { name: 'Dark Section', css: 'linear-gradient(to bottom right, #3A2F24, #2D2319, #8B1A1A)', usage: 'Full-bleed dark sections (timeline, CEO quote)' },
  { name: 'Impact Hero', css: 'linear-gradient(to bottom right, #111827, #2D2319, #3A2F24)', usage: 'Impact page hero (gray-900 → picc-earth)' },
]

const webComponentExamples = {
  navDefault: 'bg-white/90 backdrop-blur-md',
  navScrolled: 'backdrop-blur-xl bg-white/70 border border-white/20 (frosted-glass)',
  footerStyle: 'bg-stone-900 text-stone-300',
  ctaPrimary: 'bg-gray-900 text-white rounded-full',
  ctaOnDark: 'bg-white text-gray-900 rounded-full',
  ctaOchre: 'bg-picc-ochre text-white rounded-full',
  ctaSecondary: 'border border-gray-300 text-gray-700',
  sectionLabel: 'text-picc-red or text-picc-ochre uppercase tracking-wider',
  bodyText: 'text-gray-700 on white/gray-50 backgrounds',
}

// ═══════════════════════════════════════════════════════════════
//  DATA — PDF Brand "Saltwater & Earth" (lib/pdf/theme.ts)
// ═══════════════════════════════════════════════════════════════

const pdfColorGroups = {
  'Core Identity': [
    { name: 'Ocean', hex: '#0B4F6C', token: 'ocean' },
    { name: 'Ochre', hex: '#C8963E', token: 'ochre' },
    { name: 'Earth', hex: '#2D2319', token: 'earth' },
  ],
  Supporting: [
    { name: 'Reef', hex: '#0EA5E9', token: 'reef' },
    { name: 'Mangrove', hex: '#15803D', token: 'mangrove' },
    { name: 'Coral', hex: '#E8600A', token: 'coral' },
    { name: 'Star Gold', hex: '#F5A623', token: 'starGold' },
  ],
  Cultural: [
    { name: 'Turtle Red', hex: '#8B1A1A', token: 'turtleRed' },
    { name: 'Sand', hex: '#FEF3C7', token: 'sand' },
  ],
  Dark: [
    { name: 'Midnight', hex: '#1A1A2E', token: 'midnight' },
  ],
  Neutrals: [
    { name: 'Rock', hex: '#292524', token: 'rock' },
    { name: 'Driftwood', hex: '#6B6560', token: 'driftwood' },
    { name: 'Muted', hex: '#A39E99', token: 'muted' },
    { name: 'Shell', hex: '#F7F6F4', token: 'shell' },
    { name: 'Border', hex: '#E8E6E3', token: 'border' },
    { name: 'White', hex: '#FFFFFF', token: 'white' },
  ],
}

const serviceColors = [
  { name: 'Health', category: 'health', hex: '#15803D' },
  { name: 'Family', category: 'family', hex: '#C8963E' },
  { name: 'Justice', category: 'justice', hex: '#E8600A' },
  { name: 'Community', category: 'community', hex: '#0B4F6C' },
  { name: 'Economic', category: 'economic', hex: '#0EA5E9' },
  { name: 'Digital', category: 'digital', hex: '#F5A623' },
]

const voiceTypeColors = [
  { name: 'Elder Wisdom', hex: '#8B1A1A' },
  { name: 'Community Story', hex: '#0B4F6C' },
  { name: 'Community Vision', hex: '#15803D' },
  { name: 'Community Feedback', hex: '#0EA5E9' },
]

const pdfGradients = [
  { name: 'Hero', css: 'linear-gradient(135deg, #2D2319, #8B1A1A, #C8963E)', usage: 'Cover pages, major landing sections' },
  { name: 'Ocean', css: 'linear-gradient(135deg, #0B4F6C, #0EA5E9)', usage: 'Section labels, interactive highlights' },
  { name: 'Warm', css: 'linear-gradient(135deg, #C8963E, #F5A623)', usage: 'Celebration, milestone callouts' },
  { name: 'Subtle', css: 'linear-gradient(135deg, #FFFFFF, #FEF3C7)', usage: 'Warm page wash, community content' },
]

const motifs = [
  { name: 'Concentric Dots', description: '2–3 rings of evenly-spaced dots radiating outward. References the logo\'s dot circle motif.', usage: 'Page accents, section backgrounds, brand watermarks', preview: 'dots' },
  { name: 'Arc Dots', description: 'Curved dot trail (quarter-arc or half-arc) with diminishing dot size.', usage: 'Corner accents on pages, section transitions', preview: 'arc' },
  { name: 'Star Marker', description: '4-point SVG star. References the Kuling (Milky Way) and the Torres Strait Islander flag star.', usage: 'Bullet points, highlight markers, Elder wisdom indicators', preview: 'star' },
  { name: 'Section Divider', description: 'Horizontal row of dots that swell to the centre then diminish.', usage: 'Between major sections within a page', preview: 'divider' },
  { name: 'Corner Brackets', description: 'L-shaped brackets at corners of content areas. Frame and contain without boxing.', usage: 'Featured content, pull quotes, Elder wisdom blocks', preview: 'brackets' },
  { name: 'Constellation', description: 'Scattered dots at randomised positions. "Many tribes, one people."', usage: 'Back cover, dark-background sections only', preview: 'constellation' },
  { name: 'Gradient Bar', description: 'Small decorative bar (60–100pt wide, 3–4pt tall) using the Ocean gradient.', usage: 'Below section labels, separating titles on covers', preview: 'gradientbar' },
]

// ═══════════════════════════════════════════════════════════════
//  SHARED DATA
// ═══════════════════════════════════════════════════════════════

const brandPersonality = [
  { trait: 'Warm', means: 'Welcoming, human, community-centred', doesntMean: 'Casual, informal, unserious' },
  { trait: 'Grounded', means: 'Rooted in place, culture, and evidence', doesntMean: 'Conservative, backwards-looking' },
  { trait: 'Bold', means: 'Confident, ambitious, unapologetic', doesntMean: 'Aggressive, boastful, loud' },
  { trait: 'Innovative', means: 'Forward-thinking, creative, adaptive', doesntMean: 'Trendy, gimmicky, tech-for-tech\'s-sake' },
  { trait: 'Respectful', means: 'Culturally safe, Elder-guided, dignified', doesntMean: 'Tokenistic, performative, paternalistic' },
]

const writingPrinciples = [
  { rule: 'Community-first language', example: '"Our community" not "the community." "Palm Islanders" not "residents."' },
  { rule: 'Active voice', example: '"PICC delivered 20 programs" not "20 programs were delivered."' },
  { rule: 'Specific and evidence-based', example: 'Real numbers, real names (with permission), real outcomes.' },
  { rule: 'Respectful of knowledge systems', example: 'Elder knowledge is knowledge, not "stories" or "folklore."' },
  { rule: 'Warm but not informal', example: 'Professional enough for government, warm enough for community.' },
]

const vocabularyGuide = [
  { prefer: 'Self-determination', avoid: 'Empowerment (overused, implies power is given)' },
  { prefer: 'Community-controlled', avoid: 'Community-based (less specific)' },
  { prefer: 'First Nations, Aboriginal and Torres Strait Islander', avoid: 'Indigenous (too generic), ATSI (acronym dehumanises)' },
  { prefer: 'Elders', avoid: 'Elderly, old people' },
  { prefer: 'Country, saltwater country', avoid: 'Land, territory (too legal)' },
  { prefer: 'Community members, Palm Islanders', avoid: 'Clients, beneficiaries, target population' },
  { prefer: 'Knowledge holders', avoid: 'Informants, subjects' },
  { prefer: 'Cultural practice', avoid: 'Custom, tradition (can sound antiquated)' },
]

const bespokeIcons = [
  'health', 'family', 'culture', 'land', 'knowledge', 'children', 'justice', 'crisis',
  'digital', 'economic', 'youth', 'aged-care', 'community', 'governance', 'housing',
  'sport', 'mental-health', 'disability', 'education', 'photo', 'video', 'audio',
  'story', 'person', 'collection', 'positive', 'inspiring', 'reflective', 'grateful',
  'hopeful', 'determined', 'proud', 'traditional-knowledge', 'public', 'community-only',
  'restricted', 'timeline', 'quote', 'vision', 'campfire', 'ocean', 'search',
]

const snippets = [
  { title: 'Organisation Overview', text: 'Palm Island Community Company (PICC) is an Aboriginal and Torres Strait Islander community-controlled organisation based on Palm Island, Queensland. Established over 20 years ago, PICC delivers culturally safe programs across health, family support, justice, crisis intervention, digital services, and economic development. PICC employs over 190 staff, with approximately 95% identifying as Aboriginal and/or Torres Strait Islander, and serves the entire Palm Island community.' },
  { title: 'Key Statistics', text: 'PICC operates 8+ service programs, employs 190+ staff (95% Indigenous), manages an annual budget exceeding $24 million, and serves a community of approximately 3,000 residents on Palm Island. PICC holds CATSI Act compliance and ORIC registration.' },
  { title: 'Service Delivery Statement', text: 'PICC provides holistic, culturally appropriate services that address the needs of the Palm Island community. Our service model integrates health and wellbeing, family support, child protection, justice services, crisis intervention, digital inclusion, and economic development \u2014 all delivered by local community members who understand the unique context of Palm Island.' },
]

const FALLBACK_VIDEOS = [
  { title: 'Palm Island - Our Story', url: 'https://www.youtube.com/watch?v=placeholder', description: 'Overview of Palm Island and PICC' },
  { title: 'PICC 20 Year Journey', url: assetUrl('/video/road-to-20-years-poster.jpg'), description: 'Celebrating 20 years of community service' },
]

// ═══════════════════════════════════════════════════════════════
//  REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

function SnippetCard({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false)
  const copyText = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{text}</p>
      </div>
      <button onClick={copyText} className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" title={`Copy "${title}"`}>
        {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Copied!</span></> : <><Copy className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-600">Copy</span></>}
      </button>
    </div>
  )
}

function VideoCard({ title, url, description }: { title: string; url: string; description: string }) {
  const [copied, setCopied] = useState(false)
  const copyEmbed = () => {
    const isYT = url.includes('youtube.com') || url.includes('youtu.be')
    navigator.clipboard.writeText(isYT ? `<iframe width="560" height="315" src="${url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe>` : `<video src="${url}" controls width="560"></video>`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <Video className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
        <div className="min-w-0"><h3 className="text-sm font-semibold text-gray-900">{title}</h3><p className="text-sm text-gray-500 mt-0.5">{description}</p></div>
      </div>
      <div className="flex items-center gap-3">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:underline truncate">{url}</a>
        <button onClick={copyEmbed} className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Copied!</span></> : <><Copy className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-600">Copy Embed</span></>}
        </button>
      </div>
    </div>
  )
}

function ColorSwatch({ name, hex, token }: { name: string; hex: string; token: string }) {
  const [copied, setCopied] = useState(false)
  const lightHexes = ['#ffffff', '#F7F6F4', '#E8E6E3', '#FEF3C7', '#FFFFFF', '#FDF8F0', '#FAF0E0', '#F2DFC0', '#F9FAFB', '#F3F4F6', '#F5E6D3']
  const isLight = lightHexes.includes(hex) || hex.toLowerCase() === '#ffffff'
  const copyHex = () => { navigator.clipboard.writeText(hex); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button onClick={copyHex} className="group flex flex-col items-start gap-2 text-left" title={`Copy ${hex}`}>
      <div className={`w-full aspect-square rounded-xl transition-transform group-hover:scale-105 ${isLight ? 'border border-gray-200' : ''}`} style={{ backgroundColor: hex }} />
      <div className="w-full">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
        <div className="flex items-center gap-1">
          <code className="text-xs text-gray-500">{hex}</code>
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
        <p className="text-[10px] text-gray-400 font-mono">{token}</p>
      </div>
    </button>
  )
}

function CopyableCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button onClick={copy} className="group inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded text-xs font-mono text-gray-600 hover:bg-gray-200 transition-colors" title="Click to copy">
      <span className="truncate">{text}</span>
      {copied ? <Check className="w-3 h-3 text-green-500 flex-shrink-0" /> : <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />}
    </button>
  )
}

function MotifPreview({ type }: { type: string }) {
  switch (type) {
    case 'dots': return (<div className="relative w-20 h-20 flex items-center justify-center">{[12, 20, 28].map(r => (<div key={r} className="absolute rounded-full border border-dashed border-[#0B4F6C]/20" style={{ width: r * 2, height: r * 2 }} />))}<div className="w-2 h-2 rounded-full bg-[#0B4F6C]/40" /></div>)
    case 'arc': return (<div className="relative w-20 h-20 overflow-hidden">{[0, 1, 2].map(i => (<div key={i} className="absolute bottom-0 left-0 rounded-tr-full border-t-2 border-r-2 border-[#C8963E]/30" style={{ width: 30 + i * 16, height: 30 + i * 16 }} />))}</div>)
    case 'star': return (<div className="w-20 h-20 flex items-center justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="#F5A623"><path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" /></svg></div>)
    case 'divider': return (<div className="w-20 h-20 flex items-center justify-center gap-[3px]">{[2, 3, 4, 5, 6, 5, 4, 3, 2].map((s, i) => (<div key={i} className="rounded-full bg-[#E8E6E3]" style={{ width: s, height: s }} />))}</div>)
    case 'brackets': return (<div className="w-20 h-20 flex items-center justify-center"><div className="relative w-12 h-12"><div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#0B4F6C]/30 rounded-tl" /><div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#0B4F6C]/30 rounded-tr" /><div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#0B4F6C]/30 rounded-bl" /><div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#0B4F6C]/30 rounded-br" /></div></div>)
    case 'constellation': return (<div className="w-20 h-20 rounded-lg bg-[#1A1A2E] relative overflow-hidden">{[{x:15,y:10,s:2},{x:45,y:20,s:3},{x:70,y:15,s:2},{x:25,y:50,s:2},{x:55,y:45,s:3},{x:80,y:55,s:2},{x:10,y:75,s:2},{x:40,y:70,s:3},{x:65,y:80,s:2}].map((d,i) => (<div key={i} className="absolute rounded-full bg-[#F5A623]/30" style={{left:`${d.x}%`,top:`${d.y}%`,width:d.s,height:d.s}} />))}</div>)
    case 'gradientbar': return (<div className="w-20 h-20 flex items-center justify-center"><div className="w-16 h-1 rounded-full" style={{background:'linear-gradient(to right, #0B4F6C, #0EA5E9)'}} /></div>)
    default: return null
  }
}

// ═══════════════════════════════════════════════════════════════
//  PDF COMPONENT SHOWCASE (fetches real data)
// ═══════════════════════════════════════════════════════════════

const voiceConfig: Record<string, { label: string; color: string }> = {
  elder: { label: 'Elder Wisdom', color: '#8B1A1A' },
  extracted: { label: 'Community Story', color: '#0B4F6C' },
  vision: { label: 'Community Vision', color: '#15803D' },
}

interface LiveQuote { id: string; text: string; author: string | null; role: string | null; photo_url: string | null; source: string; is_elder: boolean }
interface BoardPerson { name: string; role: string; photo_url: string | null }
interface LeaderPerson { full_name: string; position: string; photo_url: string | null }

function PdfComponentShowcase() {
  const [quotes, setQuotes] = useState<LiveQuote[]>([])
  const [people, setPeople] = useState<{ name: string; role: string; photo_url: string | null }[]>([])

  useEffect(() => {
    fetch('/api/public/curated-quotes?limit=10').then(r => r.ok ? r.json() : null).then(d => { if (d?.quotes?.length) setQuotes(d.quotes) }).catch(() => {})
    fetch('/api/annual-report-data/board').then(r => r.ok ? r.json() : null).then(data => {
      if (!data) return
      const result: { name: string; role: string; photo_url: string | null }[] = []
      if (data.leadership) for (const p of data.leadership as LeaderPerson[]) { if (p.photo_url) result.push({ name: p.full_name, role: p.position, photo_url: p.photo_url }) }
      if (data.board_members) for (const p of data.board_members as BoardPerson[]) { if (p.photo_url && !result.some(r => r.name === p.name)) result.push({ name: p.name, role: p.role, photo_url: p.photo_url }) }
      setPeople(result.slice(0, 5))
    }).catch(() => {})
  }, [])

  const elderQuote = quotes.find(q => q.is_elder && q.photo_url) || quotes.find(q => q.is_elder) || quotes[0]
  const communityQuote = quotes.find(q => q !== elderQuote && q.photo_url) || quotes.find(q => q !== elderQuote) || quotes[1]
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-[#E8E6E3] rounded-xl p-6" style={{ borderTopWidth: 3, borderTopColor: '#0B4F6C' }}>
        <p className="text-xs font-semibold text-[#A39E99] uppercase tracking-wider mb-1">Total Staff</p>
        <p className="text-4xl font-bold text-[#0B4F6C] mb-1" style={{ fontFamily: 'Caveat, cursive' }}>197</p>
        <p className="text-sm text-[#6B6560]">Across 20 integrated services</p>
      </div>
      <div className="bg-white border border-[#E8E6E3] rounded-xl p-6" style={{ borderTopWidth: 3, borderTopColor: '#C8963E' }}>
        <p className="text-xs font-semibold text-[#A39E99] uppercase tracking-wider mb-1">Annual Revenue</p>
        <p className="text-4xl font-bold text-[#C8963E] mb-1" style={{ fontFamily: 'Caveat, cursive' }}>$23.4M</p>
        <p className="text-sm text-[#6B6560]">FY 2023–24 total income</p>
      </div>

      {elderQuote ? (
        <div className="bg-white border border-[#E8E6E3] rounded-xl p-6">
          <div className="border-l-[3px] border-[#8B1A1A] pl-4">
            <p className="text-base italic text-[#292524] mb-3">&ldquo;{elderQuote.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              {elderQuote.photo_url ? <img src={elderQuote.photo_url} alt={elderQuote.author || 'Elder'} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 ring-1 ring-[#F5A623]" /> : <div className="w-10 h-10 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ring-1 ring-[#F5A623]">{elderQuote.author ? getInitials(elderQuote.author) : 'E'}</div>}
              <div><p className="text-sm font-semibold text-[#292524]">{elderQuote.author || 'Elder'}</p><p className="text-xs text-[#6B6560]">{elderQuote.role || 'Elder, Palm Island'}</p></div>
            </div>
          </div>
        </div>
      ) : <div className="bg-white border border-[#E8E6E3] rounded-xl p-6 animate-pulse"><div className="border-l-[3px] border-[#8B1A1A] pl-4 space-y-2"><div className="h-4 bg-gray-100 rounded w-full" /><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="flex items-center gap-3 mt-3"><div className="w-10 h-10 rounded-full bg-gray-100" /><div className="space-y-1"><div className="h-3 bg-gray-100 rounded w-24" /><div className="h-2 bg-gray-100 rounded w-16" /></div></div></div></div>}

      {communityQuote ? (() => {
        const vc = voiceConfig[communityQuote.source] || voiceConfig.extracted
        return (
          <div className="bg-white border border-[#E8E6E3] rounded-xl p-6" style={{ borderTopWidth: 3, borderTopColor: vc.color }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: vc.color }}>{communityQuote.is_elder ? 'Elder Wisdom' : vc.label}</p>
            <p className="text-sm italic text-[#292524] mb-3">&ldquo;{communityQuote.text}&rdquo;</p>
            <div className="flex items-center gap-3">
              {communityQuote.photo_url ? <img src={communityQuote.photo_url} alt={communityQuote.author || ''} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" /> : <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0" style={{ backgroundColor: vc.color }}>{communityQuote.author ? getInitials(communityQuote.author) : 'CM'}</div>}
              <div><p className="text-sm font-semibold text-[#292524]">{communityQuote.author || 'Community member'}</p>{communityQuote.role && <p className="text-xs text-[#6B6560]">{communityQuote.role}</p>}</div>
            </div>
          </div>
        )
      })() : <div className="bg-white border border-[#E8E6E3] rounded-xl p-6 animate-pulse" style={{ borderTopWidth: 3, borderTopColor: '#0EA5E9' }}><div className="space-y-2"><div className="h-3 bg-gray-100 rounded w-1/4" /><div className="h-4 bg-gray-100 rounded w-full" /><div className="h-4 bg-gray-100 rounded w-2/3" /></div></div>}

      <div className="bg-white border border-[#E8E6E3] rounded-xl p-6">
        <p className="text-xs font-semibold text-[#A39E99] uppercase tracking-wider mb-4">Person Avatar</p>
        <div className="space-y-3">
          {people.length > 0 ? people.slice(0, 4).map((person, i) => (
            <div key={i} className="flex items-center gap-3">
              {person.photo_url ? <img src={person.photo_url} alt={person.name} className={`w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 ${i === 0 ? 'ring-2 ring-[#0B4F6C]' : ''}`} /> : <div className="w-12 h-12 rounded-full bg-[#0B4F6C] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{getInitials(person.name)}</div>}
              <div><p className="text-sm font-bold text-[#292524]">{person.name}</p><p className="text-xs text-[#6B6560]">{person.role}</p></div>
            </div>
          )) : <div className="animate-pulse space-y-3">{[0, 1].map(i => (<div key={i} className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" /><div className="space-y-1"><div className="h-3 bg-gray-100 rounded w-32" /><div className="h-2 bg-gray-100 rounded w-20" /></div></div>))}</div>}
        </div>
      </div>

      <div className="bg-white border border-[#E8E6E3] rounded-xl p-6 flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold text-[#A39E99] uppercase tracking-wider w-full mb-2">Buttons</p>
        <button className="bg-[#0B4F6C] text-white px-5 py-2.5 rounded-lg font-semibold text-sm">Primary</button>
        <button className="bg-white text-[#0B4F6C] border-2 border-[#0B4F6C] px-5 py-2.5 rounded-lg font-semibold text-sm">Secondary</button>
        <button className="text-sm px-5 py-2.5 rounded-lg font-semibold text-white" style={{ background: 'linear-gradient(to right, #0B4F6C, #0EA5E9)' }}>Accent CTA</button>
        <button className="text-[#6B6560] bg-[#F7F6F4] px-4 py-2 rounded-lg font-medium text-sm">Ghost</button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

type BrandTab = 'web' | 'pdf'

export default function BrandHubPage() {
  const [tab, setTab] = useState<BrandTab>('web')
  const [pdfLoading, setPdfLoading] = useState(false)

  const downloadBrandPdf = async () => {
    setPdfLoading(true)
    try {
      const res = await fetch('/api/pdf/generate?type=brand-guide')
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'PICC-Brand-Guide.pdf'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch (err) { console.error('Brand PDF download failed:', err) }
    finally { setPdfLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Brand Hub</h1>
          </div>
          <p className="text-gray-500 text-lg">PICC brand system — web platform + PDF reports</p>
        </div>
        <button onClick={downloadBrandPdf} disabled={pdfLoading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium">
          {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Brand Guide PDF
        </button>
      </div>

      {/* ── Tab Toggle ── */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl mb-12 w-fit">
        <button
          onClick={() => setTab('web')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'web' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Monitor className="w-4 h-4" />
          Web Platform
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">LIVE</span>
        </button>
        <button
          onClick={() => setTab('pdf')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'pdf' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <FileText className="w-4 h-4" />
          PDF Reports
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0B4F6C]/10 text-[#0B4F6C] border border-[#0B4F6C]/20">SALTWATER &amp; EARTH</span>
        </button>
      </div>

      {/* ══════════════ SHARED: Brand Personality ══════════════ */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900">Brand Personality</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">Five traits that define how PICC shows up — shared across web and print.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
            <thead><tr className="bg-gray-50"><th className="text-left px-4 py-3 font-semibold text-gray-700">Trait</th><th className="text-left px-4 py-3 font-semibold text-gray-700">What it means</th><th className="text-left px-4 py-3 font-semibold text-gray-700">What it doesn&apos;t mean</th></tr></thead>
            <tbody>{brandPersonality.map(row => (<tr key={row.trait} className="border-t border-gray-100"><td className="px-4 py-3 font-semibold text-gray-800">{row.trait}</td><td className="px-4 py-3 text-gray-600">{row.means}</td><td className="px-4 py-3 text-gray-400">{row.doesntMean}</td></tr>))}</tbody>
          </table>
        </div>
      </section>

      {/* ══════════════ SHARED: Logo ══════════════ */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6"><ImageIcon className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Logo</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-4">
            <img src="/logo/picc-logo-full.png" alt="PICC Logo" className="h-24 w-auto object-contain" /><p className="text-xs text-gray-400">On light background</p>
            <a href="/logo/picc-logo-full.png" download="picc-logo-full.png" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"><Download className="w-3 h-3" /> Download PNG</a>
          </div>
          <div className="rounded-xl p-8 flex flex-col items-center gap-4" style={{ backgroundColor: '#1A1A2E' }}><img src="/logo/picc-logo-full.png" alt="PICC Logo" className="h-24 w-auto object-contain" /><p className="text-xs text-gray-400">On Midnight background</p></div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 flex flex-col items-center gap-4 justify-center"><img src="/logo/picc-logo-full.png" alt="PICC Logo" className="h-10 w-auto object-contain" /><p className="text-xs text-gray-400">Minimum size (40px height)</p></div>
        </div>
      </section>

      {/* ══════════════ TAB-SPECIFIC: Colors ══════════════ */}
      {tab === 'web' ? (
        <>
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-2"><Palette className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Web Colors</h2></div>
            <p className="text-sm text-gray-500 mb-8">Current website palette from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">tailwind.config.js</code>. White/gray editorial foundation with earth-tone accents in specific spots. Footer uses a separate <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">stone-*</code> scale.</p>
            {Object.entries(webColorGroups).map(([group, colors]) => (<div key={group} className="mb-8"><h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">{group}</h3><div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">{colors.map(c => <ColorSwatch key={c.token} {...c} />)}</div></div>))}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4 space-y-2">
              <p className="text-xs text-gray-500"><strong>Application pattern:</strong> White and <code className="bg-gray-100 px-1 rounded">gray-50</code> backgrounds dominate. PICC Red, Ochre, and Earth appear as hero overlay, section label accents, and one full-bleed dark section. Primary CTAs use <code className="bg-gray-100 px-1 rounded">gray-900</code> (near-black) for a restrained, editorial feel. On dark backgrounds, CTAs flip to <code className="bg-gray-100 px-1 rounded">bg-white text-gray-900</code>.</p>
              <p className="text-xs text-gray-500"><strong>Warm scale:</strong> Used sparingly — fallback image gradients, text on dark backgrounds, and search bar focus. Not a dominant background system.</p>
              <p className="text-xs text-gray-500"><strong>Sage:</strong> Used on the Impact page for the annual income metric. Not used elsewhere.</p>
              <p className="text-xs text-gray-500"><strong>Status colors:</strong> Standard Tailwind green/amber/blue for active/planning/completed badges on service cards.</p>
              <p className="text-xs text-gray-500"><strong>Footer:</strong> Uses <code className="bg-gray-100 px-1 rounded">stone-*</code> scale (warm neutral), distinct from the <code className="bg-gray-100 px-1 rounded">gray-*</code> used in nav and sections.</p>
            </div>
          </section>

          {/* Web Gradients */}
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Web Gradients</h2></div>
            <p className="text-sm text-gray-500 mb-6">Gradients used on the live website — click CSS to copy.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {webGradients.map(g => (<div key={g.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden"><div className="h-20 w-full" style={{ background: g.css }} /><div className="p-4"><h3 className="text-sm font-semibold text-gray-900 mb-1">{g.name}</h3><p className="text-xs text-gray-500 mb-2">{g.usage}</p><CopyableCode text={g.css} /></div></div>))}
            </div>
          </section>

          {/* Web Component Patterns */}
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6"><Grid3X3 className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Web Component Patterns</h2></div>
            <p className="text-sm text-gray-500 mb-6">How the current web platform applies the brand.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation (default)</p>
                <div className="bg-white/90 backdrop-blur-md rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3"><img src="/logo/picc-logo-full.png" alt="Logo" className="h-6 w-auto" /><span className="text-sm font-semibold text-gray-900">Palm Island</span></div>
                  <div className="flex items-center gap-4 text-xs"><span className="text-gray-500">About</span><span className="text-gray-500">Services</span><span className="text-gray-500">Stories</span><span className="bg-gray-900 text-white px-3 py-1.5 rounded-full font-medium">Share Your Voice</span></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">{webComponentExamples.navDefault}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">On scroll: {webComponentExamples.navScrolled}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Section Labels</p>
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#8B1A1A]">Our Impact</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C8922A]">Community Voices</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2D2319]">Our History</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 font-mono">{webComponentExamples.sectionLabel}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Buttons (on light)</p>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <button className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-semibold text-sm">Primary CTA</button>
                  <button className="bg-[#C8922A] text-white px-5 py-2.5 rounded-full font-semibold text-sm">Ochre CTA</button>
                  <button className="bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-full font-semibold text-sm">Secondary</button>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">{webComponentExamples.ctaPrimary}</p>
                <p className="text-[10px] text-gray-400 font-mono">{webComponentExamples.ctaOchre}</p>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'linear-gradient(to bottom right, #3A2F24, #2D2319, #8B1A1A)' }}>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Buttons (on dark)</p>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <button className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold text-sm">Primary on Dark</button>
                  <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-full font-semibold text-sm">Glass Secondary</button>
                </div>
                <p className="text-[10px] text-white/30 font-mono">{webComponentExamples.ctaOnDark}</p>
                <p className="text-[10px] text-white/30 font-mono">bg-white/10 backdrop-blur-sm border border-white/20</p>
              </div>

              <div className="rounded-xl p-6" style={{ background: 'linear-gradient(to bottom right, #3A2F24, #2D2319, #8B1A1A)' }}>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Dark Section</p>
                <p className="text-white text-lg font-bold mb-2">Full-bleed dark sections</p>
                <p className="text-white/70 text-sm">Used for the 20-year timeline, CEO callout quotes, and immersive storytelling sections.</p>
                <p className="text-[10px] text-white/30 mt-3 font-mono">from-picc-earth-700 via-picc-earth to-picc-red</p>
              </div>

              <div className="rounded-xl p-6 bg-[#1C1917]">
                <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-3">Footer</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#D6D3D1]">Palm Island Community Company</p>
                  <div className="flex gap-4 text-xs text-[#78716C]"><span>About</span><span>Services</span><span>Contact</span></div>
                </div>
                <p className="text-[10px] text-[#78716C]/50 mt-3 font-mono">{webComponentExamples.footerStyle}</p>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-2"><Palette className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">PDF Colors — &ldquo;Saltwater &amp; Earth&rdquo;</h2></div>
            <p className="text-sm text-gray-500 mb-8">Annual report &amp; PDF palette from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">lib/pdf/theme.ts</code>. Bold, earth-tone dominant. Tokens reference <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">C.tokenName</code>.</p>
            {Object.entries(pdfColorGroups).map(([group, colors]) => (<div key={group} className="mb-8"><h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">{group}</h3><div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">{colors.map(c => <ColorSwatch key={c.token} {...c} />)}</div></div>))}
            <div className="bg-[#FEF3C7]/30 border border-[#C8963E]/20 rounded-xl p-4 mt-4">
              <p className="text-xs text-[#6B6560]"><strong>Alignment pending:</strong> This palette is currently used in the PDF/report system only. Once the new PICC brand is approved, the web platform will be migrated to match.</p>
            </div>
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-2 mb-4"><h2 className="text-xl font-bold text-gray-900">Service Category Colors</h2></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{serviceColors.map(sc => (<div key={sc.category} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl"><div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: sc.hex }} /><div><p className="text-sm font-medium text-gray-900">{sc.name}</p><code className="text-xs text-gray-400">{sc.hex}</code></div></div>))}</div>
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-2 mb-4"><MessageSquareQuote className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Voice Type Colors</h2></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{voiceTypeColors.map(v => (<div key={v.name} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl"><div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: v.hex }} /><div><p className="text-sm font-medium text-gray-900">{v.name}</p><code className="text-xs text-gray-400">{v.hex}</code></div></div>))}</div>
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">PDF Gradients</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{pdfGradients.map(g => (<div key={g.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden"><div className="h-24 w-full" style={{ background: g.css }} /><div className="p-4"><h3 className="text-sm font-semibold text-gray-900 mb-1">{g.name}</h3><p className="text-xs text-gray-500 mb-2">{g.usage}</p><CopyableCode text={g.css} /></div></div>))}</div>
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6"><Brush className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Brand Motifs</h2></div>
            <p className="text-sm text-gray-500 mb-6">All decorative elements derive from the sea turtle logo. Never use generic geometric patterns.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{motifs.map(m => (<div key={m.name} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4"><div className="flex-shrink-0"><MotifPreview type={m.preview} /></div><div className="min-w-0"><h3 className="text-sm font-semibold text-gray-900 mb-1">{m.name}</h3><p className="text-xs text-gray-500 mb-1">{m.description}</p><p className="text-[10px] text-[#0B4F6C] font-medium">{m.usage}</p></div></div>))}</div>
          </section>

          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6"><Grid3X3 className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">PDF Component Showcase</h2></div>
            <p className="text-sm text-gray-500 mb-6">Live component patterns using real PICC data.</p>
            <PdfComponentShowcase />
          </section>
        </>
      )}

      {/* ══════════════ SHARED: Typography ══════════════ */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6"><Type className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Typography</h2></div>

        {tab === 'web' ? (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Web Font — Inter (sole font)</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">Inter Bold — Headings</p>
              <p className="text-xl font-semibold text-gray-600 mb-1">Inter SemiBold — Subheadings</p>
              <p className="text-base text-gray-500 mb-4">Inter Regular — Body copy, UI text, navigation</p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p>Loaded via <code className="bg-gray-100 px-1 rounded">next/font/google</code> in layout.tsx</p>
                <p>All headings, body, and UI elements use Inter at various weights</p>
                <p>No display/decorative font on the web platform</p>
              </div>
            </div>
            <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4">
              <p className="text-xs text-gray-600"><strong>Note:</strong> Caveat is used in the PDF system only (registered via <code className="bg-white/60 px-1 rounded text-xs">lib/pdf/register-fonts.ts</code>). It is not loaded on the web platform.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">PDF Display Font — Caveat</h3>
              <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mb-3 inline-block">PDF system only — not loaded on web</p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p>H1: 32pt Caveat Bold — main titles</p>
                <p>H2: 24pt Caveat Bold — section headings</p>
                <p>Stat values: 32pt Caveat Bold</p>
                <p>Registered via <code className="bg-gray-100 px-1 rounded">lib/pdf/register-fonts.ts</code></p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">PDF Body Font — Inter</h3>
              <p className="text-2xl font-bold text-gray-900 mb-2">Inter Bold</p>
              <p className="text-lg font-semibold text-gray-600 mb-1">Inter SemiBold</p>
              <p className="text-base text-gray-500 mb-4">Inter Regular — body copy</p>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                <p>H3: 14pt Inter Bold</p><p>H4: 11pt Inter Bold</p><p>Body: 9.5pt Inter Regular</p><p>Small: 8.5pt Inter Regular</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ══════════════ SHARED: Tone of Voice ══════════════ */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6"><MessageSquareQuote className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Tone of Voice</h2></div>
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Writing Principles</h3>
          <div className="space-y-3">{writingPrinciples.map((p, i) => (<div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">{i + 1}</span><div><p className="text-sm font-semibold text-gray-900">{p.rule}</p><p className="text-xs text-gray-500 mt-0.5">{p.example}</p></div></div>))}</div>
        </div>
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Vocabulary Guide</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead><tr className="bg-gray-50"><th className="text-left px-4 py-3 font-semibold text-green-700">Prefer</th><th className="text-left px-4 py-3 font-semibold text-orange-600">Avoid</th></tr></thead>
              <tbody>{vocabularyGuide.map((row, i) => (<tr key={i} className="border-t border-gray-100"><td className="px-4 py-2.5 text-gray-700">{row.prefer}</td><td className="px-4 py-2.5 text-gray-400">{row.avoid}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Cultural Sensitivity</h3>
          <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-5 text-sm text-gray-600 space-y-2">
            <p><strong>Acknowledgement of Country</strong> appears on every report and major page.</p>
            <p><strong>Elder content</strong> is always attributed and approved (<code className="text-xs bg-white/60 px-1 rounded">elder_approval_given = true</code>).</p>
            <p><strong>Sorry Business:</strong> Never use names or images of recently deceased without family consultation.</p>
            <p><strong>Traditional Knowledge</strong> is flagged and treated as intellectual property of the community.</p>
          </div>
        </div>
      </section>

      {/* ══════════════ SHARED: Bespoke Icons ══════════════ */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6"><Grid3X3 className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Bespoke Icons</h2></div>
        <p className="text-sm text-gray-500 mb-6">{bespokeIcons.length} custom icons with transparent backgrounds. Available in ochre (light) and white (dark).</p>
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Standard — for light backgrounds</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 mb-10">
          {bespokeIcons.map(icon => (<a key={icon} href={assetUrl(`/icons/bespoke/${icon}.png`)} download={`${icon}.png`} className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors" title={`Download ${icon}.png`}><div className="w-12 h-12 flex items-center justify-center"><img src={assetUrl(`/icons/bespoke/${icon}.png`)} alt={icon} className="w-10 h-10 object-contain" /></div><span className="text-[10px] text-gray-500 text-center truncate w-full">{icon}</span></a>))}
        </div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">White — for dark backgrounds</h3>
        <div className="rounded-2xl p-4" style={{ backgroundColor: '#1A1A2E' }}>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {bespokeIcons.map(icon => (<a key={icon} href={assetUrl(`/icons/bespoke-white/${icon}.png`)} download={`${icon}-white.png`} className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-colors" title={`Download ${icon}-white.png`}><div className="w-12 h-12 flex items-center justify-center"><img src={assetUrl(`/icons/bespoke-white/${icon}.png`)} alt={`${icon} (white)`} className="w-10 h-10 object-contain" /></div><span className="text-[10px] text-gray-400 text-center truncate w-full">{icon}</span></a>))}
          </div>
        </div>
      </section>

      {/* ══════════════ SHARED: Quick-Copy, Videos, Downloads ══════════════ */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6"><Copy className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Quick-Copy Snippets</h2></div>
        <p className="text-sm text-gray-500 mb-6">Ready-to-use text for grant proposals and presentations.</p>
        <div className="space-y-4">{snippets.map(s => <SnippetCard key={s.title} {...s} />)}</div>
      </section>

      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6"><Video className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Video Library</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{FALLBACK_VIDEOS.map(v => <VideoCard key={v.title} {...v} />)}</div>
      </section>

      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6"><Package className="w-5 h-5 text-gray-400" /><h2 className="text-xl font-bold text-gray-900">Asset Downloads</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3"><ImageIcon className="w-8 h-8 text-gray-600" /><div><h3 className="text-sm font-semibold text-gray-900">Logo Pack</h3><p className="text-xs text-gray-500">Full-size logo files</p></div></div>
            <a href="/logo/picc-logo-full.png" download="picc-logo-full.png" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors justify-center"><Download className="w-3.5 h-3.5" />Download Logo PNG</a>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3"><Grid3X3 className="w-8 h-8 text-gray-600" /><div><h3 className="text-sm font-semibold text-gray-900">Service Icons</h3><p className="text-xs text-gray-500">{bespokeIcons.length} bespoke icons</p></div></div>
            <a href={assetUrl("/icons/bespoke/community.png")} download="community.png" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors justify-center"><Download className="w-3.5 h-3.5" />Download Sample</a>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3"><Palette className="w-8 h-8 text-gray-600" /><div><h3 className="text-sm font-semibold text-gray-900">Brand Guide PDF</h3><p className="text-xs text-gray-500">Complete brand reference</p></div></div>
            <button onClick={downloadBrandPdf} disabled={pdfLoading} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors justify-center disabled:opacity-50">
              {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}Generate Brand Guide PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
