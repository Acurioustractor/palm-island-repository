import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const PICC_BRAND_VOICE = `You are a content writer for Palm Island Indigenous Community Council (PICC). Your job is to transform community stories into authentic social media posts.

BRAND VOICE GUIDELINES:

1. STORYTELLING-DRIVEN
   - Lead with real people and specific moments (kitchen tables, not programs)
   - Use concrete details, not abstract concepts
   - Let the story speak for itself

2. DIRECT & UNFLINCHING
   - Call out what's broken without sugar-coating
   - Use contrast (what works vs what gets funded)
   - Rhetorical questions that make people think
   - No platitudes or false optimism

3. ANTI-NGO SPEAK
   - NEVER use: "powerful story", "incredible work", "highlighting", "innovative interventions"
   - NEVER spam hashtags or use generic tags
   - NEVER mention "data sovereignty" unless the story is actually about data/control
   - Avoid academic language and buzzwords

4. RESPECT WITHOUT PLATITUDES
   - Show respect through specificity, not general praise
   - Honor people's actual words and experiences
   - Cultural stories need context, not celebration

5. ADAPT TO STORY TYPE
   - Major stories (new programs, trips): Full treatment with context
   - Fragments (brief moments): Skip social media OR one-line mention
   - Infrastructure issues (still waiting): Advocacy tone, call out failures
   - Cultural stories: Educational, respectful, contextual

EXAMPLE OF GOOD VOICE:
"There's an Elder in a remote town who's prevented more youth crime with their kitchen table than any million-dollar program ever has.

They don't have a grant. They don't write reports. They don't count 'attendance metrics.'

They just know every young person's story - who's struggling since their dad went inside, who needs a meal, who just needs someone to believe they're more than their worst day.

Meanwhile, 800km away in Sydney, professional grant writers craft perfect proposals about 'innovative interventions' for communities they've never visited, for young people they'll never meet.

Guess who gets the funding?"

WHAT TO AVOID:
❌ "This powerful story from Community Voice highlights the incredible work..."
❌ "#Empowerment #CommunityLed #DataSovereignty #Innovation" (unless genuinely relevant)
❌ "showcasing", "amplifying", "highlighting", "empowering"
❌ Treating everything like an achievement to celebrate

YOUR TASK:
Generate social media content that sounds like it was written by someone who actually lives this work, not a grant writer or marketing agency.`;

export async function POST(request: NextRequest) {
  try {
    const { story, platform } = await request.json();

    if (!story || !story.title || !story.content) {
      return NextResponse.json(
        { error: 'Story title and content required' },
        { status: 400 }
      );
    }

    // Analyze story to determine type
    const storyLength = story.content?.length || 0;
    const isFragment = storyLength < 200 || story.title.toLowerCase().includes('fragment');

    let platformGuidelines = '';
    let maxLength = 0;

    switch (platform) {
      case 'instagram':
        platformGuidelines = `Instagram post (2200 char limit):
- Can use 1-2 carefully chosen emoji if they add meaning
- 3-5 highly relevant hashtags max (avoid generic ones)
- Conversational but impactful
- Include "Link in bio" for full story`;
        maxLength = 2200;
        break;

      case 'facebook':
        platformGuidelines = `Facebook post:
- More conversational, community-focused
- Can be longer if story warrants it
- Direct language
- Minimal hashtags (1-3 max)`;
        maxLength = 5000;
        break;

      case 'linkedin':
        platformGuidelines = `LinkedIn post:
- Professional but authentic (not corporate)
- Can discuss systemic issues
- Good for advocacy and infrastructure stories
- Context over celebration
- 2-4 relevant hashtags`;
        maxLength = 3000;
        break;

      case 'twitter':
        platformGuidelines = `Twitter/X thread (280 chars per tweet):
- Punchy, direct
- Use thread format for longer stories (number tweets 1/, 2/, etc)
- Rhetorical questions work well
- 1-2 hashtags max`;
        maxLength = 280;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid platform' },
          { status: 400 }
        );
    }

    // Special handling for fragments
    if (isFragment) {
      return NextResponse.json({
        content: `[RECOMMENDATION: Skip social media for this fragment]

This appears to be a brief conversational fragment rather than a complete story. Consider:
- Saving it for a compilation post ("Voices from the storm" etc)
- Including it in a newsletter
- Or posting a very brief acknowledgment

If you want to post anyway, here's a minimal approach:
"${story.title.replace('Community Voice Fragment:', '').trim()}"

Sometimes the small moments matter too.`,
        suggestion: 'skip'
      });
    }

    const prompt = `${PICC_BRAND_VOICE}

STORY TITLE: ${story.title}

STORY CONTENT:
${story.content}

PLATFORM: ${platform}
${platformGuidelines}

Generate a ${platform} post that:
1. Captures the essence of this story in PICC's voice
2. Avoids NGO-speak and buzzwords
3. Adapts tone to story type (advocacy if about infrastructure issues, respectful if cultural, celebratory if genuine achievement)
4. Only mentions data sovereignty/community control if genuinely relevant to THIS story
5. Uses specific details from the story, not generic praise
6. Keeps hashtags minimal and relevant (not a spam list)

Return ONLY the social media post text, ready to copy and paste. No explanations or meta-commentary.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ content, suggestion: null });

  } catch (error: any) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
