import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * POST /api/media/:id/rotate
 * Body: { degrees: 90 | 180 | 270 | -90, flip?: 'horizontal' | 'vertical' }
 *
 * Downloads the image from storage, applies rotation/flip with Sharp,
 * re-uploads to the same path, and updates dimensions in the database.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const degrees = Number(body.degrees || 0);
    const flip = body.flip as 'horizontal' | 'vertical' | undefined;

    if (!degrees && !flip) {
      return NextResponse.json(
        { error: 'Provide degrees (90, 180, 270, -90) or flip (horizontal, vertical)' },
        { status: 400 }
      );
    }

    if (degrees && ![90, 180, 270, -90].includes(degrees)) {
      return NextResponse.json(
        { error: 'degrees must be 90, 180, 270, or -90' },
        { status: 400 }
      );
    }

    const supabase = getServerClient();

    // 1. Get the media record
    const { data: media, error: fetchErr } = await supabase
      .from('media_files')
      .select('id, filename, file_path, bucket_name, mime_type, width, height, public_url')
      .eq('id', id)
      .single();

    if (fetchErr || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const storagePath = media.file_path || media.filename;
    const bucket = media.bucket_name || 'story-media';

    // 2. Download from storage
    const { data: blob, error: dlErr } = await supabase.storage
      .from(bucket)
      .download(storagePath);

    if (dlErr || !blob) {
      return NextResponse.json(
        { error: `Download failed: ${dlErr?.message}` },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());

    // 3. Apply transformation with Sharp
    let pipeline = sharp(buffer).withMetadata(); // preserve non-orientation EXIF

    if (degrees) {
      pipeline = pipeline.rotate(degrees);
    }
    if (flip === 'horizontal') {
      pipeline = pipeline.flop();
    } else if (flip === 'vertical') {
      pipeline = pipeline.flip();
    }

    const transformed = await pipeline.toBuffer();
    const metadata = await sharp(transformed).metadata();

    // 4. Re-upload to same path (overwrite)
    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(storagePath, transformed, {
        contentType: media.mime_type || 'image/jpeg',
        cacheControl: '0', // bust cache
        upsert: true,
      });

    if (uploadErr) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // 5. Update dimensions + bust cached public_url in database
    const basePublicUrl = (media.public_url || '').split('?')[0];
    const freshUrl = basePublicUrl ? `${basePublicUrl}?t=${Date.now()}` : undefined;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (metadata.width) updates.width = metadata.width;
    if (metadata.height) updates.height = metadata.height;
    if (freshUrl) updates.public_url = freshUrl;

    await supabase
      .from('media_files')
      .update(updates)
      .eq('id', id);

    return NextResponse.json({
      ok: true,
      width: metadata.width,
      height: metadata.height,
      transform: { degrees, flip },
    });
  } catch (err: any) {
    console.error('Rotate error:', err);
    return NextResponse.json(
      { error: err?.message || 'Rotation failed' },
      { status: 500 }
    );
  }
}
