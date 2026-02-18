/**
 * Upload Cyclone Kirrily images to Supabase storage + media_files table
 * Then add them to the Storm Recovery 2024 collection
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

const IMAGE_METADATA: Record<string, { title: string; caption: string }> = {
  'nit-fnq-cyclone-prep.jpg': {
    title: 'FNQ Cyclone Preparation',
    caption: 'Far North Queensland communities preparing for Cyclone Kirrily, January 2024. Source: National Indigenous Times',
  },
  'nit-kirrily-coast-crossing.jpg': {
    title: 'Cyclone Kirrily Coast Crossing',
    caption: 'Cyclone Kirrily making landfall near Townsville, January 25 2024. Source: National Indigenous Times',
  },
  'palm-island-wallaby-point.jpg': {
    title: 'Palm Island Wallaby Point',
    caption: 'Wallaby Point, Palm Island during cyclone season. Source: Extreme Storms',
  },
  'sbs-kirrily-aftermath-1.jpg': {
    title: 'Cyclone Kirrily Aftermath',
    caption: 'Damage in the Townsville region after Cyclone Kirrily. Source: SBS News',
  },
  'sbs-kirrily-aftermath-2.jpg': {
    title: 'Cyclone Kirrily Storm Damage',
    caption: 'Storm damage from Cyclone Kirrily in North Queensland. Source: SBS News',
  },
  'qra-townsville-tree-damage.png': {
    title: 'Townsville Tree Damage',
    caption: 'Fallen trees in Townsville from Cyclone Kirrily winds. Source: Queensland Reconstruction Authority',
  },
  'qra-burdekin-drivein-damage.png': {
    title: 'Burdekin Drive-In Damage',
    caption: 'Damage to the Burdekin Drive-In from Cyclone Kirrily. Source: QRA',
  },
  'qra-mckinlay-flooding.png': {
    title: 'McKinlay Flooding',
    caption: 'Flooding in McKinlay region following Cyclone Kirrily. Source: QRA',
  },
  'qra-georgetown-flood.png': {
    title: 'Georgetown Flood',
    caption: 'Flooding in Georgetown after Cyclone Kirrily. Source: QRA',
  },
  'qra-bray-park-cleanup.png': {
    title: 'Bray Park Cleanup',
    caption: 'Community cleanup at Bray Park after Cyclone Kirrily. Source: QRA',
  },
  'satellite-kirrily-formation.jpg': {
    title: 'Cyclone Kirrily Satellite View',
    caption: 'Satellite imagery of Cyclone Kirrily forming in the Coral Sea, January 2024.',
  },
  'cimss-kirrily-intensity.jpg': {
    title: 'Cyclone Kirrily Intensity Analysis',
    caption: 'CIMSS intensity analysis of Cyclone Kirrily showing Category 3 strength.',
  },
  'zoom-earth-kirrily-tracking.jpg': {
    title: 'Cyclone Kirrily Track Map',
    caption: 'Tracking map showing Cyclone Kirrily path toward North Queensland coast.',
  },
  'townsville-storm-events-map.jpg': {
    title: 'Townsville Storm Events Map',
    caption: 'Map of storm events in the Townsville region during Cyclone Kirrily.',
  },
  'canberra-times-shelter-call.jpg': {
    title: 'Emergency Shelter Call',
    caption: 'Authorities urging residents to seek shelter as Cyclone Kirrily approaches. Source: Canberra Times',
  },
};

const TAGS = ['cyclone-kirrily', 'storm-recovery', '2024', 'palm-island', 'natural-disaster', 'history'];

async function main() {
  const files = fs.readdirSync(IMAGE_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} images to upload`);

  const uploadedMediaIds: string[] = [];

  for (const filename of files) {
    const filePath = path.join(IMAGE_DIR, filename);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const storagePath = `picc-website/cyclone-kirrily/${filename}`;

    console.log(`Uploading ${filename} (${(fileBuffer.length / 1024).toFixed(0)}KB)...`);

    // Upload to storage
    const { error: uploadErr } = await supabase.storage
      .from('story-media')
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadErr) {
      console.error(`  Storage upload failed: ${uploadErr.message}`);
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('story-media').getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    const meta = IMAGE_METADATA[filename] || { title: filename, caption: '' };

    // Insert media_files record
    const { data: mediaRecord, error: insertErr } = await supabase
      .from('media_files')
      .insert({
        filename,
        original_filename: filename,
        file_path: storagePath,
        bucket_name: 'story-media',
        public_url: publicUrl,
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

  console.log(`\nUploaded ${uploadedMediaIds.length} images. Adding to Storm Recovery 2024 collection...`);

  // Add to collection
  if (uploadedMediaIds.length > 0) {
    const rows = uploadedMediaIds.map((mediaId, i) => ({
      collection_id: COLLECTION_ID,
      media_id: mediaId,
      sort_order: i,
      added_by: null,
    }));

    const { error: colErr } = await supabase
      .from('collection_items')
      .upsert(rows, { onConflict: 'collection_id,media_id', ignoreDuplicates: true });

    if (colErr) {
      console.error(`Collection add failed: ${colErr.message}`);
    } else {
      console.log(`Added ${uploadedMediaIds.length} images to Storm Recovery 2024 collection`);
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
