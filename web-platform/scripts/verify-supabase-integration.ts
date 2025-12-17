// @ts-nocheck
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyIntegration() {
  console.log('\n🔍 SUPABASE INTEGRATION VERIFICATION');
  console.log('============================================================\n');

  let allChecks = true;

  // ============================================================================
  // 1. CONNECTION TEST
  // ============================================================================
  console.log('1️⃣  CONNECTION TEST');
  console.log('------------------------------------------------------------');
  try {
    const { data, error } = await supabase.from('stories').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Connection failed:', error.message);
      allChecks = false;
    } else {
      console.log('✅ Supabase connection successful');
      console.log(`   Connected to: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    }
  } catch (err: any) {
    console.log('❌ Connection error:', err.message);
    allChecks = false;
  }

  // ============================================================================
  // 2. DATABASE FUNCTIONS CHECK
  // ============================================================================
  console.log('\n2️⃣  DATABASE FUNCTIONS CHECK');
  console.log('------------------------------------------------------------');

  // Check match_stories function
  try {
    const testEmbedding = Array(1536).fill(0);
    const { data, error } = await supabase.rpc('match_stories', {
      query_embedding: testEmbedding,
      match_threshold: 0.7,
      match_count: 1
    });

    if (error) {
      console.log('❌ match_stories() function error:', error.message);
      console.log('   This function needs to be created or fixed');
      allChecks = false;
    } else {
      console.log('✅ match_stories() function exists and works');
    }
  } catch (err: any) {
    console.log('❌ match_stories() function error:', err.message);
    allChecks = false;
  }

  // Check if pgvector extension is enabled
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "SELECT * FROM pg_extension WHERE extname = 'vector'"
    });

    if (error) {
      console.log('⚠️  Cannot check pgvector extension (exec_sql not available)');
    } else if (data && data.length > 0) {
      console.log('✅ pgvector extension is enabled');
    } else {
      console.log('❌ pgvector extension not found');
      allChecks = false;
    }
  } catch (err: any) {
    console.log('⚠️  pgvector check skipped:', err.message);
  }

  // ============================================================================
  // 3. STORIES TABLE SCHEMA VERIFICATION
  // ============================================================================
  console.log('\n3️⃣  STORIES TABLE SCHEMA VERIFICATION');
  console.log('------------------------------------------------------------');

  const requiredFields = [
    'id',
    'title',
    'content',
    'storyteller_id',
    'story_type',
    'embedding',
    'quality_score',
    'engagement_score',
    'views',
    'shares',
    'likes',
    'is_public',
    'is_featured',
    'contains_traditional_knowledge',
    'elder_approval_given',
    'cultural_sensitivity_level',
    'tags',
    'keywords'
  ];

  try {
    const { data: stories } = await supabase
      .from('stories')
      .select('*')
      .limit(1);

    if (stories && stories.length > 0) {
      const story = stories[0];
      const existingFields = Object.keys(story);

      console.log('Required fields check:');
      let missingFields = 0;
      requiredFields.forEach(field => {
        if (existingFields.includes(field)) {
          console.log(`   ✓ ${field}`);
        } else {
          console.log(`   ✗ ${field} - MISSING`);
          missingFields++;
          allChecks = false;
        }
      });

      if (missingFields === 0) {
        console.log('\n✅ All required fields exist');
      } else {
        console.log(`\n❌ ${missingFields} required fields missing`);
      }

      // Check for placement fields (these we'll add)
      const placementFields = ['page_context', 'page_section', 'display_order'];
      const existingPlacement = placementFields.filter(f => existingFields.includes(f));

      console.log(`\nPlacement fields: ${existingPlacement.length}/${placementFields.length} exist`);
      if (existingPlacement.length === 0) {
        console.log('⚠️  Placement fields need to be added (this is expected)');
      } else if (existingPlacement.length === placementFields.length) {
        console.log('✅ All placement fields already exist');
      } else {
        console.log('⚠️  Some placement fields exist:', existingPlacement.join(', '));
      }
    }
  } catch (err: any) {
    console.log('❌ Schema check error:', err.message);
    allChecks = false;
  }

  // ============================================================================
  // 4. PROFILES TABLE & RELATIONSHIPS
  // ============================================================================
  console.log('\n4️⃣  PROFILES TABLE & STORYTELLER RELATIONSHIPS');
  console.log('------------------------------------------------------------');

  try {
    // Test the storyteller relationship
    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        storyteller:storyteller_id (
          id,
          full_name,
          preferred_name,
          is_elder,
          is_cultural_advisor
        )
      `)
      .limit(5);

    if (error) {
      console.log('❌ Storyteller relationship error:', error.message);
      allChecks = false;
    } else {
      const storiesWithStorytellers = stories?.filter(s => s.storyteller) || [];
      console.log(`✅ Storyteller relationship works`);
      console.log(`   ${storiesWithStorytellers.length}/5 stories have storyteller data`);

      if (storiesWithStorytellers.length > 0) {
        const sample = storiesWithStorytellers[0];
        console.log(`   Sample: "${sample.title}" by ${sample.storyteller?.preferred_name || sample.storyteller?.full_name}`);
      }
    }
  } catch (err: any) {
    console.log('❌ Relationship test error:', err.message);
    allChecks = false;
  }

  // ============================================================================
  // 5. INTERVIEWS TABLE & TRANSCRIPTS
  // ============================================================================
  console.log('\n5️⃣  INTERVIEWS TABLE & TRANSCRIPTS');
  console.log('------------------------------------------------------------');

  try {
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select(`
        id,
        interview_title,
        raw_transcript,
        key_themes,
        storyteller:storyteller_id (
          full_name,
          is_elder
        )
      `)
      .not('raw_transcript', 'is', null)
      .limit(5);

    if (error) {
      console.log('❌ Interviews query error:', error.message);
      allChecks = false;
    } else {
      console.log(`✅ Interviews table accessible`);
      console.log(`   ${interviews?.length || 0} interviews with transcripts found`);

      const withThemes = interviews?.filter(i => i.key_themes) || [];
      console.log(`   ${withThemes.length} have AI-extracted themes`);

      if (interviews && interviews.length > 0) {
        const elderInterviews = interviews.filter(i => i.storyteller?.is_elder);
        console.log(`   ${elderInterviews.length} are from elders`);
      }
    }
  } catch (err: any) {
    console.log('❌ Interviews check error:', err.message);
    allChecks = false;
  }

  // ============================================================================
  // 6. EMBEDDING STATUS
  // ============================================================================
  console.log('\n6️⃣  VECTOR EMBEDDINGS STATUS');
  console.log('------------------------------------------------------------');

  try {
    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, embedding')
      .limit(100);

    if (stories) {
      const withEmbeddings = stories.filter(s => s.embedding && s.embedding !== null);
      const coverage = ((withEmbeddings.length / stories.length) * 100).toFixed(1);

      console.log(`Stories with embeddings: ${withEmbeddings.length}/${stories.length} (${coverage}%)`);

      if (withEmbeddings.length === 0) {
        console.log('⚠️  No stories have embeddings - need to generate');
      } else if (withEmbeddings.length < stories.length) {
        console.log('⚠️  Partial embedding coverage - some stories need embeddings');
      } else {
        console.log('✅ All stories have embeddings');
      }

      // Check embedding dimensions
      if (withEmbeddings.length > 0 && Array.isArray(withEmbeddings[0].embedding)) {
        const dimensions = withEmbeddings[0].embedding.length;
        console.log(`   Embedding dimensions: ${dimensions}`);

        if (dimensions === 1536) {
          console.log('   ✅ Using OpenAI embeddings (1536-dim)');
        } else if (dimensions === 1024) {
          console.log('   ✅ Using Voyage AI embeddings (1024-dim)');
        } else {
          console.log(`   ⚠️  Unexpected embedding dimensions: ${dimensions}`);
        }
      }
    }
  } catch (err: any) {
    console.log('❌ Embedding check error:', err.message);
    allChecks = false;
  }

  // ============================================================================
  // 7. DATA QUALITY CHECK
  // ============================================================================
  console.log('\n7️⃣  DATA QUALITY CHECK');
  console.log('------------------------------------------------------------');

  try {
    const { data: stories } = await supabase
      .from('stories')
      .select('*')
      .limit(100);

    if (stories) {
      // Check which stories have quality scores
      const withQuality = stories.filter(s => s.quality_score && s.quality_score > 0);
      console.log(`Quality scores: ${withQuality.length}/${stories.length} stories`);

      // Check engagement data
      const withEngagement = stories.filter(s => s.views > 0 || s.shares > 0 || s.likes > 0);
      console.log(`Engagement data: ${withEngagement.length}/${stories.length} stories`);

      // Check cultural metadata
      const withCulturalInfo = stories.filter(s =>
        s.contains_traditional_knowledge ||
        s.elder_approval_given ||
        s.cultural_sensitivity_level
      );
      console.log(`Cultural metadata: ${withCulturalInfo.length}/${stories.length} stories`);

      // Check storyteller linkage
      const withStoryteller = stories.filter(s => s.storyteller_id);
      console.log(`Storyteller linked: ${withStoryteller.length}/${stories.length} stories`);
    }
  } catch (err: any) {
    console.log('❌ Data quality check error:', err.message);
    allChecks = false;
  }

  // ============================================================================
  // 8. CLIENT LIBRARY CHECK
  // ============================================================================
  console.log('\n8️⃣  CLIENT LIBRARY VERIFICATION');
  console.log('------------------------------------------------------------');

  try {
    // Check if client files exist
    const fs = await import('fs');
    const path = await import('path');

    const clientFiles = [
      'lib/supabase/client.ts',
      'lib/supabase/server.ts',
      'lib/supabase/database.types.ts'
    ];

    let allFilesExist = true;
    for (const file of clientFiles) {
      const filePath = path.resolve(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✓ ${file}`);
      } else {
        console.log(`   ✗ ${file} - MISSING`);
        allFilesExist = false;
        allChecks = false;
      }
    }

    if (allFilesExist) {
      console.log('✅ All client files exist');
    }
  } catch (err: any) {
    console.log('⚠️  Client file check skipped:', err.message);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n============================================================');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('============================================================\n');

  if (allChecks) {
    console.log('✅ ALL CHECKS PASSED - Supabase integration is world-class!\n');
    return 0;
  } else {
    console.log('⚠️  SOME CHECKS FAILED - Review issues above\n');
    console.log('Next steps:');
    console.log('1. Fix any missing database functions');
    console.log('2. Generate embeddings for stories');
    console.log('3. Add placement columns with migration');
    console.log('4. Verify RLS policies if needed\n');
    return 1;
  }
}

verifyIntegration()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err);
    process.exit(1);
  });
