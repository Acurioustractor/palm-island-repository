/**
 * CMO Agent
 * Chief Marketing Officer agent for PICC — handles marketing strategy,
 * content capture, media management, and brand awareness.
 */

import { AgentCore } from './agent-core'
import type { AgentConfig, InterviewTemplate } from './types'

const CMO_SYSTEM_PROMPT = `You are the Chief Marketing Officer (CMO) for Palm Island Community Company (PICC).

Your role:
- Understand and track PICC's marketing activities, campaigns, and brand presence
- Capture stories, quotes, and media from community events
- Monitor engagement metrics across newsletters, social media, and community outreach
- Identify partnership and sponsorship opportunities
- Ensure all marketing aligns with PICC's cultural values and brand guidelines

Your personality:
- Warm, community-focused, and culturally respectful
- Strategic but practical — you understand remote community constraints
- You ask follow-up questions to capture rich detail
- You proactively identify action items and next steps

Brand guidelines:
- PICC tagline: "Our Community, Our Future, Our Way"
- Always respectful of cultural protocols and Elder authority
- Content should celebrate community strength, not deficit narratives
- Use First Nations-appropriate language and framing

When interviewing:
- Ask one question at a time
- Acknowledge answers before moving to the next question
- Extract specific details: names, dates, numbers, quotes
- Flag content that may need Elder approval
- Suggest follow-up actions after each response`

const CMO_TEMPLATES: InterviewTemplate[] = [
  {
    id: 'quarterly-review',
    title: 'Quarterly Marketing Review',
    description:
      'Comprehensive review of marketing activities, campaigns, engagement, and brand health for the quarter.',
    questions: [
      "What marketing campaigns or initiatives ran this quarter? What were the goals and outcomes?",
      "How has community engagement been across our channels (newsletter, social media, events)? Any standout metrics?",
      "What community events did PICC participate in or host? What was the turnout and feedback?",
      "How is the newsletter performing? What topics are resonating with the community?",
      "Are there any brand or messaging changes we should consider? Any community feedback on how we present ourselves?",
      "What partnership or sponsorship opportunities are on the horizon? Any new relationships to cultivate?",
    ],
  },
  {
    id: 'quick-capture',
    title: 'Quick Content Capture',
    description:
      'Fast capture of a story, event, or content opportunity while the details are fresh.',
    questions: [
      "What happened? Give me the key details — who, what, where, when.",
      "Why is this significant for the community? What makes it worth sharing?",
      "Do we have any photos or video from this? Who took them?",
      "Are there any quotes from community members we can use? (Note if Elder approval is needed.)",
    ],
  },
  {
    id: 'media-captioning',
    title: 'Media Captioning Session',
    description:
      'Walk through uncaptioned photos and media to add context, names, and stories.',
    questions: [
      "Let's look at recent uncaptioned media. Can you describe what's happening in these photos?",
      "Who are the people in these photos? Are there any cultural considerations for sharing them?",
      "What event or activity do these photos relate to? When was it?",
      "What captions would work for social media? Keep them warm and community-focused.",
    ],
  },
]

const CMO_KNOWLEDGE_DOMAINS = [
  'campaigns',
  'engagement-metrics',
  'events',
  'newsletter',
  'brand',
  'partnerships',
  'social-media',
  'media-library',
  'community-feedback',
  'content-calendar',
]

const DOMAIN_QUESTIONS: Record<string, string[]> = {
  campaigns: [
    'What campaigns are currently active?',
    'What were the results of the last campaign?',
  ],
  'engagement-metrics': [
    'What are our current social media follower counts?',
    'What was the open rate on our last newsletter?',
  ],
  events: [
    'What upcoming events does PICC have planned?',
    'How did the last community event go?',
  ],
  newsletter: [
    'When was the last newsletter sent?',
    'What topics are planned for the next newsletter?',
  ],
  brand: [
    'Have there been any brand guideline updates recently?',
    'Is our messaging consistent across all channels?',
  ],
  partnerships: [
    'Who are our current marketing partners?',
    'Are there any new partnership opportunities?',
  ],
  'social-media': [
    'Which platform is performing best for us?',
    'What type of content gets the most engagement?',
  ],
  'media-library': [
    'How many uncaptioned photos do we have?',
    'When was the last media upload?',
  ],
  'community-feedback': [
    'What feedback have we received about our communications?',
    'Are community members engaging with our content?',
  ],
  'content-calendar': [
    'What content is planned for the next month?',
    'Are there any important dates coming up we should prepare content for?',
  ],
}

const cmoConfig: AgentConfig = {
  role: 'cmo',
  title: 'CMO',
  description: 'Chief Marketing Officer — marketing strategy, content, media, and brand',
  systemPrompt: CMO_SYSTEM_PROMPT,
  interviewTemplates: CMO_TEMPLATES,
  knowledgeDomains: CMO_KNOWLEDGE_DOMAINS,
}

export class CMOAgent extends AgentCore {
  constructor() {
    super(cmoConfig)
  }

  protected getSuggestedQuestions(domain: string): string[] {
    return DOMAIN_QUESTIONS[domain] || [`What's the current status of ${domain}?`]
  }

  getTemplates(): InterviewTemplate[] {
    return CMO_TEMPLATES
  }

  getTemplate(id: string): InterviewTemplate | undefined {
    return CMO_TEMPLATES.find((t) => t.id === id)
  }
}

export const cmoAgent = new CMOAgent()
