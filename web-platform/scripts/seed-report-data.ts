/**
 * Seed script for Annual Report system
 * Run with: npx ts-node scripts/seed-report-data.ts
 * Or via package.json: npm run seed:reports
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// Sample Data
// ============================================================================

const sampleStories = [
  {
    title: 'Healing Through Connection',
    content: `When I first came to the Bwgcolman Healing Service, I didn't know what to expect.
    I'd been struggling with my mental health for years, but I was afraid to seek help.
    The team here understood - they didn't push me, they just welcomed me.

    Now, two years later, I'm working as a peer support worker myself. I get to help others
    the way I was helped. That's the power of community-led healing - we lift each other up.`,
    category: 'health',
    status: 'published',
    is_featured: true,
    auto_include: true,
    report_worthy: true,
    elder_approval_given: true,
    media_count: 2,
    engagement_score: 85
  },
  {
    title: 'My Journey Through the Family Care Program',
    content: `Being separated from my children was the hardest thing I've ever experienced.
    When PICC's Family Care Service got involved, everything changed. They didn't just see me
    as a case number - they saw me as a mother fighting to get her family back together.

    The Bwgcolman Way approach meant that decisions were made by our community, people who
    understand our culture and our struggles. After 18 months, my kids are home with me now.
    We're healing together.`,
    category: 'family',
    status: 'published',
    is_featured: true,
    auto_include: true,
    report_worthy: true,
    contains_traditional_knowledge: false,
    engagement_score: 92
  },
  {
    title: 'Youth Finding Their Path',
    content: `The school holiday programs changed my life. Before, I used to just hang around
    with nothing to do. Now I'm learning traditional fishing from the Elders and doing my
    Certificate II at TAFE through the Digital Service Centre.

    The staff believe in us. They don't look down on us - they push us to be better while
    still respecting who we are. I want to become a youth worker myself one day and give back
    to the community that gave so much to me.`,
    category: 'youth',
    status: 'published',
    is_featured: false,
    auto_include: true,
    report_worthy: true,
    engagement_score: 78
  },
  {
    title: 'Keeping Language Alive',
    content: `Our language nearly died. When I was young, we were punished for speaking it.
    Now, through the language program at the Children and Family Centre, I get to teach the
    little ones the words my grandmother taught me in secret.

    Every word they learn is a victory. Every song they sing connects them to thousands of
    years of our people. This is the real healing work - making sure our culture survives
    for the generations to come.`,
    category: 'culture',
    status: 'published',
    is_featured: true,
    auto_include: true,
    report_worthy: true,
    elder_approval_given: true,
    contains_traditional_knowledge: true,
    engagement_score: 95
  },
  {
    title: 'From Training to Employment',
    content: `The Digital Service Centre gave me my first real job. I'd applied for so many
    positions over the years, but no one would give me a chance. Telstra and PICC did.

    Now I help people from all over Australia with their phone and internet problems.
    I support 50 different languages through translation services. My kids see me going to
    work every day, earning a good wage. That matters.`,
    category: 'economic',
    status: 'published',
    is_featured: true,
    auto_include: true,
    report_worthy: true,
    engagement_score: 88
  }
];

const sampleQuotes = [
  {
    text: 'Our strength has always been in our community. When one of us struggles, we all come together. That\'s the Palm Island way.',
    speaker_name: 'Aunty Margaret',
    speaker_role: 'Elder',
    theme: 'community',
    is_validated: true,
    category: 'culture'
  },
  {
    text: 'Healing doesn\'t happen overnight. It takes time, patience, and most importantly - it takes connection to culture and Country.',
    speaker_name: 'Uncle James',
    speaker_role: 'Elder',
    theme: 'healing',
    is_validated: true,
    category: 'health'
  },
  {
    text: 'When we make decisions about our children, they need to be made by people who understand our families, our history, our culture.',
    speaker_name: 'Aunty Joyce',
    speaker_role: 'Elder / Community Leader',
    theme: 'family',
    is_validated: true,
    category: 'family'
  },
  {
    text: 'The young ones are our future. Everything we do, every program we run, it\'s for them. So they have opportunities we never had.',
    speaker_name: 'Uncle Thomas',
    speaker_role: 'Elder',
    theme: 'youth',
    is_validated: true,
    category: 'youth'
  },
  {
    text: 'Language carries our stories, our law, our connection to this place. Without language, we lose a part of ourselves.',
    speaker_name: 'Aunty Sarah',
    speaker_role: 'Language Keeper / Elder',
    theme: 'language',
    is_validated: true,
    category: 'culture'
  }
];

const sampleFeedback = [
  {
    feedback_text: 'We need more activities for young people during school holidays',
    category: 'youth',
    is_anonymous: true,
    source: 'meeting',
    status: 'completed',
    priority: 'high',
    picc_response: 'PICC has launched the Youth Holiday Program with sports, cultural activities, and skills workshops running every school break.',
    investment_amount: 45000,
    outcome_summary: 'School holiday program now running with 50+ youth participants each break. Activities include traditional fishing, art, sports, and TAFE preparation.',
    related_program: 'youth-services'
  },
  {
    feedback_text: 'The health clinic waiting times are too long',
    category: 'health',
    is_anonymous: true,
    source: 'form',
    status: 'in_progress',
    priority: 'high',
    picc_response: 'We are recruiting additional staff and implementing a new booking system to reduce wait times.',
    investment_amount: null,
    outcome_summary: 'New booking system being trialed. Additional nurse recruited and starting next month.',
    related_program: 'health-services'
  },
  {
    feedback_text: 'Can we have more cultural programs for kids to learn language?',
    category: 'culture',
    is_anonymous: false,
    source: 'conversation',
    status: 'completed',
    priority: 'medium',
    picc_response: 'Working with Elders, we have developed a language program for the Children and Family Centre.',
    investment_amount: 25000,
    outcome_summary: 'Weekly language classes now running at CFC with 30+ children enrolled. Elder-led sessions every Wednesday.',
    related_program: 'children-family-centre'
  },
  {
    feedback_text: 'Need better lighting on the roads near the community centre',
    category: 'infrastructure',
    is_anonymous: true,
    source: 'survey',
    status: 'planned',
    priority: 'medium',
    picc_response: 'We have raised this with council and are seeking funding for improved street lighting.',
    investment_amount: null,
    outcome_summary: null,
    related_program: null
  },
  {
    feedback_text: 'More support needed for families dealing with domestic violence',
    category: 'safety',
    is_anonymous: true,
    source: 'form',
    status: 'completed',
    priority: 'urgent',
    picc_response: 'We have expanded our Safe House capacity and launched the Specialist DFV Service.',
    investment_amount: 180000,
    outcome_summary: 'Safe House now operates 24/7 with increased bed capacity. Specialist DFV workers providing ongoing support to 40+ families.',
    related_program: 'crisis-services'
  }
];

// ============================================================================
// Seeding Functions
// ============================================================================

async function seedStories() {
  console.log('Seeding stories...');

  for (const story of sampleStories) {
    const { data, error } = await supabase
      .from('stories')
      .insert(story)
      .select()
      .single();

    if (error) {
      console.error(`  Error inserting story "${story.title}":`, error.message);
    } else {
      console.log(`  ✓ Created story: ${data.title}`);
    }
  }
}

async function seedQuotes() {
  console.log('Seeding elder quotes...');

  for (const quote of sampleQuotes) {
    const { data, error } = await supabase
      .from('elder_quotes')
      .insert(quote)
      .select()
      .single();

    if (error) {
      // Table might not exist yet
      if (error.message.includes('does not exist')) {
        console.log('  ⚠ elder_quotes table not found - creating...');
        await createQuotesTable();
        // Retry
        const retry = await supabase.from('elder_quotes').insert(quote).select().single();
        if (retry.error) {
          console.error(`  Error inserting quote:`, retry.error.message);
        } else {
          console.log(`  ✓ Created quote from: ${retry.data.speaker_name}`);
        }
      } else {
        console.error(`  Error inserting quote:`, error.message);
      }
    } else {
      console.log(`  ✓ Created quote from: ${data.speaker_name}`);
    }
  }
}

async function seedCommunityFeedback() {
  console.log('Seeding community feedback...');

  for (const feedback of sampleFeedback) {
    const { data, error } = await supabase
      .from('community_feedback')
      .insert(feedback)
      .select()
      .single();

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('  ⚠ community_feedback table not found');
        console.log('  → Run migration: migrations/006_community_feedback.sql');
        return;
      }
      console.error(`  Error inserting feedback:`, error.message);
    } else {
      console.log(`  ✓ Created feedback: ${feedback.feedback_text.substring(0, 40)}...`);
    }
  }
}

async function createQuotesTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS elder_quotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT NOT NULL,
      speaker_name TEXT NOT NULL,
      speaker_role TEXT,
      theme TEXT,
      category TEXT,
      is_validated BOOLEAN DEFAULT false,
      validation_date TIMESTAMPTZ,
      validated_by TEXT,
      source_story_id UUID REFERENCES stories(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_quotes_theme ON elder_quotes(theme);
    CREATE INDEX IF NOT EXISTS idx_quotes_validated ON elder_quotes(is_validated);

    ALTER TABLE elder_quotes ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Public read validated quotes" ON elder_quotes
      FOR SELECT USING (is_validated = true);

    CREATE POLICY "Authenticated full access" ON elder_quotes
      FOR ALL TO authenticated USING (true);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('  Error creating quotes table:', error.message);
  }
}

async function verifyConnection() {
  console.log('Verifying Supabase connection...');

  const { data, error } = await supabase
    .from('stories')
    .select('count')
    .limit(1);

  if (error) {
    console.error('Connection failed:', error.message);
    return false;
  }

  console.log('✓ Connected to Supabase\n');
  return true;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('PICC Annual Report System - Data Seeder');
  console.log('='.repeat(60));
  console.log('');

  const connected = await verifyConnection();
  if (!connected) {
    process.exit(1);
  }

  await seedStories();
  console.log('');

  await seedQuotes();
  console.log('');

  await seedCommunityFeedback();
  console.log('');

  console.log('='.repeat(60));
  console.log('Seeding complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
