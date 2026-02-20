/**
 * Generate bespoke service icons in ochre line-art style.
 *
 * Creates golden ochre (#C8922A) line-art icons for each PICC service,
 * saved as BespokeIcon-compatible PNGs in public/icons/bespoke/.
 *
 * Usage:
 *   npx tsx scripts/generate-service-icons.ts                    # generate all
 *   npx tsx scripts/generate-service-icons.ts --slug youth-services  # generate one
 *   npx tsx scripts/generate-service-icons.ts --upload           # generate + upload to Supabase
 */

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY in environment');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const shouldUpload = process.argv.includes('--upload');
const singleSlug = process.argv.find((_, i, a) => a[i - 1] === '--slug') || null;

// Output directory — write directly into bespoke icons folder
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'icons', 'bespoke');

// Map service slugs to BespokeIcon file names
const SLUG_TO_ICON_NAME: Record<string, string> = {
  'bwgcolman-healing': 'health',
  'family-wellbeing': 'family',
  'youth-services': 'youth',
  'early-learning': 'children',
  'cultural-centre': 'culture',
  'ranger-program': 'land',
  'community-safety': 'community',
  'digital-service-centre': 'digital',
  'housing-infrastructure': 'housing',
  'justice-services': 'justice',
  'crisis-services': 'crisis',
  'economic-development': 'economic',
  'sport-recreation': 'sport',
  'mental-health': 'mental-health',
  'disability-services': 'disability',
  'governance-admin': 'governance',
};

// Service icon prompts — each describes a simple sketched scene for the service
const SERVICE_ICONS: Record<string, { label: string; prompt: string }> = {
  'bwgcolman-healing': {
    label: 'Healing',
    prompt: 'a healing hand gently cradling a heart with small radiating lines, with a subtle leaf motif',
  },
  'family-wellbeing': {
    label: 'Family',
    prompt: 'a family of three figures (adult, adult, child) standing together holding hands, with a small house outline behind them',
  },
  'youth-services': {
    label: 'Youth',
    prompt: 'a young person jumping with arms raised in joy, with a basketball and a book nearby',
  },
  'early-learning': {
    label: 'Early Learning',
    prompt: 'a small child reading a picture book with building blocks and a crayon beside them, ABC letters floating above',
  },
  'cultural-centre': {
    label: 'Culture',
    prompt: 'a traditional Aboriginal boomerang crossed with a didgeridoo, with dot-art style circles around them',
  },
  'ranger-program': {
    label: 'Rangers',
    prompt: 'a person in a ranger hat standing beside a tropical tree, with a turtle and ocean waves in the background',
  },
  'community-safety': {
    label: 'Safety',
    prompt: 'a shield with a checkmark inside it, flanked by two hands reaching toward each other in support',
  },
  'digital-service-centre': {
    label: 'Digital',
    prompt: 'a laptop computer with a wifi signal icon above it, and a person sitting at the desk waving',
  },
  'housing-infrastructure': {
    label: 'Housing',
    prompt: 'a simple house with a wrench and hammer crossed below it, surrounded by tropical palm fronds',
  },
  'justice-services': {
    label: 'Justice',
    prompt: 'balanced scales of justice with an olive branch wrapped around the stand, peaceful and grounded',
  },
  'crisis-services': {
    label: 'Crisis Support',
    prompt: 'an open door with warm light streaming out and a welcoming hand reaching through, symbolizing safe refuge',
  },
  'economic-development': {
    label: 'Economy',
    prompt: 'a sprouting plant growing from a coin, with small gear wheels and an upward arrow beside it',
  },
  'sport-recreation': {
    label: 'Sport',
    prompt: 'a person running with a football, palm trees and a sports field in the background',
  },
  'mental-health': {
    label: 'Mental Health',
    prompt: 'a head silhouette in profile with a peaceful sunrise inside the mind, small birds flying out',
  },
  'disability-services': {
    label: 'Disability',
    prompt: 'two hands clasped together in support with a universal accessibility symbol, surrounded by caring hearts',
  },
  'governance-admin': {
    label: 'Governance',
    prompt: 'a meeting table seen from above with people seated around it, a document with a pen in the center',
  },
};

const STYLE_PREFIX = `Minimal single-colour line-art icon in golden ochre (#C8922A) on white background. Clean lines suitable for 24-48px. No circle frame. Warm community-focused style. No text or words in the image. The illustration should be:`;

async function generateIcon(slug: string, config: { label: string; prompt: string }): Promise<Buffer | null> {
  const fullPrompt = `${STYLE_PREFIX} ${config.prompt}. Draw this as a single centered icon with no frame or border. Keep it simple with clean lines, suitable for a small 48px icon.`;

  console.log(`  Generating: ${config.label} (${slug})...`);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: fullPrompt,
      config: {
        responseModalities: ['image', 'text'],
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        console.log(`    OK — ${(buffer.length / 1024).toFixed(0)}KB`);
        return buffer;
      }
    }

    console.log(`    WARN — no image in response`);
    return null;
  } catch (err: any) {
    console.error(`    FAIL — ${err.message}`);
    return null;
  }
}

async function uploadToSupabase(slug: string, buffer: Buffer): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('    SKIP upload — no Supabase credentials');
    return null;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const fileName = `service-icons/${slug}.png`;

  const { error } = await supabase.storage
    .from('story-media')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      cacheControl: '86400',
      upsert: true,
    });

  if (error) {
    console.log(`    UPLOAD FAIL — ${error.message}`);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('story-media')
    .getPublicUrl(fileName);

  console.log(`    UPLOADED → ${publicUrl}`);
  return publicUrl;
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const slugs = singleSlug
    ? [singleSlug]
    : Object.keys(SERVICE_ICONS);

  console.log(`Generating ${slugs.length} service icon(s) in ochre line-art style\n`);

  const results: Record<string, string> = {};
  let success = 0;
  let failed = 0;

  for (const slug of slugs) {
    const config = SERVICE_ICONS[slug];
    if (!config) {
      console.log(`  SKIP — unknown slug: ${slug}`);
      failed++;
      continue;
    }

    const buffer = await generateIcon(slug, config);
    if (!buffer) {
      failed++;
      continue;
    }

    // Save locally with BespokeIcon-compatible name
    const iconName = SLUG_TO_ICON_NAME[slug] || slug;
    const localPath = path.join(OUTPUT_DIR, `${iconName}.png`);
    fs.writeFileSync(localPath, buffer);
    results[slug] = `/icons/bespoke/${iconName}.png`;

    // Upload to Supabase if requested
    if (shouldUpload) {
      const url = await uploadToSupabase(slug, buffer);
      if (url) results[slug] = url;
    }

    success++;

    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Write manifest
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));

  console.log(`\n--- Summary ---`);
  console.log(`Generated: ${success}`);
  console.log(`Failed:    ${failed}`);
  console.log(`Manifest:  ${manifestPath}`);
  console.log(`Icons dir: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
