import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// POST - Upload a new profile image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params;
    const supabase = getServerClient();

    // Verify the profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name')
      .eq('id', storytellerId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const fileName = `profile-images/${storytellerId}-${timestamp}.${fileExt}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('story-media')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('story-media').getPublicUrl(fileName);

    // Create media_files record to track this image
    const mediaData = {
      filename: fileName.split('/').pop(),
      original_filename: file.name,
      file_path: fileName,
      bucket_name: 'story-media',
      public_url: publicUrl,
      file_type: 'image',
      mime_type: file.type,
      file_size: file.size,
      title: `Profile photo - ${profile.preferred_name || profile.full_name}`,
      description: `Profile image for ${profile.preferred_name || profile.full_name}`,
      tags: ['profile-image', `profile:${storytellerId}`],
      metadata: {
        profile_id: storytellerId,
        profile_name: profile.preferred_name || profile.full_name,
        upload_type: 'profile_image',
        uploaded_at: new Date().toISOString(),
      },
      tenant_id: process.env.NEXT_PUBLIC_TENANT_ID,
    };

    const { data: mediaFile, error: mediaError } = await supabase
      .from('media_files')
      .insert(mediaData)
      .select()
      .single();

    if (mediaError) {
      console.error('Media insert error:', mediaError);
      // Continue anyway - the image is uploaded, just not tracked
    }

    // Update the profile with the new image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_image_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storytellerId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaFile: mediaFile || null,
      message: 'Profile image uploaded successfully',
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// GET - Get all profile images for a storyteller (from media_files)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params;
    const supabase = getServerClient();

    // Get current profile with image
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, profile_image_url')
      .eq('id', storytellerId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all profile images from media_files
    const { data: mediaFiles, error: mediaError } = await supabase
      .from('media_files')
      .select('id, public_url, title, created_at, file_size, metadata')
      .contains('tags', ['profile-image'])
      .contains('tags', [`profile:${storytellerId}`])
      .order('created_at', { ascending: false });

    // Also search by metadata for older uploads
    const { data: metadataFiles } = await supabase
      .from('media_files')
      .select('id, public_url, title, created_at, file_size, metadata')
      .eq('metadata->>profile_id', storytellerId)
      .order('created_at', { ascending: false });

    // Combine and dedupe
    const allFiles = [...(mediaFiles || []), ...(metadataFiles || [])];
    const uniqueFiles = allFiles.filter(
      (file, index, self) => index === self.findIndex((f) => f.id === file.id)
    );

    return NextResponse.json({
      currentImage: profile.profile_image_url,
      profileImages: uniqueFiles,
      profile: {
        id: profile.id,
        name: profile.preferred_name || profile.full_name,
      },
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PUT - Set profile image from existing media file
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params;
    const supabase = getServerClient();
    const body = await request.json();
    const { mediaId, imageUrl } = body;

    if (!imageUrl && !mediaId) {
      return NextResponse.json(
        { error: 'Either mediaId or imageUrl is required' },
        { status: 400 }
      );
    }

    let finalUrl = imageUrl;

    // If mediaId provided, get the URL from media_files
    if (mediaId) {
      const { data: mediaFile, error: mediaError } = await supabase
        .from('media_files')
        .select('public_url')
        .eq('id', mediaId)
        .single();

      if (mediaError || !mediaFile) {
        return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
      }

      finalUrl = mediaFile.public_url;

      // Update the media file to tag it as a profile image
      await supabase
        .from('media_files')
        .update({
          tags: supabase.rpc('array_append_unique', {
            arr: ['profile-image', `profile:${storytellerId}`],
          }),
          metadata: {
            profile_id: storytellerId,
            set_as_profile_at: new Date().toISOString(),
          },
        })
        .eq('id', mediaId);
    }

    // Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_image_url: finalUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storytellerId);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      message: 'Profile image updated successfully',
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove profile image (sets to null, doesn't delete the file)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storytellerId } = await params;
    const supabase = getServerClient();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        profile_image_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storytellerId);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile image removed',
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
