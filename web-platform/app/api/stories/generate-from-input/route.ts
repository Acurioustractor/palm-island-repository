import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/stories/generate-from-input
 *
 * Generates a structured story from various input types:
 * - text: Raw interview transcript or notes
 * - structured: Template-based notes (who, what, impact, quote)
 *
 * Returns a draft story with title, content, suggested tags, and cultural flags.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input_type, text, structured, storyteller_name, is_elder } = body;

    if (!input_type || (!text && !structured)) {
      return NextResponse.json(
        { error: 'input_type and either text or structured data required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    let inputContent = '';

    if (input_type === 'structured' && structured) {
      inputContent = [
        structured.who && `Who: ${structured.who}`,
        structured.what && `What happened: ${structured.what}`,
        structured.impact && `Impact: ${structured.impact}`,
        structured.quote && `Direct quote: "${structured.quote}"`,
        structured.service && `Related service: ${structured.service}`,
        structured.context && `Additional context: ${structured.context}`,
      ].filter(Boolean).join('\n\n');
    } else {
      inputContent = text || '';
    }

    const elderContext = is_elder
      ? 'The storyteller is an ELDER - use respectful framing (Elder, Uncle/Aunty). Treat with utmost cultural sensitivity.'
      : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a story writer for the Palm Island Community Company (PICC), an Indigenous community-controlled organisation in Queensland, Australia.

Your task is to create a compelling, respectful community story from the provided input.

Guidelines:
- Write in third person but preserve direct quotes in first person
- Keep the storyteller's authentic voice
- Be culturally sensitive and respectful
- Focus on impact and transformation, not just activities
- Stories should be 300-500 words
- Use the structure: Context → Journey → Impact → Quote → Future
${elderContext}

Respond in JSON format with these fields:
{
  "title": "Compelling headline (max 80 chars)",
  "summary": "One-sentence summary (max 160 chars)",
  "content": "Full story text (300-500 words, use paragraph breaks)",
  "story_type": "one of: service_impact, elder_wisdom, youth_achievement, community_event, leadership_message",
  "emotional_theme": "one of: hope, resilience, pride, gratitude, determination, connection",
  "suggested_tags": ["array of relevant tags"],
  "key_quotes": ["array of direct quotes from the text"],
  "contains_traditional_knowledge": true/false,
  "cultural_sensitivity_level": "low/medium/high",
  "elder_approval_needed": true/false,
  "related_service": "service name if mentioned, or null"
}`
        },
        {
          role: 'user',
          content: `Create a story from this input:\n\nStoryteller: ${storyteller_name || 'Community Member'}\n\n${inputContent}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const story = JSON.parse(content);

    return NextResponse.json({
      success: true,
      story: {
        ...story,
        status: 'draft',
        access_level: 'internal',
        generated_by: 'ai',
        storyteller_name: storyteller_name || 'Community Member',
        is_elder_story: is_elder || story.elder_approval_needed || false,
      },
    });
  } catch (error: any) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
