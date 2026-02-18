import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** GET /api/media/collections/:slug — get collection with its media items */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = getServerClient();

    // Fetch collection
    const { data: collection, error: colErr } = await supabase
      .from('photo_collections')
      .select('*')
      .eq('slug', slug)
      .single();

    if (colErr || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Fetch ALL items (paginate past Supabase 1000-row default)
    let allItems: any[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data: page, error: pageErr } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collection.id)
        .order('sort_order', { ascending: true })
        .range(from, from + pageSize - 1);

      if (pageErr) {
        return NextResponse.json({ error: pageErr.message }, { status: 500 });
      }
      if (!page || page.length === 0) break;
      allItems = allItems.concat(page);
      if (page.length < pageSize) break;
      from += pageSize;
    }

    // Fetch media files in batches of 200 (safe URL length for .in())
    const mediaIds = allItems.map((i) => i.media_id);
    let mediaFiles: any[] = [];

    for (let i = 0; i < mediaIds.length; i += 200) {
      const batch = mediaIds.slice(i, i + 200);
      const { data: files } = await supabase
        .from('media_files')
        .select('id, filename, title, caption, public_url, mime_type, width, height, tags, file_type')
        .in('id', batch);
      if (files) mediaFiles = mediaFiles.concat(files);
    }

    // Join items with media data, preserving sort order
    const mediaMap = new Map(mediaFiles.map((m) => [m.id, m]));
    const enrichedItems = allItems
      .map((item) => ({
        ...item,
        media: mediaMap.get(item.media_id) || null,
      }))
      .filter((item) => item.media !== null);

    // Sync item_count if stale (read-only correction, no deletions)
    if (collection.item_count !== enrichedItems.length) {
      await supabase
        .from('photo_collections')
        .update({ item_count: enrichedItems.length, updated_at: new Date().toISOString() })
        .eq('id', collection.id);
      collection.item_count = enrichedItems.length;
    }

    return NextResponse.json({ collection, items: enrichedItems });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
