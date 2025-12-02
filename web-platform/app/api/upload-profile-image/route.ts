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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const storytellerId = formData.get('storytellerId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!storytellerId) {
      return NextResponse.json({ error: 'No storyteller ID provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, and WebP are supported.' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const supabase = getServerClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${storytellerId}-${Date.now()}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage using service role
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    // Update profile with image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image_url: publicUrl })
      .eq('id', storytellerId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      publicUrl,
      message: 'Photo uploaded successfully'
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storytellerId = searchParams.get('storytellerId');
    const imageUrl = searchParams.get('imageUrl');

    if (!storytellerId) {
      return NextResponse.json({ error: 'No storyteller ID provided' }, { status: 400 });
    }

    const supabase = getServerClient();

    // If there's an image URL, try to delete the file from storage
    if (imageUrl) {
      try {
        // Extract filename from URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        if (fileName) {
          await supabase.storage
            .from('profile-images')
            .remove([fileName]);
        }
      } catch (storageErr) {
        // Log but don't fail - the file might not exist
        console.error('Storage delete error (non-fatal):', storageErr);
      }
    }

    // Update profile to remove image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image_url: null })
      .eq('id', storytellerId);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
