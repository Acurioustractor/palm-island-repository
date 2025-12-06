/**
 * Claude Vision API
 *
 * Analyze images using Claude's vision capabilities
 */

import { NextResponse } from 'next/server';
import {
  analyzeImage,
  analyzeCulturalContent,
  extractTextFromImage,
  generateAltText,
  compareImages
} from '@/lib/ai/vision';
import { rateLimiter, getClientId } from '@/lib/ai/rate-limit';

export async function POST(request: Request) {
  // Apply rate limiting (vision is expensive: 10/min)
  const clientId = getClientId(request);
  const rateCheck = rateLimiter.check(clientId, 'vision');

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

    let imageSource: string | Buffer;
    let action = 'analyze';
    let options: Record<string, unknown> = {};

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      action = (formData.get('action') as string) || 'analyze';

      if (!file) {
        return NextResponse.json({
          error: 'No file uploaded'
        }, { status: 400 });
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({
          error: 'File must be JPEG, PNG, GIF, or WebP'
        }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      imageSource = Buffer.from(arrayBuffer);

      // Parse options from form data
      const optionsStr = formData.get('options') as string;
      if (optionsStr) {
        try {
          options = JSON.parse(optionsStr);
        } catch {
          // Ignore invalid options
        }
      }
    } else {
      // Handle JSON
      const body = await request.json();

      if (!body.image && !body.url) {
        return NextResponse.json({
          error: 'No image provided. Send as multipart/form-data with file, or JSON with image (base64) or url field'
        }, { status: 400 });
      }

      imageSource = body.url || body.image;
      action = body.action || 'analyze';
      options = body.options || {};
    }

    let result;

    switch (action) {
      case 'analyze':
        // Full image analysis
        result = await analyzeImage(imageSource, {
          generateAltText: options.generateAltText !== false,
          detectCulturalContent: options.detectCulturalContent !== false,
          extractText: options.extractText !== false,
          detailed: options.detailed === true
        });
        break;

      case 'cultural':
        // Cultural content analysis
        result = await analyzeCulturalContent(imageSource);
        break;

      case 'ocr':
        // Text extraction
        result = await extractTextFromImage(imageSource);
        break;

      case 'alt-text':
        // Generate alt text only
        result = await generateAltText(imageSource, options.context as string);
        break;

      case 'compare':
        // Compare two images
        if (!options.compareWith) {
          return NextResponse.json({
            error: 'compareWith option required for compare action'
          }, { status: 400 });
        }
        result = await compareImages(imageSource, options.compareWith as string);
        break;

      default:
        return NextResponse.json({
          error: `Unknown action: ${action}. Use: analyze, cultural, ocr, alt-text, compare`
        }, { status: 400 });
    }

    return NextResponse.json({
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Vision API error:', error);
    return NextResponse.json({
      error: error.message || 'Image analysis failed'
    }, { status: 500 });
  }
}

// GET endpoint for API info
export async function GET() {
  return NextResponse.json({
    name: 'Claude Vision API',
    version: '1.0.0',
    description: 'Analyze images using Claude\'s vision capabilities',
    actions: {
      analyze: {
        description: 'Full image analysis with metadata extraction',
        options: {
          generateAltText: 'Generate accessibility alt text (default: true)',
          detectCulturalContent: 'Identify Indigenous cultural elements (default: true)',
          extractText: 'Extract visible text (default: true)',
          detailed: 'Generate detailed descriptions (default: false)'
        }
      },
      cultural: {
        description: 'Analyze image for Indigenous cultural content and sensitivity'
      },
      ocr: {
        description: 'Extract text from image (OCR)'
      },
      'alt-text': {
        description: 'Generate accessible alt text',
        options: {
          context: 'Usage context for better alt text'
        }
      },
      compare: {
        description: 'Compare two images',
        options: {
          compareWith: 'URL or base64 of second image (required)'
        }
      }
    },
    usage: {
      multipart: {
        method: 'POST',
        contentType: 'multipart/form-data',
        fields: {
          file: 'Image file (JPEG, PNG, GIF, WebP)',
          action: 'Analysis action (optional, default: analyze)',
          options: 'JSON string of options (optional)'
        }
      },
      json: {
        method: 'POST',
        contentType: 'application/json',
        body: {
          image: 'Base64 encoded image',
          url: 'OR image URL',
          action: 'Analysis action (optional)',
          options: 'Analysis options (optional)'
        }
      }
    },
    example: {
      curl: 'curl -X POST -F "file=@photo.jpg" -F "action=analyze" http://localhost:3000/api/ai/vision',
      json: {
        url: 'https://example.com/image.jpg',
        action: 'cultural'
      }
    }
  });
}
