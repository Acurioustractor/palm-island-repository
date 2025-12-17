import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Server-side Supabase client with service role (bypasses RLS)
function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type BulkAction =
  | 'add_tags'
  | 'remove_tags'
  | 'set_status'
  | 'set_category'
  | 'set_access_level'
  | 'set_featured'
  | 'set_storyteller'
  | 'archive'
  | 'delete';

type BulkBody = {
  storyIds?: string[];
  action?: BulkAction;
  tags?: string[];
  status?: string;
  category?: string;
  access_level?: string;
  featured?: boolean;
  storyteller_id?: string;
};

function uniqStrings(values: unknown): string[] {
  const out: string[] = [];
  if (!Array.isArray(values)) return out;
  for (const v of values) {
    if (typeof v !== 'string') continue;
    const s = v.trim();
    if (!s) continue;
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as BulkBody;

    const storyIds = uniqStrings(body.storyIds);
    const action = body.action;
    const tags = uniqStrings(body.tags);
    const status = typeof body.status === 'string' ? body.status.trim() : undefined;
    const category = typeof body.category === 'string' ? body.category.trim() : undefined;
    const access_level = typeof body.access_level === 'string' ? body.access_level.trim() : undefined;
    const featured = typeof body.featured === 'boolean' ? body.featured : undefined;
    const storyteller_id = typeof body.storyteller_id === 'string' ? body.storyteller_id.trim() : undefined;

    // Validation
    if (storyIds.length === 0) {
      return NextResponse.json({ error: 'storyIds required' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'action required' }, { status: 400 });
    }

    const validActions: BulkAction[] = [
      'add_tags',
      'remove_tags',
      'set_status',
      'set_category',
      'set_access_level',
      'set_featured',
      'set_storyteller',
      'archive',
      'delete',
    ];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Action-specific validation
    if ((action === 'add_tags' || action === 'remove_tags') && tags.length === 0) {
      return NextResponse.json({ error: 'tags required for tag operations' }, { status: 400 });
    }

    if (action === 'set_status' && !status) {
      return NextResponse.json({ error: 'status required for set_status action' }, { status: 400 });
    }

    if (action === 'set_category' && !category) {
      return NextResponse.json({ error: 'category required for set_category action' }, { status: 400 });
    }

    if (action === 'set_access_level' && !access_level) {
      return NextResponse.json({ error: 'access_level required for set_access_level action' }, { status: 400 });
    }

    if (action === 'set_featured' && featured === undefined) {
      return NextResponse.json({ error: 'featured required for set_featured action' }, { status: 400 });
    }

    if (action === 'set_storyteller' && !storyteller_id) {
      return NextResponse.json({ error: 'storyteller_id required for set_storyteller action' }, { status: 400 });
    }

    const supabase = getServerClient();
    const chunkSize = 200;
    let updatedCount = 0;
    let errors: string[] = [];

    // Handle delete action
    if (action === 'delete') {
      for (let i = 0; i < storyIds.length; i += chunkSize) {
        const chunk = storyIds.slice(i, i + chunkSize);

        const { error } = await supabase.from('stories').delete().in('id', chunk);

        if (error) {
          errors.push(`Delete error: ${error.message}`);
        } else {
          updatedCount += chunk.length;
        }
      }

      return NextResponse.json({ ok: true, deleted: updatedCount, errors: errors.length > 0 ? errors : undefined });
    }

    // Handle archive action (soft delete / status change)
    if (action === 'archive') {
      for (let i = 0; i < storyIds.length; i += chunkSize) {
        const chunk = storyIds.slice(i, i + chunkSize);

        const { error } = await supabase
          .from('stories')
          .update({ status: 'archived' })
          .in('id', chunk);

        if (error) {
          errors.push(`Archive error: ${error.message}`);
        } else {
          updatedCount += chunk.length;
        }
      }

      return NextResponse.json({ ok: true, updated: updatedCount, errors: errors.length > 0 ? errors : undefined });
    }

    // Handle tag operations
    if (action === 'add_tags' || action === 'remove_tags') {
      for (let i = 0; i < storyIds.length; i += chunkSize) {
        const chunk = storyIds.slice(i, i + chunkSize);

        const { data, error } = await supabase.from('stories').select('id, tags').in('id', chunk);

        if (error) {
          errors.push(`Fetch error: ${error.message}`);
          continue;
        }

        const updates = (data || []).map((row: any) => {
          const currentTags = Array.isArray(row.tags) ? row.tags.filter((t: any) => typeof t === 'string') : [];

          let nextTags: string[];

          if (action === 'add_tags') {
            nextTags = [...currentTags];
            for (const t of tags) {
              if (!nextTags.includes(t)) nextTags.push(t);
            }
          } else {
            // remove_tags
            nextTags = currentTags.filter((t: string) => !tags.includes(t));
          }

          return {
            id: row.id,
            tags: nextTags,
          };
        });

        if (updates.length === 0) continue;

        const { error: upsertError } = await supabase.from('stories').upsert(updates, { onConflict: 'id' });

        if (upsertError) {
          errors.push(`Upsert error: ${upsertError.message}`);
        } else {
          updatedCount += updates.length;
        }
      }

      return NextResponse.json({ ok: true, updated: updatedCount, errors: errors.length > 0 ? errors : undefined });
    }

    // Handle direct update actions
    let updateData: Record<string, any> = {};

    switch (action) {
      case 'set_status':
        updateData = { status };
        // If publishing, also set published_at
        if (status === 'published') {
          updateData.published_at = new Date().toISOString();
        }
        break;
      case 'set_category':
        updateData = { category };
        break;
      case 'set_access_level':
        updateData = { access_level };
        break;
      case 'set_featured':
        updateData = { is_featured: featured };
        break;
      case 'set_storyteller':
        updateData = { storyteller_id };
        break;
    }

    for (let i = 0; i < storyIds.length; i += chunkSize) {
      const chunk = storyIds.slice(i, i + chunkSize);

      const { error: updateError } = await supabase.from('stories').update(updateData).in('id', chunk);

      if (updateError) {
        errors.push(`Update error: ${updateError.message}`);
      } else {
        updatedCount += chunk.length;
      }
    }

    return NextResponse.json({
      ok: true,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Bulk story update error:', error);
    return NextResponse.json({ error: error?.message || 'Bulk update failed' }, { status: 500 });
  }
}

/**
 * GET endpoint to fetch stories with filters (enhanced for list view)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const storyType = searchParams.get('story_type');
    const storytellerId = searchParams.get('storyteller_id');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const accessLevel = searchParams.get('access_level');
    const hasMedia = searchParams.get('has_media');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const supabase = getServerClient();

    let query = supabase
      .from('stories')
      .select(
        `
        id,
        title,
        content,
        excerpt,
        featured_image_url,
        created_at,
        updated_at,
        published_at,
        category,
        story_type,
        status,
        access_level,
        is_featured,
        is_verified,
        storyteller_id,
        tags,
        location,
        views,
        likes,
        shares,
        cultural_sensitivity_level,
        elder_approval_required,
        elder_approval_given,
        profiles:storyteller_id (
          id,
          full_name,
          preferred_name,
          profile_image_url,
          storyteller_type,
          is_elder
        )
      `,
        { count: 'exact' }
      )
      .range(offset, offset + limit - 1);

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (storyType && storyType !== 'all') {
      query = query.eq('story_type', storyType);
    }

    if (storytellerId && storytellerId !== 'all') {
      query = query.eq('storyteller_id', storytellerId);
    }

    if (accessLevel && accessLevel !== 'all') {
      query = query.eq('access_level', accessLevel);
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      // Filter stories that contain ANY of the specified tags
      query = query.overlaps('tags', tagArray);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the data to flatten the profiles relation
    const stories = (data || []).map((story: any) => ({
      ...story,
      storyteller: story.profiles || null,
      storyteller_name: story.profiles?.preferred_name || story.profiles?.full_name || null,
    }));

    return NextResponse.json({
      data: stories,
      count,
      hasMore: offset + limit < (count || 0),
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
