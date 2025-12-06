import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { openaiEmbeddings, batchEmbeddings } from '../lib/scraper/embeddings';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateStoryEmbeddings() {
  console.log('\n🎯 GENERATING STORY EMBEDDINGS');
  console.log('============================================================\n');

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env.local');
    console.error('   Please add your OpenAI API key to .env.local');
    console.error('   Get one at: https://platform.openai.com/api-keys\n');
    process.exit(1);
  }

  console.log('✅ OpenAI API key found');
  console.log('📊 Model: text-embedding-3-small (1536 dimensions)');
  console.log('💰 Cost: ~$0.00001 per story (~$0.0003 total for 30 stories)\n');

  // Fetch all stories without embeddings
  const { data: stories, error: fetchError } = await supabase
    .from('stories')
    .select('id, title, content')
    .is('embedding', null)
    .eq('is_public', true);

  if (fetchError) {
    console.error('❌ Error fetching stories:', fetchError.message);
    process.exit(1);
  }

  if (!stories || stories.length === 0) {
    console.log('✅ All stories already have embeddings!');
    console.log('   Nothing to do.\n');
    process.exit(0);
  }

  console.log(`📝 Found ${stories.length} stories without embeddings\n`);

  // Prepare texts for embedding
  const texts = stories.map(story => {
    // Combine title and content for better embedding quality
    const text = `${story.title}\n\n${story.content || ''}`.trim();
    return text.substring(0, 8000); // Limit to avoid token limits
  });

  console.log('🔄 Generating embeddings...');
  console.log('   This may take a minute...\n');

  // Generate embeddings using OpenAI
  const result = await batchEmbeddings(texts, {
    batchSize: 20,  // Process 20 at a time
    preferredProvider: 'openai',  // Force OpenAI for 1536-dim
    inputType: 'document',
    onProgress: (completed, total) => {
      const percent = ((completed / total) * 100).toFixed(0);
      process.stdout.write(`\r   Progress: ${completed}/${total} (${percent}%)   `);
    }
  });

  console.log('\n');

  if (!result.success) {
    console.error('❌ Embedding generation failed:', result.error);
    process.exit(1);
  }

  console.log('✅ Embeddings generated successfully!');
  console.log(`   Model: ${result.model}`);
  console.log(`   Total tokens: ${result.totalTokens.toLocaleString()}`);
  console.log(`   Embeddings: ${result.embeddings.length}\n`);

  // Update stories with embeddings
  console.log('💾 Saving embeddings to database...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    const embedding = result.embeddings[i];

    const { error } = await supabase
      .from('stories')
      .update({ embedding })
      .eq('id', story.id);

    if (error) {
      console.log(`   ❌ ${story.title}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✓ ${story.title}`);
      successCount++;
    }
  }

  console.log('\n============================================================');
  console.log('📊 RESULTS');
  console.log('============================================================');
  console.log(`✅ Successfully embedded: ${successCount} stories`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} stories`);
  }
  console.log(`💰 Total cost: ~$${(result.totalTokens / 1000000 * 0.02).toFixed(4)}`);
  console.log('');

  // Verify embeddings were saved
  const { count: embeddedCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  console.log('🔍 VERIFICATION');
  console.log('------------------------------------------------------------');
  console.log(`Stories with embeddings: ${embeddedCount}`);

  const { count: totalCount } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('is_public', true);

  const coverage = ((embeddedCount! / totalCount!) * 100).toFixed(1);
  console.log(`Coverage: ${coverage}%`);

  if (embeddedCount === totalCount) {
    console.log('\n✅ ALL STORIES NOW HAVE EMBEDDINGS!');
    console.log('   Vector search is ready to use!');
    console.log('   You can now use match_stories() and get_similar_stories() functions.\n');
  } else {
    console.log(`\n⚠️  ${totalCount! - embeddedCount!} stories still need embeddings`);
    console.log('   Run this script again to process them.\n');
  }
}

generateStoryEmbeddings()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err);
    process.exit(1);
  });
