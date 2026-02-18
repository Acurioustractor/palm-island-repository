/**
 * Upload Batch 2: Getty Images + AAP Photos for Cyclone Kirrily
 * Add to Storm Recovery 2024 collection with source references
 */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const COLLECTION_ID = '819bfa62-a68e-4623-8830-a073bbd8c7c1'; // Storm Recovery 2024

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const IMAGE_DIR = path.join(__dirname, '..', 'public', 'cyclone-kirrily-temp');

const BATCH2_IMAGES: Record<string, { title: string; caption: string }> = {
  'aap-palm-island-shelter.jpg': {
    title: 'Palm Island Community Shelters for Cyclone Kirrily',
    caption: "Palm Island's Indigenous community lacks an evacuation centre as it bunkers down for Cyclone Kirrily, January 2024. Photo: Dave Hunt/AAP Photos",
  },
  'getty-sunken-yacht-1.jpg': {
    title: 'Sunken Yacht After Cyclone Kirrily - Townsville',
    caption: 'A sunken yacht in Townsville on January 26, 2024, after Cyclone Kirrily crossed the coast. Photo: Ian Hitchcock/Getty Images',
  },
  'getty-sunken-yacht-2.jpg': {
    title: 'Sunken Yacht After Cyclone Kirrily - Townsville (2)',
    caption: 'A sunken yacht seen in Townsville harbour after Cyclone Kirrily, January 26, 2024. Photo: Ian Hitchcock/Getty Images',
  },
  'getty-jogger-strand-sunrise.jpg': {
    title: 'The Strand Before Cyclone Kirrily',
    caption: 'A jogger runs along The Strand at sunrise before the arrival of Cyclone Kirrily, Townsville, January 24, 2024. Photo: Ian Hitchcock/Getty Images',
  },
  'getty-tree-damage-1.jpg': {
    title: 'Large Tree Knocked Over by Cyclone Kirrily',
    caption: 'A large tree knocked over by strong winds from Cyclone Kirrily in Townsville, January 26, 2024. Photo: Ian Hitchcock/Getty Images',
  },
  'getty-tree-damage-2.jpg': {
    title: 'Tree Damage from Cyclone Kirrily Winds',
    caption: 'Tree damage from Cyclone Kirrily strong winds in Townsville, January 26, 2024. Photo: Ian Hitchcock/Getty Images',
  },
  'getty-tree-damage-3.jpg': {
    title: 'Storm Damage - Cyclone Kirrily Townsville',
    caption: 'A tree knocked over by strong winds from Cyclone Kirrily in Townsville, January 26, 2024. Photo: Ian Hitchcock/Getty Images',
  },
};

const TAGS = ['cyclone-kirrily', 'storm-recovery', '2024', 'palm-island', 'natural-disaster', 'history'];

async function main() {
  const filenames = Object.keys(BATCH2_IMAGES);
  console.log(`Uploading ${filenames.length} batch 2 images...`);

  const uploadedMediaIds: string[] = [];

  for (const filename of filenames) {
    const filePath = path.join(IMAGE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`  Skipping ${filename} - file not found`);
      continue;
    }
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const storagePath = `picc-website/cyclone-kirrily/${filename}`;
    const meta = BATCH2_IMAGES[filename];

    console.log(`Uploading ${filename} (${(fileBuffer.length / 1024).toFixed(0)}KB)...`);

    const { error: uploadErr } = await supabase.storage
      .from('story-media')
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

    if (uploadErr) {
      console.error(`  Storage upload failed: ${uploadErr.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage.from('story-media').getPublicUrl(storagePath);

    const { data: mediaRecord, error: insertErr } = await supabase
      .from('media_files')
      .insert({
        filename,
        original_filename: filename,
        file_path: storagePath,
        bucket_name: 'story-media',
        public_url: urlData.publicUrl,
        mime_type: mimeType,
        file_type: 'image',
        file_size: fileBuffer.length,
        title: meta.title,
        caption: meta.caption,
        tags: TAGS,
        metadata: { upload_year: 2024, collection: 'cyclone-kirrily' },
      })
      .select('id')
      .single();

    if (insertErr) {
      console.error(`  DB insert failed: ${insertErr.message}`);
      continue;
    }

    console.log(`  Uploaded: ${mediaRecord.id}`);
    uploadedMediaIds.push(mediaRecord.id);
  }

  console.log(`\nUploaded ${uploadedMediaIds.length} images. Adding to collection...`);

  if (uploadedMediaIds.length > 0) {
    const rows = uploadedMediaIds.map((mediaId, i) => ({
      collection_id: COLLECTION_ID,
      media_id: mediaId,
      sort_order: 100 + i, // after existing items
      added_by: null,
    }));

    const { error: colErr } = await supabase
      .from('collection_items')
      .upsert(rows, { onConflict: 'collection_id,media_id', ignoreDuplicates: true });

    if (colErr) {
      console.error(`Collection add failed: ${colErr.message}`);
    } else {
      console.log(`Added ${uploadedMediaIds.length} images to Storm Recovery 2024`);
    }

    // Update item_count
    const { count } = await supabase
      .from('collection_items')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', COLLECTION_ID);

    await supabase
      .from('photo_collections')
      .update({ item_count: count ?? 0, updated_at: new Date().toISOString() })
      .eq('id', COLLECTION_ID);

    console.log(`Collection item_count updated to ${count}`);
  }

  console.log('Done!');
}

main().catch(console.error);
