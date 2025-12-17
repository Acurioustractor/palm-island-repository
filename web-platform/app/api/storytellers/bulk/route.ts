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
  | 'set_type'
  | 'set_elder'
  | 'set_directory'
  | 'set_cultural_advisor'
  | 'delete';

type BulkBody = {
  profileIds?: string[];
  action?: BulkAction;
  tags?: string[];
  type?: string;
  value?: boolean;
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

// Protected profiles that should never be deleted
const PROTECTED_PROFILE_IDS = [
  'c0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000006',
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as BulkBody;

    const profileIds = uniqStrings(body.profileIds);
    const action = body.action;
    const tags = uniqStrings(body.tags);
    const type = typeof body.type === 'string' ? body.type.trim() : undefined;
    const value = typeof body.value === 'boolean' ? body.value : undefined;

    // Validation
    if (profileIds.length === 0) {
      return NextResponse.json({ error: 'profileIds required' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'action required' }, { status: 400 });
    }

    const validActions: BulkAction[] = [
      'add_tags',
      'remove_tags',
      'set_type',
      'set_elder',
      'set_directory',
      'set_cultural_advisor',
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

    if (action === 'set_type' && !type) {
      return NextResponse.json({ error: 'type required for set_type action' }, { status: 400 });
    }

    if (['set_elder', 'set_directory', 'set_cultural_advisor'].includes(action) && value === undefined) {
      return NextResponse.json({ error: 'value required for boolean actions' }, { status: 400 });
    }

    const supabase = getServerClient();
    const chunkSize = 200;
    let updatedCount = 0;
    let errors: string[] = [];

    // Handle delete action separately
    if (action === 'delete') {
      // Filter out protected profiles
      const deletableIds = profileIds.filter((id) => !PROTECTED_PROFILE_IDS.includes(id));
      const protectedCount = profileIds.length - deletableIds.length;

      if (protectedCount > 0) {
        errors.push(`${protectedCount} protected profile(s) were skipped`);
      }

      if (deletableIds.length === 0) {
        return NextResponse.json(
          { ok: true, updated: 0, errors },
          { status: 200 }
        );
      }

      for (let i = 0; i < deletableIds.length; i += chunkSize) {
        const chunk = deletableIds.slice(i, i + chunkSize);

        const { error } = await supabase
          .from('profiles')
          .delete()
          .in('id', chunk);

        if (error) {
          errors.push(`Delete error: ${error.message}`);
        } else {
          updatedCount += chunk.length;
        }
      }

      return NextResponse.json({ ok: true, deleted: updatedCount, errors });
    }

    // Handle other actions
    for (let i = 0; i < profileIds.length; i += chunkSize) {
      const chunk = profileIds.slice(i, i + chunkSize);

      // For tag operations, we need to fetch current tags first
      if (action === 'add_tags' || action === 'remove_tags') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, placement_tags')
          .in('id', chunk);

        if (error) {
          errors.push(`Fetch error: ${error.message}`);
          continue;
        }

        const updates = (data || []).map((row: any) => {
          const currentTags = Array.isArray(row.placement_tags)
            ? row.placement_tags.filter((t: any) => typeof t === 'string')
            : [];

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
            placement_tags: nextTags,
          };
        });

        if (updates.length === 0) continue;

        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(updates, { onConflict: 'id' });

        if (upsertError) {
          errors.push(`Upsert error: ${upsertError.message}`);
        } else {
          updatedCount += updates.length;
        }
      } else {
        // Direct updates for other actions
        let updateData: Record<string, any> = {};

        switch (action) {
          case 'set_type':
            updateData = {
              storyteller_type: type,
              // Auto-update is_elder based on type
              ...(type === 'elder' ? { is_elder: true } : {}),
            };
            break;
          case 'set_elder':
            updateData = {
              is_elder: value,
              // Auto-update storyteller_type when setting as elder
              ...(value ? { storyteller_type: 'elder' } : {}),
            };
            break;
          case 'set_directory':
            updateData = { show_in_directory: value };
            break;
          case 'set_cultural_advisor':
            updateData = {
              is_cultural_advisor: value,
              ...(value ? { storyteller_type: 'cultural_advisor' } : {}),
            };
            break;
        }

        const { error: updateError, count } = await supabase
          .from('profiles')
          .update(updateData)
          .in('id', chunk)
          .select('id');

        if (updateError) {
          errors.push(`Update error: ${updateError.message}`);
        } else {
          updatedCount += chunk.length;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Bulk storyteller update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Bulk update failed' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch storytellers with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '200');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const tags = searchParams.get('tags');
    const search = searchParams.get('search');
    const hasStories = searchParams.get('hasStories');

    const supabase = getServerClient();

    let query = supabase
      .from('profiles')
      .select(
        `
        id,
        full_name,
        preferred_name,
        profile_image_url,
        bio,
        storyteller_type,
        is_elder,
        is_cultural_advisor,
        show_in_directory,
        location,
        placement_tags,
        stories_contributed,
        interviews_completed,
        created_at,
        updated_at
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('storyteller_type', type);
    }

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      query = query.contains('placement_tags', tagArray);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,preferred_name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    if (hasStories === 'yes') {
      query = query.gt('stories_contributed', 0);
    } else if (hasStories === 'no') {
      query = query.eq('stories_contributed', 0);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      count,
      hasMore: (offset + limit) < (count || 0),
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
