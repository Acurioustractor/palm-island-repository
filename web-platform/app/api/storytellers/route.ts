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

export async function GET() {
  try {
    const supabase = getServerClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, preferred_name, profile_image_url, bio, storyteller_type, is_elder, location, stories_contributed, interviews_completed, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient();
    const body = await request.json();

    // Extract profile data (profiles table doesn't have tenant_id)
    const profileData = {
      full_name: body.full_name,
      preferred_name: body.preferred_name || null,
      bio: body.bio || null,
      storyteller_type: body.storyteller_type || 'community_member',
      is_elder: body.is_elder || false,
      is_cultural_advisor: body.is_cultural_advisor || false,
      location: body.location || 'Palm Island',
      email: body.email || null,
      phone: body.phone || null,
      traditional_country: body.traditional_country || null,
      language_group: body.language_group || null,
      organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
      primary_organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
    };

    // Insert profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile insert error:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // If interview data provided, create interview
    if (body.raw_transcript && profile) {
      const interviewData = {
        storyteller_id: profile.id,
        tenant_id: process.env.NEXT_PUBLIC_TENANT_ID,
        organization_id: process.env.NEXT_PUBLIC_ORGANIZATION_ID,
        interview_title: body.interview_title || `${body.full_name} Interview`,
        interview_date: body.interview_date || new Date().toISOString().split('T')[0],
        interview_duration_minutes: body.interview_duration ? parseInt(body.interview_duration) : null,
        raw_transcript: body.raw_transcript,
        video_url: body.video_url || null,
        audio_url: body.audio_url || null,
        interview_notes: body.interview_notes || null,
        status: 'raw',
      };

      const { error: interviewError } = await supabase
        .from('interviews')
        .insert(interviewData);

      if (interviewError) {
        console.error('Interview insert error:', interviewError);
        // Don't fail - profile was created
      } else {
        // Update interview count
        await supabase
          .from('profiles')
          .update({ interviews_completed: 1 })
          .eq('id', profile.id);
      }
    }

    return NextResponse.json({ data: profile });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getServerClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServerClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
    }

    // Protected Community Voice profiles that should never be deleted
    const communityVoiceIds = [
      'c0000000-0000-0000-0000-000000000001',
      'c0000000-0000-0000-0000-000000000002',
      'c0000000-0000-0000-0000-000000000003',
      'c0000000-0000-0000-0000-000000000004',
      'c0000000-0000-0000-0000-000000000005',
      'c0000000-0000-0000-0000-000000000006',
    ];

    if (communityVoiceIds.includes(id)) {
      return NextResponse.json(
        { error: 'Cannot delete Community Voice system profile' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Profile delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
