/**
 * Import Script: Create storytellers and interviews from CSV
 *
 * CSV Format:
 * Title,Transcript
 * "Person Name - Interview Topic","Full transcript text here..."
 *
 * This script will:
 * 1. Read the CSV file
 * 2. Create a profile for each person (extracted from Title)
 * 3. Create an interview record with the transcript
 * 4. Set date to December 2024, location to Palm Island
 *
 * Usage: node scripts/import-storytellers-csv.js path/to/file.csv
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple CSV parser (handles quoted fields with commas)
function parseCSV(content) {
  const lines = [];
  const rows = content.split('\n');

  for (let row of rows) {
    if (!row.trim()) continue;

    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    lines.push(fields);
  }

  return lines;
}

// Extract person name from title
// Examples:
//   "Uncle Frank - Storm Recovery" -> "Uncle Frank"
//   "Auntie Mary's Story" -> "Auntie Mary"
//   "Community Elder Discussion" -> "Community Elder"
function extractPersonName(title) {
  // Try to extract name before " - " or ":"
  if (title.includes(' - ')) {
    return title.split(' - ')[0].trim();
  }
  if (title.includes(': ')) {
    return title.split(': ')[0].trim();
  }

  // Try to extract from possessive "'s"
  if (title.includes("'s ")) {
    return title.split("'s ")[0].trim();
  }

  // Otherwise, use first few words as name
  const words = title.split(' ');
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  }

  return title;
}

async function importFromCSV(csvPath) {
  console.log(`📂 Reading CSV file: ${csvPath}\n`);

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File not found: ${csvPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  if (rows.length === 0) {
    console.error('❌ CSV file is empty');
    process.exit(1);
  }

  // Check header
  const header = rows[0];
  const titleIndex = header.findIndex(h => h.toLowerCase().includes('title'));
  const transcriptIndex = header.findIndex(h => h.toLowerCase().includes('transcript'));

  if (titleIndex === -1 || transcriptIndex === -1) {
    console.error('❌ CSV must have "Title" and "Transcript" columns');
    console.log('Found columns:', header);
    process.exit(1);
  }

  console.log(`✓ Found ${rows.length - 1} entries to import\n`);

  const dataRows = rows.slice(1); // Skip header
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const title = row[titleIndex]?.replace(/^"|"$/g, '').trim(); // Remove quotes
    const transcript = row[transcriptIndex]?.replace(/^"|"$/g, '').trim();

    if (!title || !transcript) {
      console.log(`⚠️  Skipping row ${i + 2}: Missing title or transcript`);
      errorCount++;
      continue;
    }

    console.log(`\n📝 Processing ${i + 1}/${dataRows.length}: ${title}`);

    try {
      // Extract person name from title
      const personName = extractPersonName(title);
      console.log(`   Person: ${personName}`);

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('full_name', personName)
        .single();

      let profileId;

      if (existingProfile) {
        console.log(`   ℹ️  Profile exists, using existing: ${existingProfile.id}`);
        profileId = existingProfile.id;
      } else {
        // Create new profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            full_name: personName,
            preferred_name: personName,
            storyteller_type: 'community_member',
            location: 'Palm Island',
            is_elder: personName.toLowerCase().includes('uncle') ||
                     personName.toLowerCase().includes('auntie') ||
                     personName.toLowerCase().includes('elder'),
            show_in_directory: true,
            profile_visibility: 'public'
          })
          .select()
          .single();

        if (profileError) {
          throw new Error(`Failed to create profile: ${profileError.message}`);
        }

        profileId = newProfile.id;
        console.log(`   ✓ Created profile: ${profileId}`);
      }

      // Create interview with transcript
      const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .insert({
          storyteller_id: profileId,
          interview_title: title,
          interview_date: '2024-12-01', // December 2024
          location: 'Palm Island',
          full_transcript: transcript,
          transcript_status: 'completed',
          consent_given: true,
          consent_date: '2024-12-01'
        })
        .select()
        .single();

      if (interviewError) {
        throw new Error(`Failed to create interview: ${interviewError.message}`);
      }

      console.log(`   ✓ Created interview: ${interview.id}`);

      // Update profile interview count
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          interviews_completed: supabase.rpc('increment', { x: 1 })
        })
        .eq('id', profileId);

      if (updateError) {
        console.log(`   ⚠️  Warning: Could not update interview count: ${updateError.message}`);
      } else {
        console.log(`   ✓ Updated interview count`);
      }

      successCount++;

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Import complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${dataRows.length}\n`);
}

// Get CSV path from command line
const csvPath = process.argv[2];

if (!csvPath) {
  console.error('❌ Usage: node scripts/import-storytellers-csv.js path/to/file.csv');
  process.exit(1);
}

// Resolve path
const resolvedPath = path.resolve(csvPath);

// Run import
importFromCSV(resolvedPath)
  .then(() => {
    console.log('✓ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
