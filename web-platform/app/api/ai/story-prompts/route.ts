/**
 * AI Story Prompts API
 *
 * Help community members tell their stories through guided prompts.
 */

import { NextResponse } from 'next/server';
import {
  STORY_TEMPLATES,
  getStoryTemplate,
  getTemplatesByCategory,
  generateFollowUpPrompts,
  generateStoryDraft,
  getCulturalGuidance
} from '@/lib/ai/story-prompts';
import { rateLimiter, getClientId } from '@/lib/ai/rate-limit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';
  const templateId = searchParams.get('template');
  const category = searchParams.get('category');

  try {
    switch (action) {
      case 'list':
        // List all templates
        if (category) {
          return NextResponse.json({
            templates: getTemplatesByCategory(category)
          });
        }
        return NextResponse.json({
          templates: STORY_TEMPLATES,
          categories: [...new Set(STORY_TEMPLATES.map(t => t.category))]
        });

      case 'template':
        // Get specific template
        if (!templateId) {
          return NextResponse.json({
            error: 'template parameter required'
          }, { status: 400 });
        }
        const template = getStoryTemplate(templateId);
        if (!template) {
          return NextResponse.json({
            error: 'Template not found'
          }, { status: 404 });
        }
        return NextResponse.json({ template });

      default:
        return NextResponse.json({
          error: 'Unknown action. Use: list, template'
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Story prompts GET error:', error);
    return NextResponse.json({
      error: error.message || 'Request failed'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Apply rate limiting
  const clientId = getClientId(request);
  const rateCheck = rateLimiter.check(clientId, 'ai');

  if (!rateCheck.allowed) {
    return NextResponse.json({
      error: 'Rate limit exceeded',
      retryAfter: rateCheck.retryAfter
    }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'follow-up': {
        // Generate follow-up prompts based on answers
        const { answers, templateId, count, focusArea } = body;

        if (!answers || Object.keys(answers).length === 0) {
          return NextResponse.json({
            error: 'answers object required'
          }, { status: 400 });
        }

        const prompts = await generateFollowUpPrompts(answers, templateId, {
          count,
          focusArea
        });

        return NextResponse.json({
          action: 'follow-up',
          prompts,
          timestamp: new Date().toISOString()
        });
      }

      case 'draft': {
        // Generate story draft from answers
        const { answers, title, style, includeQuotes } = body;

        if (!answers || Object.keys(answers).length === 0) {
          return NextResponse.json({
            error: 'answers object required'
          }, { status: 400 });
        }

        const draft = await generateStoryDraft(answers, {
          title,
          style,
          includeQuotes
        });

        return NextResponse.json({
          action: 'draft',
          ...draft,
          timestamp: new Date().toISOString()
        });
      }

      case 'cultural-guidance': {
        // Get cultural guidance for a topic
        const { topic, storyType } = body;

        if (!topic) {
          return NextResponse.json({
            error: 'topic required'
          }, { status: 400 });
        }

        const guidance = await getCulturalGuidance(topic, storyType || 'general');

        return NextResponse.json({
          action: 'cultural-guidance',
          ...guidance,
          timestamp: new Date().toISOString()
        });
      }

      default:
        return NextResponse.json({
          error: 'Unknown action. Use: follow-up, draft, cultural-guidance'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Story prompts POST error:', error);
    return NextResponse.json({
      error: error.message || 'Request failed'
    }, { status: 500 });
  }
}
