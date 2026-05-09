'use client'

import React, { useState } from 'react'
import {
  BookOpen,
  BarChart3,
  FileText,
  Users,
  Camera,
  MessageSquare,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Heart,
  Megaphone,
  Award,
  Search,
  Image,
  Layers,
  Calendar,
  TrendingUp,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GuideSection {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
  items: GuideItem[]
}

interface GuideItem {
  title: string
  description: string
  path: string
  tips?: string[]
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SECTIONS: GuideSection[] = [
  {
    id: 'dashboard',
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Dashboard & Analytics',
    subtitle: 'Your platform overview at a glance',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    items: [
      {
        title: 'Main Dashboard',
        description:
          'See live stats: total stories, services, team members, community visions, and recent activity across the platform.',
        path: '/picc/dashboard',
        tips: [
          'All numbers are live from the database — never placeholder data',
          'Click any stat card to jump to that section',
        ],
      },
      {
        title: 'Analytics',
        description:
          'View engagement metrics, content trends, and platform usage over time.',
        path: '/picc/analytics',
      },
      {
        title: 'Insights',
        description:
          'AI-generated insights about your content, stories, and community engagement patterns.',
        path: '/picc/insights',
      },
    ],
  },
  {
    id: 'reports',
    icon: <FileText className="h-5 w-5" />,
    title: 'Annual Reports & PDFs',
    subtitle: 'Generate audience-targeted annual reports',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    items: [
      {
        title: 'Report Composer',
        description:
          'The drag-and-drop report builder. Select a fiscal year and audience (Community, Funders, Supporters, Board, Government), then fill each page slot with real content from your database.',
        path: '/picc/reports/composer',
        tips: [
          'Choose your audience first — pages auto-filter to what that audience needs',
          'Content auto-saves every 2 seconds',
          'Click "Preview" to see the PDF before downloading',
          'After downloading, the Distribution Panel appears to send via GHL',
        ],
      },
      {
        title: 'Report Builder (Legacy)',
        description:
          'Quick one-click report generation. Select year and audience, hit generate.',
        path: '/picc/reports/builder',
      },
      {
        title: 'Report Planner',
        description:
          'Plan which content goes into each report section before generating.',
        path: '/picc/reports/planner',
      },
      {
        title: 'Annual Report Data',
        description:
          'View and manage the underlying data that feeds into annual reports — financials, compliance, community voices.',
        path: '/picc/annual-report-data',
      },
    ],
  },
  {
    id: 'stories',
    icon: <Heart className="h-5 w-5" />,
    title: 'Stories & Content',
    subtitle: 'The heart of the platform — community stories',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    items: [
      {
        title: 'All Stories',
        description:
          'Browse, search, and manage all community stories. Each story can be linked to services, tagged, and used in reports.',
        path: '/picc/stories',
        tips: [
          'Stories are the primary content source for annual reports',
          'Each story can have photos, quotes, and service associations',
        ],
      },
      {
        title: 'Story Capture',
        description:
          'View incoming story submissions from SMS, email, web forms, and voice notes. Stories arrive as raw captures, get AI-enriched, then go through review before publishing.',
        path: '/picc/capture',
        tips: [
          'New captures arrive as "pending" — they need review before becoming stories',
          'AI automatically enriches captures with titles, tags, and classifications',
          'Elder content is flagged for cultural review before approval',
        ],
      },
      {
        title: 'Capture Prompts',
        description:
          'Create and manage story prompts that get sent to staff and community via GHL. Prompts are the questions you ask to invite stories.',
        path: '/picc/capture/prompts',
        tips: [
          'Target prompts to specific audiences: all, staff, community, or elders',
          'Prompts can be sent via SMS through GHL workflows',
        ],
      },
      {
        title: 'Quotes',
        description:
          'Manage extracted quotes from stories, elder wisdom, and community feedback. Quotes are used throughout reports and the public website.',
        path: '/picc/quotes',
      },
      {
        title: 'Community Voice',
        description: 'Community feedback and vision statements collected from residents.',
        path: '/picc/community-voice',
      },
      {
        title: 'Submissions',
        description: 'Review incoming content submissions from the public website.',
        path: '/picc/submissions',
      },
    ],
  },
  {
    id: 'media',
    icon: <Image className="h-5 w-5" />,
    title: 'Media Library',
    subtitle: 'Photos, videos, and visual assets',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    items: [
      {
        title: 'Media Gallery',
        description:
          'Upload, tag, and manage all photos and images. Media can be linked to stories, services, and report pages.',
        path: '/picc/media/gallery',
        tips: [
          'AI auto-analyzes uploaded images for tags and descriptions',
          'Use tags to find the right photo when building reports',
        ],
      },
      {
        title: 'External Videos',
        description: 'Manage links to YouTube and external video content.',
        path: '/picc/media/external-videos',
      },
    ],
  },
  {
    id: 'services',
    icon: <Layers className="h-5 w-5" />,
    title: 'Services & Programs',
    subtitle: 'Manage PICC service delivery areas',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    items: [
      {
        title: 'Services Directory',
        description:
          'View and edit all PICC services — Health, Family, Children & Family Centre, Justice, Crisis, Digital, Economic Development, and Delegated Authority.',
        path: '/picc/services',
        tips: [
          'Each service has its own public page on the website',
          'Link stories and team members to services for richer reporting',
        ],
      },
      {
        title: 'Innovation Projects',
        description: 'Track innovation initiatives, pilot programs, and new ideas across services.',
        path: '/picc/innovation',
      },
    ],
  },
  {
    id: 'grants',
    icon: <Award className="h-5 w-5" />,
    title: 'Grants & Evidence',
    subtitle: 'Track grant outcomes and build evidence packages',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    items: [
      {
        title: 'Grants Overview',
        description:
          'See all active grants, their funding amounts, outcomes count, and upcoming deadlines at a glance.',
        path: '/picc/grants',
        tips: [
          'Each grant tracks outcomes — measurable results your funders expect',
          'Deadlines show days remaining with color-coded urgency',
        ],
      },
      {
        title: 'Evidence Dashboard',
        description:
          'Track evidence coverage across all grant outcomes. See which outcomes have linked evidence (stories, photos, metrics) and which have gaps.',
        path: '/picc/grants/evidence',
        tips: [
          'Green dot = evidence linked, Red dot = gap that needs attention',
          'Evidence types: stories, media, quotes, activity logs, metrics, documents',
          'Use auto-link to let AI match existing content to outcomes',
        ],
      },
      {
        title: 'Evidence Package PDF',
        description:
          'Generate a polished PDF evidence package for any grant — includes all outcomes with linked evidence items, ready for funder submission.',
        path: '/picc/reports/builder',
      },
    ],
  },
  {
    id: 'people',
    icon: <Users className="h-5 w-5" />,
    title: 'People & Community',
    subtitle: 'Team members, elders, and stakeholders',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    items: [
      {
        title: 'Team Members',
        description: 'Manage staff profiles, roles, and service assignments.',
        path: '/picc/team',
      },
      {
        title: 'Elders',
        description:
          'Elder profiles and cultural knowledge. Elder content requires validation and approval before publication.',
        path: '/picc/elders',
        tips: [
          'Elder content has cultural sensitivity protocols',
          'Content flagged as traditional knowledge needs Elder review',
          'Sorry business periods suppress all outbound prompts',
        ],
      },
      {
        title: 'Storytellers',
        description: 'People who have contributed stories to the platform.',
        path: '/picc/storytellers',
      },
    ],
  },
  {
    id: 'comms',
    icon: <Megaphone className="h-5 w-5" />,
    title: 'Communications & Distribution',
    subtitle: 'Reach your audiences via GoHighLevel',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    items: [
      {
        title: 'Notifications',
        description:
          'View all platform notifications — new stories captured, grant deadlines, system events. Mark as read or clear all.',
        path: '/picc/notifications',
      },
      {
        title: 'Report Distribution',
        description:
          'After generating a report PDF, distribute it to the right audience via GHL email campaigns. Track opens and clicks.',
        path: '/picc/reports/composer',
        tips: [
          'Distribution uses GHL — all emails/SMS go through your GHL account',
          'Each audience gets their tailored version of the report',
          'Track engagement: how many opened, clicked, downloaded',
        ],
      },
      {
        title: 'Newsletter',
        description: 'Manage newsletter content and subscriber lists.',
        path: '/picc/newsletter',
      },
    ],
  },
  {
    id: 'knowledge',
    icon: <Search className="h-5 w-5" />,
    title: 'Knowledge & AI',
    subtitle: 'Ask questions, get sourced answers',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    items: [
      {
        title: 'Knowledge Base',
        description:
          'Search across all PICC content — stories, quotes, reports, service data. Get AI-powered answers with sources.',
        path: '/picc/knowledge',
      },
      {
        title: 'AI Assistant',
        description:
          'Chat with PICC AI to ask questions about your data, generate content drafts, or get suggestions.',
        path: '/picc/assistant',
      },
      {
        title: 'Data Intelligence',
        description: 'AI-powered data analysis and pattern detection across your content.',
        path: '/picc/data-intelligence',
      },
      {
        title: 'Content Readiness',
        description:
          'Check whether you have enough quality content to generate reports for each audience.',
        path: '/picc/content-readiness',
      },
    ],
  },
  {
    id: 'settings',
    icon: <Settings className="h-5 w-5" />,
    title: 'Settings & Admin',
    subtitle: 'Platform configuration and data management',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    items: [
      {
        title: 'Settings',
        description: 'Platform configuration, branding, and integration settings.',
        path: '/picc/settings',
      },
      {
        title: 'Brand Hub',
        description:
          'PICC brand guidelines, colors, logos, and style rules. Reference this before creating any external materials.',
        path: '/picc/brand',
      },
      {
        title: 'Data Enrichment',
        description:
          'Run AI enrichment pipelines to improve content quality — auto-tag media, extract quotes from stories, classify content.',
        path: '/picc/data-enrichment',
      },
      {
        title: 'Database',
        description: 'Direct access to database tables for advanced data management.',
        path: '/picc/database',
      },
      {
        title: 'Permissions',
        description: 'Manage user roles and access levels across the platform.',
        path: '/picc/permissions',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Collapsible Section Component
// ---------------------------------------------------------------------------

function Section({ section }: { section: GuideSection }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className={`p-2.5 rounded-lg border ${section.color}`}>
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
          <p className="text-sm text-gray-500">{section.subtitle}</p>
        </div>
        <span className="text-sm text-gray-400 mr-2">{section.items.length} features</span>
        {open ? (
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {section.items.map((item) => (
            <div key={item.path + item.title} className="p-5 pl-[4.5rem]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  {item.tips && item.tips.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {item.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                          <Zap className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <a
                  href={item.path}
                  className="flex items-center gap-1 text-xs font-medium text-[#0B4F6C] hover:underline whitespace-nowrap flex-shrink-0"
                >
                  Open <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Start Workflow Cards
// ---------------------------------------------------------------------------

const WORKFLOWS = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Generate an Annual Report',
    steps: [
      'Go to Report Composer',
      'Select fiscal year (e.g. 2024-25)',
      'Choose audience (Funders, Community, etc.)',
      'Fill page slots with content from your database',
      'Preview, then Download PDF',
      'Distribute via GHL to your audience',
    ],
    color: 'border-emerald-200 bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: <Camera className="h-6 w-6" />,
    title: 'Capture a New Story',
    steps: [
      'Stories arrive via SMS, email, web form, or staff input',
      'AI enriches: adds title, tags, cultural flags',
      'Review in Story Capture dashboard',
      'Approve to publish (Elder content needs cultural review)',
      'Story is now available for reports and the website',
    ],
    color: 'border-rose-200 bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: 'Build a Grant Evidence Package',
    steps: [
      'Open a grant from the Grants Overview',
      'Add outcomes your funder expects',
      'Link evidence: stories, photos, metrics',
      'Use auto-link for AI matching',
      'Check the Evidence Dashboard for gaps',
      'Generate Evidence Package PDF for submission',
    ],
    color: 'border-cyan-200 bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: 'Send a Story Prompt',
    steps: [
      'Go to Capture Prompts',
      'Create a new prompt (question to ask)',
      'Choose audience: staff, community, or elders',
      'Send via GHL (SMS/email workflow)',
      'Responses arrive as story captures',
      'Review and approve incoming stories',
    ],
    color: 'border-orange-200 bg-orange-50',
    iconColor: 'text-orange-600',
  },
]

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function PlatformGuidePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSections = searchQuery.trim()
    ? SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((section) => section.items.length > 0)
    : SECTIONS

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="uppercase font-bold mb-2" style={{ color: '#8B1A1A', fontSize: 11, letterSpacing: '0.3em' }}>
          PICC admin · platform guide
        </p>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: '#0B4F6C' }}>
            <BookOpen className="h-6 w-6" style={{ color: '#FBF8EE' }} />
          </div>
          <div>
            <h1 className="font-fraunces font-bold leading-tight" style={{ color: '#0B4F6C', fontSize: 'clamp(28px, 4vw, 40px)' }}>
              Platform guide.
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#6B6560' }}>
              Everything the PICC team needs to know about using this platform.
            </p>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-gray-900 overflow-hidden">
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center">
            <Globe className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Platform Walkthrough Video</p>
            <p className="text-gray-600 text-xs mt-1">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="mb-8 p-5 rounded-xl border border-[#0B4F6C]/20 bg-[#0B4F6C]/5">
        <h2 className="text-sm font-semibold text-[#0B4F6C] uppercase tracking-wider mb-3">
          What This Platform Does
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: <TrendingUp className="h-5 w-5" />,
              label: 'STORY',
              desc: 'Annual reports, impact summaries, photo essays',
            },
            {
              icon: <Search className="h-5 w-5" />,
              label: 'MEMORY',
              desc: 'Ask anything, get a sourced answer',
            },
            {
              icon: <Camera className="h-5 w-5" />,
              label: 'CAPTURE',
              desc: 'Voice notes, photos, meeting summaries',
            },
            {
              icon: <Calendar className="h-5 w-5" />,
              label: 'DIRECTION',
              desc: 'Aspirations tracked with real evidence',
            },
          ].map((mode) => (
            <div key={mode.label} className="text-center">
              <div className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-[#0B4F6C]/10 text-[#0B4F6C] mb-2">
                {mode.icon}
              </div>
              <div className="text-xs font-bold text-[#0B4F6C] tracking-wider">{mode.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{mode.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start Workflows */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKFLOWS.map((wf) => (
            <div key={wf.title} className={`rounded-xl border p-5 ${wf.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={wf.iconColor}>{wf.icon}</span>
                <h3 className="text-sm font-semibold text-gray-900">{wf.title}</h3>
              </div>
              <ol className="space-y-1.5">
                {wf.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Protocols Callout */}
      <div className="mb-8 p-5 rounded-xl border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-1">Cultural Protocols</h3>
            <ul className="space-y-1 text-xs text-amber-800">
              <li>Elder content requires cultural review and approval before publishing</li>
              <li>Traditional knowledge is automatically flagged for Elder review</li>
              <li>Sorry business periods suppress all outbound story prompts</li>
              <li>Participant names are redacted by default unless explicit consent is given</li>
              <li>Sensitivity levels: Standard, Sensitive, Restricted</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F6C]/20 focus:border-[#0B4F6C]"
          />
        </div>
      </div>

      {/* All Sections */}
      <div className="space-y-3 mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">All Features</h2>
        {filteredSections.map((section) => (
          <Section key={section.id} section={section} />
        ))}
        {filteredSections.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No features match &quot;{searchQuery}&quot;
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 pb-8 text-center">
        <p className="text-xs text-gray-400">
          Palm Island Community Company &middot; Empathy Ledger Platform
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Need help? Contact your platform administrator or refer to the video above.
        </p>
      </div>
    </div>
  )
}
