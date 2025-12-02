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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 });
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
    const allTags = [...new Set([...userTags, ...aiTags])];

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
        contentType: file.type,
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

    // Create metadata record
    const mediaData = {
      filename: fileName,
      original_filename: file.name,
      file_path: fileName,
      bucket_name: 'story-media',
      public_url: publicUrl,
      file_type: 'image',
      mime_type: file.type,
      file_size: file.size,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: description || null,
      tags: allTags,
      uploaded_by: null, // No user context - bulk uploads don't require login
      metadata: {
        upload_year: year ? parseInt(year) : new Date().getFullYear(),
        collection: collection || null,
        ai_analyzed: enableAI,
        ai_tags: aiTags,
        user_tags: userTags,
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
