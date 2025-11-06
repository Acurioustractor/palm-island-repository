import { NextRequest, NextResponse } from 'next/server';
import { generateStoryEmbedding, generateDocumentEmbedding } from '@/lib/openai/embeddings';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing required fields: type and id' },
        { status: 400 }
      );
    }

    if (type === 'story') {
      await generateStoryEmbedding(id);
      return NextResponse.json({
        success: true,
        message: `Generated embedding for story ${id}`
      });
    } else if (type === 'document') {
      await generateDocumentEmbedding(id);
      return NextResponse.json({
        success: true,
        message: `Generated embedding for document ${id}`
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "story" or "document"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}
