/**
 * AI Summarization API
 *
 * Provides endpoints for:
 * - Content summarization
 * - Metadata extraction
 * - Auto-categorization
 */

import { NextResponse } from 'next/server';
import {
  summarizeContent,
  extractMetadata,
  generateOneLiner,
  categorizeContent
} from '@/lib/ai/summarization';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      content,
      title,
      action = 'summarize', // summarize, metadata, oneliner, categorize
      options = {}
    } = body;

    if (!content || content.trim().length < 50) {
      return NextResponse.json({
        error: 'Content must be at least 50 characters'
      }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'summarize':
        result = await summarizeContent(content, {
          maxLength: options.maxLength || 100,
          style: options.style || 'concise',
          preserveCulturalContext: options.preserveCulturalContext !== false,
          extractKeyPoints: options.extractKeyPoints !== false
        });
        break;

      case 'metadata':
        result = await extractMetadata(content, title);
        break;

      case 'oneliner':
        const oneLiner = await generateOneLiner(content, title);
        result = { oneLiner };
        break;

      case 'categorize':
        result = await categorizeContent(content);
        break;

      default:
        return NextResponse.json({
          error: `Unknown action: ${action}. Use: summarize, metadata, oneliner, categorize`
        }, { status: 400 });
    }

    return NextResponse.json({
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Summarization API error:', error);
    return NextResponse.json({
      error: error.message || 'Summarization failed'
    }, { status: 500 });
  }
}

// GET endpoint for API info
export async function GET() {
  return NextResponse.json({
    name: 'AI Summarization API',
    version: '1.0.0',
    actions: {
      summarize: {
        description: 'Generate a summary of content',
        options: {
          maxLength: 'Target word count (default: 100)',
          style: 'concise | detailed | bullet-points',
          preserveCulturalContext: 'Respect Indigenous context (default: true)',
          extractKeyPoints: 'Extract key points (default: true)'
        }
      },
      metadata: {
        description: 'Extract structured metadata from content',
        options: {
          title: 'Optional existing title'
        }
      },
      oneliner: {
        description: 'Generate a one-line description',
        options: {
          title: 'Optional existing title'
        }
      },
      categorize: {
        description: 'Auto-categorize content',
        returns: 'primary category, secondary categories, confidence'
      }
    },
    example: {
      method: 'POST',
      body: {
        content: 'Your content here...',
        action: 'summarize',
        options: { maxLength: 100, style: 'concise' }
      }
    }
  });
}
