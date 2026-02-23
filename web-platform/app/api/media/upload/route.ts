import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractGpsFromBuffer } from '@/lib/media/extract-exif';
import Anthropic from '@anthropic-ai/sdk';

// Server-side Supabase client with service role (bypasses RLS)
function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Simplified report-aligned tag taxonomy */
const VALID_TAGS = [
  'community', 'youth', 'culture', 'services', 'staff',
  'landscape', 'event', 'hero-quality', 'portrait', 'group',
  'aerial', 'close-up', 'wide',
] as const;

const AI_ANALYSIS_PROMPT = `Analyze this photo from Palm Island (Bwgcolman), an Aboriginal community.

Assign 2-5 tags from ONLY these: community, youth, culture, services, staff, landscape, event, hero-quality, portrait, group, aerial, close-up, wide
- hero-quality: only if high-res, well-composed, suitable as cover/full-page
- portrait: 1 person is the clear subject
- group: 3+ people visible
- landscape: scenery, place, environment with no/minimal people

Return JSON: { "tags": [...], "description": "1-2 sentences", "alt_text": "max 125 chars" }
Return ONLY the JSON, no other text.`;

/** Fire-and-forget AI analysis for a newly uploaded image */
async function analyzeImageAsync(mediaId: string, publicUrl: string) {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'url', url: publicUrl } },
          { type: 'text', text: AI_ANALYSIS_PROMPT },
        ],
      }],
    });

    const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error(`AI analysis for ${mediaId}: no JSON in response`);
      return;
    }

    const analysis = JSON.parse(jsonMatch[0]);
    const aiTags: string[] = (analysis.tags || [])
      .filter((t: string) => VALID_TAGS.includes(t as any));

    const supabase = getServerClient();
    const now = new Date().toISOString();

    // Get existing metadata to merge
    const { data: existing } = await supabase
      .from('media_files')
      .select('metadata')
      .eq('id', mediaId)
      .single();

    await supabase
      .from('media_files')
      .update({
        tags: aiTags,
        description: analysis.description || null,
        alt_text: analysis.alt_text || null,
        metadata: {
          ...(existing?.metadata || {}),
          ai_analysis: { analyzed_at: now },
        },
      })
      .eq('id', mediaId);

    console.log(`AI analysis complete for ${mediaId}: ${aiTags.join(', ')}`);
  } catch (err: any) {
    console.error(`AI analysis failed for ${mediaId}:`, err?.message);
  }
}

function normalizeStorageMimeType(file: File): string | undefined {
  const reported = file.type || '';
  const name = (file as any)?.name ? String((file as any).name).toLowerCase() : '';
  const ext = name.includes('.') ? name.split('.').pop() : '';

  if (reported === 'video/quicktime' || ext === 'mov') return 'video/mp4';
  if (!reported && ext === 'mp4') return 'video/mp4';
  if (!reported && ext === 'webm') return 'video/webm';

  return reported || undefined;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient();
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const tagsJson = formData.get('tags') as string;
    const year = formData.get('year') as string;
    const description = formData.get('description') as string;
    const collection = formData.get('collection') as string;
    const enableAI = formData.get('enableAI') !== 'false'; // default true
    const projectSlug = (formData.get('projectSlug') as string) || '';
    const serviceSlug = (formData.get('serviceSlug') as string) || '';
    const usageContext = (formData.get('usageContext') as string) || '';
    const title = (formData.get('title') as string) || '';
    const altText = (formData.get('altText') as string) || '';
    const caption = (formData.get('caption') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size before upload attempt
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB - story-media bucket limit
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
    const fileIsVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mov') || file.name.toLowerCase().endsWith('.mp4');
    const maxSize = fileIsVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maxLabel = fileIsVideo ? '50MB' : '10MB';

    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json({
        error: 'file_too_large',
        message: `File is ${fileSizeMB}MB but the maximum is ${maxLabel}. Please resize the image before uploading.`,
        details: {
          fileSize: file.size,
          maxSize,
          fileName: file.name,
        }
      }, { status: 413 });
    }

    // Validate file type
    const normalizedContentType = normalizeStorageMimeType(file) || file.type;
    const isImage = normalizedContentType.startsWith('image/');
    const isVideo = normalizedContentType.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Only image and video files allowed' }, { status: 400 });
    }

    // Check for duplicates using direct fetch (faster and more reliable than Supabase client)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      const duplicateResponse = await fetch(
        `${supabaseUrl}/rest/v1/media_files?select=id,original_filename,file_size,public_url,created_at,latitude,longitude,tags&original_filename=eq.${encodeURIComponent(file.name)}&file_size=eq.${file.size}&deleted_at=is.null&limit=1`,
        {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );

      if (duplicateResponse.ok) {
        const existingFiles = await duplicateResponse.json();

        // If duplicate found, backfill GPS if missing, then return
        if (existingFiles && existingFiles.length > 0) {
          const duplicate = existingFiles[0];

          // Backfill GPS data if the duplicate record lacks it
          if (!duplicate.latitude && !duplicate.longitude && file.type.startsWith('image/')) {
            try {
              const arrayBuf = await file.arrayBuffer();
              const buf = Buffer.from(arrayBuf);
              const gps = await extractGpsFromBuffer(buf);
              if (gps) {
                duplicate.latitude = gps.latitude;
                duplicate.longitude = gps.longitude;
                // Persist to DB
                await fetch(
                  `${supabaseUrl}/rest/v1/media_files?id=eq.${duplicate.id}`,
                  {
                    method: 'PATCH',
                    headers: {
                      'apikey': supabaseServiceKey,
                      'Authorization': `Bearer ${supabaseServiceKey}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ latitude: gps.latitude, longitude: gps.longitude }),
                  }
                );
              }
            } catch (gpsErr) {
              console.error('GPS backfill error:', gpsErr);
            }
          }

          return NextResponse.json({
            error: 'duplicate',
            message: 'This file has already been uploaded',
            duplicate: {
              id: duplicate.id,
              filename: duplicate.original_filename,
              uploadedAt: duplicate.created_at,
              url: duplicate.public_url,
              public_url: duplicate.public_url,
              latitude: duplicate.latitude,
              longitude: duplicate.longitude,
              tags: duplicate.tags,
            },
          }, { status: 409 }); // 409 Conflict
        }
      } else {
        console.error('Duplicate check failed, continuing with upload');
        // Continue anyway - don't block upload on duplicate check failure
      }
    } catch (dupError) {
      console.error('Duplicate check error:', dupError);
      // Continue anyway - don't block upload on duplicate check failure
    }

    // Parse tags
    let userTags: string[] = [];
    try {
      userTags = JSON.parse(tagsJson || '[]');
    } catch {
      userTags = [];
    }

    // Combine tags (user tags only — AI tags applied async after upload)
    const extraTags: string[] = [];
    if (collection) extraTags.push(`collection:${collection}`);
    if (year) extraTags.push(`year:${year}`);
    if (projectSlug?.trim()) extraTags.push(`project:${projectSlug.trim()}`);
    if (serviceSlug?.trim()) { extraTags.push(`service:${serviceSlug.trim()}`); extraTags.push('services'); }
    if (usageContext?.trim()) extraTags.push(`usage:${usageContext.trim()}`);

    const allTags = Array.from(new Set([...userTags, ...extraTags]));

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract GPS coordinates from EXIF data (images only)
    let gpsData: { latitude: number; longitude: number } | null = null;
    if (isImage) {
      gpsData = await extractGpsFromBuffer(buffer);
    }

    // Upload to Supabase Storage (story-media bucket)
    const { error: uploadError } = await supabase.storage
      .from('story-media')
      .upload(fileName, buffer, {
        contentType: normalizedContentType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('story-media')
      .getPublicUrl(fileName);

    let projectId: string | null = null;
    if (projectSlug?.trim()) {
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectSlug.trim())
        .maybeSingle();
      projectId = project?.id || null;
    }

    // Create metadata record
    const mediaData = {
      filename: fileName,
      original_filename: file.name,
      file_path: fileName,
      bucket_name: 'story-media',
      public_url: publicUrl,
      file_type: isVideo ? 'video' : 'image',
      mime_type: normalizedContentType,
      file_size: file.size,
      title: title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: description || null,
      alt_text: altText || null,
      caption: caption || null,
      tags: allTags,
      latitude: gpsData?.latitude ?? null,
      longitude: gpsData?.longitude ?? null,
      uploaded_by: null, // No user context - bulk uploads don't require login
      project_id: projectId,
      usage_context: usageContext || null,
      metadata: {
        upload_year: year ? parseInt(year) : new Date().getFullYear(),
        collection: collection || null,
        ai_analyzed: enableAI,
        user_tags: userTags,
        ...(normalizedContentType !== file.type ? { original_mime_type: file.type } : {}),
      },
      tenant_id: process.env.NEXT_PUBLIC_TENANT_ID,
    };

    // Insert using direct fetch (faster and more reliable than Supabase client)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/media_files`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation', // Return the inserted row
        },
        body: JSON.stringify(mediaData),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('Database insert error:', insertResponse.status, errorText);
      return NextResponse.json({ error: `Database error: ${errorText}` }, { status: 500 });
    }

    const [mediaFile] = await insertResponse.json();

    // Fire-and-forget: AI analysis runs async after response is sent
    if (enableAI && isImage) {
      analyzeImageAsync(mediaFile.id, publicUrl).catch((err) => {
        console.error('Background AI analysis error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      file: mediaFile,
      message: 'Photo uploaded successfully',
      aiPending: enableAI && isImage,
    });

  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
