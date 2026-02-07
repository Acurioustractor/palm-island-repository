import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Simple AI analysis (placeholder - we'll enhance this)
async function analyzeImage(file: File): Promise<string[]> {
  // For now, return basic tags based on file properties
  // TODO: Integrate with actual AI service (AWS Rekognition, Google Vision, etc.)

  const autoTags: string[] = [];

  // Add file type tag
  if (file.type.includes('jpeg') || file.type.includes('jpg')) {
    autoTags.push('photo');
  }

  // Add size category
  if (file.size > 5000000) {
    autoTags.push('high-resolution');
  }

  // Placeholder tags - these would come from AI
  // Example: autoTags.push('outdoor', 'people', 'event');

  return autoTags;
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
    const enableAI = formData.get('enableAI') === 'true';
    const projectSlug = (formData.get('projectSlug') as string) || '';
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
        `${supabaseUrl}/rest/v1/media_files?select=id,original_filename,file_size,public_url,created_at&original_filename=eq.${encodeURIComponent(file.name)}&file_size=eq.${file.size}&deleted_at=is.null&limit=1`,
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

        // If duplicate found, return specific response
        if (existingFiles && existingFiles.length > 0) {
          const duplicate = existingFiles[0];
          return NextResponse.json({
            error: 'duplicate',
            message: 'This file has already been uploaded',
            duplicate: {
              id: duplicate.id,
              filename: duplicate.original_filename,
              uploadedAt: duplicate.created_at,
              url: duplicate.public_url,
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

    // Run AI analysis if enabled
    let aiTags: string[] = [];
    if (enableAI) {
      aiTags = await analyzeImage(file);
    }

    // Combine tags
    const extraTags: string[] = [];
    if (collection) extraTags.push(`collection:${collection}`);
    if (year) extraTags.push(`year:${year}`);
    if (projectSlug?.trim()) extraTags.push(`project:${projectSlug.trim()}`);
    if (usageContext?.trim()) extraTags.push(`usage:${usageContext.trim()}`);

    const allTags = Array.from(new Set([...userTags, ...aiTags, ...extraTags]));

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
      uploaded_by: null, // No user context - bulk uploads don't require login
      project_id: projectId,
      usage_context: usageContext || null,
      metadata: {
        upload_year: year ? parseInt(year) : new Date().getFullYear(),
        collection: collection || null,
        ai_analyzed: enableAI,
        ai_tags: aiTags,
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

    return NextResponse.json({
      success: true,
      file: mediaFile,
      message: 'Photo uploaded successfully',
      aiTags: enableAI ? aiTags : null,
    });

  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
