/**
 * Audio/Video Transcription API
 *
 * Transcribe audio and video files using Whisper.
 */

import { NextResponse } from 'next/server';
import {
  transcribeAudio,
  transcribeFromUrl,
  formatTranscriptionWithTimestamps,
  extractHighlights
} from '@/lib/ai/transcription';
import { rateLimiter, getClientId } from '@/lib/ai/rate-limit';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  // Apply rate limiting (transcription is expensive: 5/min like PDF)
  const clientId = getClientId(request);
  const rateCheck = rateLimiter.check(clientId, 'pdf');

  if (!rateCheck.allowed) {
    return NextResponse.json({
      error: 'Rate limit exceeded',
      retryAfter: rateCheck.retryAfter,
      message: `Too many requests. Please try again in ${rateCheck.retryAfter} seconds.`
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateCheck.resetAt).toISOString(),
        'Retry-After': rateCheck.retryAfter?.toString() || '60'
      }
    });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    let result;
    let options: any = {};

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = (formData.get('file') || formData.get('audio')) as File;
      const generateStory = formData.get('generateStory') === 'true';

      if (!file) {
        return NextResponse.json({
          error: 'No file uploaded'
        }, { status: 400 });
      }

      // Check file type
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'video/mp4', 'video/webm', 'audio/ogg'];
      if (!validTypes.some(t => file.type.includes(t.split('/')[1]))) {
        return NextResponse.json({
          error: 'File must be MP3, WAV, M4A, MP4, WebM, or OGG'
        }, { status: 400 });
      }

      // Check file size (max 25MB for Whisper)
      if (file.size > 25 * 1024 * 1024) {
        return NextResponse.json({
          error: 'File must be under 25MB'
        }, { status: 400 });
      }

      options = {
        language: formData.get('language') as string || undefined,
        prompt: formData.get('prompt') as string || undefined,
        includeTimestamps: formData.get('timestamps') !== 'false',
        includeWords: formData.get('words') === 'true'
      };

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      result = await transcribeAudio(buffer, file.name, options);

      // Generate story draft if requested
      if (generateStory && result.text && result.text.length > 50) {
        try {
          const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
          });

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 800,
            system: `You are helping process an oral history recording from Palm Island community.
Create a respectful, accurate story draft from the transcription.
Preserve the speaker's voice, dialect, and message authentically.`,
            messages: [{
              role: 'user',
              content: `Transcription of oral story:
"${result.text}"

Create a story draft with:
1. A compelling title that captures the essence
2. The content (cleaned up for readability but preserving voice)
3. A brief 2-sentence summary

Respond with JSON only:
{
  "title": "...",
  "content": "...",
  "summary": "..."
}`
            }]
          });

          const text = response.content[0].type === 'text' ? response.content[0].text : '';
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            (result as any).storyDraft = JSON.parse(jsonMatch[0]);
          }
        } catch (err) {
          console.error('Story generation error:', err);
        }
      }

    } else {
      // Handle JSON with URL
      const body = await request.json();

      if (!body.url) {
        return NextResponse.json({
          error: 'No URL provided. Send as multipart/form-data with file, or JSON with url field'
        }, { status: 400 });
      }

      options = {
        language: body.language,
        prompt: body.prompt,
        includeTimestamps: body.timestamps !== false,
        includeWords: body.words === true
      };

      result = await transcribeFromUrl(body.url, options);
    }

    // Format output
    const format = (request.headers.get('accept')?.includes('text/vtt') ? 'vtt' :
                   request.headers.get('accept')?.includes('text/srt') ? 'srt' : 'json');

    if (format === 'vtt') {
      const vtt = formatTranscriptionWithTimestamps(result, { format: 'vtt' });
      return new Response(vtt, {
        headers: { 'Content-Type': 'text/vtt' }
      });
    }

    if (format === 'srt') {
      const srt = formatTranscriptionWithTimestamps(result, { format: 'srt' });
      return new Response(srt, {
        headers: { 'Content-Type': 'text/srt' }
      });
    }

    return NextResponse.json({
      transcription: result,
      storyDraft: (result as any).storyDraft || null,
      formatted: {
        text: formatTranscriptionWithTimestamps(result, { format: 'text', includeTimestamps: true }),
        html: formatTranscriptionWithTimestamps(result, { format: 'html' })
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Transcription error:', error);
    return NextResponse.json({
      error: error.message || 'Transcription failed'
    }, { status: 500 });
  }
}

// GET endpoint for API info
export async function GET() {
  return NextResponse.json({
    name: 'Audio/Video Transcription API',
    version: '1.0.0',
    description: 'Transcribe audio and video files using OpenAI Whisper',
    supportedFormats: ['mp3', 'mp4', 'm4a', 'wav', 'webm', 'ogg'],
    maxFileSize: '25MB',
    usage: {
      multipart: {
        method: 'POST',
        contentType: 'multipart/form-data',
        fields: {
          file: 'Audio/video file',
          language: 'Language code (optional, auto-detected)',
          prompt: 'Context prompt for better accuracy (optional)',
          timestamps: 'Include timestamps (default: true)',
          words: 'Include word-level timestamps (default: false)'
        }
      },
      json: {
        method: 'POST',
        contentType: 'application/json',
        body: {
          url: 'URL to audio/video file',
          language: 'Language code (optional)',
          prompt: 'Context prompt (optional)'
        }
      }
    },
    outputFormats: {
      json: 'Full transcription with segments (default)',
      vtt: 'WebVTT subtitle format (Accept: text/vtt)',
      srt: 'SRT subtitle format (Accept: text/srt)'
    },
    example: {
      curl: 'curl -X POST -F "file=@interview.mp3" http://localhost:3000/api/ai/transcribe'
    }
  });
}
