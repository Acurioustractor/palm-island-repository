/**
 * Claude Vision Integration
 *
 * Analyze images for:
 * - Content description and alt text generation
 * - Cultural content identification
 * - Text extraction (OCR)
 * - Object and scene detection
 * - Accessibility improvements
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

type MediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

interface ImageAnalysis {
  description: string;
  altText: string;
  detailedDescription: string;
  objects: string[];
  people: {
    count: number;
    descriptions: string[];
  };
  text: {
    found: boolean;
    content: string[];
  };
  colors: string[];
  mood: string;
  culturalElements: {
    found: boolean;
    elements: string[];
    significance: string;
  };
  tags: string[];
  accessibility: {
    altText: string;
    longDescription: string;
  };
}

interface CulturalAnalysis {
  isIndigenousContent: boolean;
  culturalElements: string[];
  traditionalPractices: string[];
  significance: string;
  sensitivityLevel: 'public' | 'community' | 'restricted';
  recommendedContext: string;
}

interface OCRResult {
  text: string;
  blocks: {
    text: string;
    type: 'heading' | 'paragraph' | 'list' | 'caption' | 'other';
    confidence: 'high' | 'medium' | 'low';
  }[];
  language: string;
}

/**
 * Analyze an image and generate comprehensive metadata
 */
export async function analyzeImage(
  imageSource: string | Buffer,
  options: {
    generateAltText?: boolean;
    detectCulturalContent?: boolean;
    extractText?: boolean;
    detailed?: boolean;
  } = {}
): Promise<ImageAnalysis> {
  const {
    generateAltText = true,
    detectCulturalContent = true,
    extractText = true,
    detailed = false
  } = options;

  // Prepare image source
  let imageContent: Anthropic.ImageBlockParam;

  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('http')) {
      // URL-based image
      imageContent = {
        type: 'image',
        source: {
          type: 'url',
          url: imageSource
        }
      };
    } else {
      // Base64 string
      const mediaType = detectMediaType(imageSource);
      imageContent = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageSource.replace(/^data:image\/\w+;base64,/, '')
        }
      };
    }
  } else {
    // Buffer
    const base64 = imageSource.toString('base64');
    imageContent = {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64
      }
    };
  }

  const prompt = `Analyze this image comprehensively. This is for the Palm Island Community Company website, so pay special attention to any Indigenous Australian cultural content.

Please provide a JSON response with:

1. description: A clear, objective 1-2 sentence description
2. altText: Concise alt text for accessibility (max 125 characters)
3. detailedDescription: ${detailed ? 'A detailed 3-4 sentence description' : 'A brief description'}
4. objects: Array of main objects/elements visible
5. people: { count: number, descriptions: brief descriptions of people if any }
6. text: { found: boolean, content: any text visible in the image }
7. colors: Primary colors in the image
8. mood: The overall mood/feeling (e.g., "joyful", "serene", "ceremonial")
9. culturalElements: {
   found: boolean,
   elements: any Indigenous/cultural elements like art, artifacts, ceremonies, traditional activities,
   significance: brief cultural significance if identifiable
}
10. tags: Array of keywords for search/categorization
11. accessibility: {
    altText: screen reader friendly description,
    longDescription: extended description for complex images
}

Return ONLY valid JSON.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          imageContent,
          { type: 'text', text: prompt }
        ]
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      description: parsed.description || '',
      altText: parsed.altText || '',
      detailedDescription: parsed.detailedDescription || '',
      objects: parsed.objects || [],
      people: parsed.people || { count: 0, descriptions: [] },
      text: parsed.text || { found: false, content: [] },
      colors: parsed.colors || [],
      mood: parsed.mood || '',
      culturalElements: parsed.culturalElements || { found: false, elements: [], significance: '' },
      tags: parsed.tags || [],
      accessibility: parsed.accessibility || { altText: '', longDescription: '' }
    };
  } catch {
    return {
      description: 'Image analysis failed',
      altText: 'Image',
      detailedDescription: '',
      objects: [],
      people: { count: 0, descriptions: [] },
      text: { found: false, content: [] },
      colors: [],
      mood: '',
      culturalElements: { found: false, elements: [], significance: '' },
      tags: [],
      accessibility: { altText: 'Image', longDescription: '' }
    };
  }
}

/**
 * Analyze image for cultural content and sensitivity
 */
export async function analyzeCulturalContent(
  imageSource: string | Buffer
): Promise<CulturalAnalysis> {
  let imageContent: Anthropic.ImageBlockParam;

  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('http')) {
      imageContent = {
        type: 'image',
        source: {
          type: 'url',
          url: imageSource
        }
      };
    } else {
      const mediaType = detectMediaType(imageSource);
      imageContent = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageSource.replace(/^data:image\/\w+;base64,/, '')
        }
      };
    }
  } else {
    const base64 = imageSource.toString('base64');
    imageContent = {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64
      }
    };
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are an expert in Indigenous Australian culture, particularly from Palm Island and the Torres Strait region.
Analyze images for cultural content with sensitivity and respect.
Be careful to identify sacred or ceremonial content that may have restricted viewing.`,
    messages: [
      {
        role: 'user',
        content: [
          imageContent,
          {
            type: 'text',
            text: `Analyze this image for Indigenous Australian cultural content.

Provide a JSON response with:
1. isIndigenousContent: boolean - does this contain Indigenous cultural elements?
2. culturalElements: Array of identified cultural elements (art styles, symbols, locations, etc.)
3. traditionalPractices: Any traditional practices or ceremonies depicted
4. significance: Cultural significance or context
5. sensitivityLevel: "public" (can be shared freely), "community" (should be shared with context), or "restricted" (may have cultural viewing restrictions)
6. recommendedContext: Suggested caption or context when sharing

Return ONLY valid JSON.`
          }
        ]
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      isIndigenousContent: parsed.isIndigenousContent || false,
      culturalElements: parsed.culturalElements || [],
      traditionalPractices: parsed.traditionalPractices || [],
      significance: parsed.significance || '',
      sensitivityLevel: parsed.sensitivityLevel || 'public',
      recommendedContext: parsed.recommendedContext || ''
    };
  } catch {
    return {
      isIndigenousContent: false,
      culturalElements: [],
      traditionalPractices: [],
      significance: '',
      sensitivityLevel: 'public',
      recommendedContext: ''
    };
  }
}

/**
 * Extract text from image (OCR)
 */
export async function extractTextFromImage(
  imageSource: string | Buffer
): Promise<OCRResult> {
  let imageContent: Anthropic.ImageBlockParam;

  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('http')) {
      imageContent = {
        type: 'image',
        source: {
          type: 'url',
          url: imageSource
        }
      };
    } else {
      const mediaType = detectMediaType(imageSource);
      imageContent = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageSource.replace(/^data:image\/\w+;base64,/, '')
        }
      };
    }
  } else {
    const base64 = imageSource.toString('base64');
    imageContent = {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64
      }
    };
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          imageContent,
          {
            type: 'text',
            text: `Extract all visible text from this image.

Provide a JSON response with:
1. text: All text combined as a single string
2. blocks: Array of text blocks, each with:
   - text: The text content
   - type: "heading", "paragraph", "list", "caption", or "other"
   - confidence: "high", "medium", or "low"
3. language: Detected language of the text

Return ONLY valid JSON. If no text is visible, return { "text": "", "blocks": [], "language": "unknown" }`
          }
        ]
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      text: parsed.text || '',
      blocks: parsed.blocks || [],
      language: parsed.language || 'unknown'
    };
  } catch {
    return {
      text: '',
      blocks: [],
      language: 'unknown'
    };
  }
}

/**
 * Generate alt text for an image
 */
export async function generateAltText(
  imageSource: string | Buffer,
  context?: string
): Promise<{ altText: string; longDescription: string }> {
  let imageContent: Anthropic.ImageBlockParam;

  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('http')) {
      imageContent = {
        type: 'image',
        source: {
          type: 'url',
          url: imageSource
        }
      };
    } else {
      const mediaType = detectMediaType(imageSource);
      imageContent = {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: imageSource.replace(/^data:image\/\w+;base64,/, '')
        }
      };
    }
  } else {
    const base64 = imageSource.toString('base64');
    imageContent = {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64
      }
    };
  }

  const contextPrompt = context ? `\nContext: This image is used for ${context}.` : '';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          imageContent,
          {
            type: 'text',
            text: `Generate accessible alt text for this image.${contextPrompt}

Provide a JSON response with:
1. altText: Concise description (max 125 characters) for screen readers
2. longDescription: Detailed description for complex images (2-3 sentences)

Guidelines:
- Be objective and descriptive
- Include cultural context where relevant
- Don't start with "Image of" or "Photo of"
- Describe key visual elements and actions

Return ONLY valid JSON.`
          }
        ]
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      altText: parsed.altText || 'Image',
      longDescription: parsed.longDescription || ''
    };
  } catch {
    return {
      altText: 'Image',
      longDescription: ''
    };
  }
}

/**
 * Compare two images for similarity/differences
 */
export async function compareImages(
  image1Source: string | Buffer,
  image2Source: string | Buffer
): Promise<{
  similarity: number;
  differences: string[];
  commonElements: string[];
  recommendation: string;
}> {
  const prepareImage = (source: string | Buffer): Anthropic.ImageBlockParam => {
    if (typeof source === 'string') {
      if (source.startsWith('http')) {
        return {
          type: 'image',
          source: { type: 'url', url: source }
        };
      } else {
        const mediaType = detectMediaType(source);
        return {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: source.replace(/^data:image\/\w+;base64,/, '')
          }
        };
      }
    } else {
      return {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: source.toString('base64')
        }
      };
    }
  };

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          prepareImage(image1Source),
          prepareImage(image2Source),
          {
            type: 'text',
            text: `Compare these two images.

Provide a JSON response with:
1. similarity: Percentage similarity (0-100)
2. differences: Array of key differences
3. commonElements: Array of shared elements
4. recommendation: Whether these could be duplicates or variants

Return ONLY valid JSON.`
          }
        ]
      }
    ]
  });

  const textContent = response.content.find(c => c.type === 'text');

  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return {
      similarity: parsed.similarity || 0,
      differences: parsed.differences || [],
      commonElements: parsed.commonElements || [],
      recommendation: parsed.recommendation || ''
    };
  } catch {
    return {
      similarity: 0,
      differences: [],
      commonElements: [],
      recommendation: 'Analysis failed'
    };
  }
}

/**
 * Detect media type from base64 string or filename
 */
function detectMediaType(source: string): MediaType {
  if (source.startsWith('data:image/')) {
    const match = source.match(/^data:image\/(jpeg|png|gif|webp);/);
    if (match) {
      return `image/${match[1]}` as MediaType;
    }
  }

  // Default to JPEG
  return 'image/jpeg';
}

/**
 * Batch analyze multiple images
 */
export async function batchAnalyzeImages(
  images: Array<{ id: string; source: string | Buffer }>,
  options: {
    generateAltText?: boolean;
    detectCulturalContent?: boolean;
  } = {}
): Promise<Map<string, ImageAnalysis>> {
  const results = new Map<string, ImageAnalysis>();

  // Process in parallel with concurrency limit
  const batchSize = 3;

  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (img) => {
        const analysis = await analyzeImage(img.source, options);
        return { id: img.id, analysis };
      })
    );

    batchResults.forEach(({ id, analysis }) => {
      results.set(id, analysis);
    });
  }

  return results;
}
