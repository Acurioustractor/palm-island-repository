import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { batchEmbeddings } from '../lib/scraper/embeddings';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface Interview {
  id: string;
  storyteller_id?: string;
  raw_transcript: string;
  edited_transcript?: string;
  interview_title?: string;
  interview_date?: string;
  interview_location?: string;
  can_be_quoted?: boolean;
  cultural_sensitivity_notes?: string;
  requires_elder_approval?: boolean;
  key_themes?: string[];
  storyteller?: {
    id: string;
    full_name?: string;
    preferred_name?: string;
    is_elder?: boolean;
    is_cultural_advisor?: boolean;
    can_share_traditional_knowledge?: boolean;
  };
}

interface StoryGeneration {
  title: string;
  content: string;
  story_type: string;
  emotional_theme: string;
  category: string;
  key_themes: string[];
  key_quotes: string[];
  contains_traditional_knowledge: boolean;
  cultural_sensitivity_level: 'low' | 'medium' | 'high';
  summary: string;
}

async function analyzeTranscript(
  transcript: string,
  storyteller?: Interview['storyteller']
): Promise<StoryGeneration> {
  const prompt = `You are analyzing an interview transcript from the Palm Island Aboriginal Community in Australia. Extract a compelling story from this transcript.

CONTEXT:
- This is a real interview with a Palm Island community member
- ${storyteller?.is_elder ? 'The storyteller is an ELDER - treat with utmost respect' : 'The storyteller is a community member'}
- ${storyteller?.is_cultural_advisor ? 'The storyteller is a Cultural Advisor' : ''}

TRANSCRIPT:
${transcript.substring(0, 4000)}

Please analyze this transcript and generate a story following these guidelines:

1. **Title**: Create a compelling, respectful title (max 80 characters)
   - For elders: Use "Elder [Name]:" or similar respectful framing
   - Make it descriptive and engaging

2. **Content**: Write a 300-500 word story that:
   - Captures the essence and emotion of the interview
   - Uses direct quotes where powerful (with quotation marks)
   - Maintains the storyteller's voice and perspective
   - Is written in third person but honors first-person quotes
   - Respects cultural protocols and sensitivity

3. **Story Type**: Choose ONE:
   - elder_wisdom (if storyteller is elder, or shares traditional knowledge)
   - community_story (everyday life, experiences)
   - service_success (about PICC services or programs)
   - achievement (personal or community achievement)
   - challenge_overcome (resilience story)

4. **Emotional Theme**: Choose ONE that best fits:
   - hope_aspiration
   - pride_accomplishment
   - connection_belonging
   - resilience
   - healing
   - empowerment
   - innovation

5. **Category**: Choose ONE primary category:
   - health, youth, elders, culture, education, environment, community, services

6. **Key Themes**: Extract 3-5 main themes (e.g., "cultural identity", "family", "resilience")

7. **Key Quotes**: Extract 3-5 powerful direct quotes from the transcript

8. **Cultural Sensitivity**:
   - Does this contain traditional knowledge, ceremonies, or sacred information? (true/false)
   - Sensitivity level: low (general story), medium (cultural content), high (sacred/sensitive)

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "content": "string",
  "story_type": "string",
  "emotional_theme": "string",
  "category": "string",
  "key_themes": ["string"],
  "key_quotes": ["string"],
  "contains_traditional_knowledge": boolean,
  "cultural_sensitivity_level": "low|medium|high",
  "summary": "One sentence summary of the story"
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  const result = JSON.parse(completion.choices[0].message.content!);
  return result as StoryGeneration;
}

async function generateStoriesFromInterviews() {
  console.log('\n🎤 GENERATE STORIES FROM INTERVIEW TRANSCRIPTS');
  console.log('============================================================\n');

  // Fetch all interviews with transcripts
  const { data: interviews, error: fetchError } = await supabase
    .from('interviews')
    .select(`
      *,
      storyteller:storyteller_id (
        id,
        full_name,
        preferred_name,
        is_elder,
        is_cultural_advisor,
        can_share_traditional_knowledge
      )
    `)
    .not('raw_transcript', 'is', null); // Process all interviews

  if (fetchError) {
    console.error('❌ Error fetching interviews:', fetchError.message);
    process.exit(1);
  }

  if (!interviews || interviews.length === 0) {
    console.log('⚠️  No interviews with transcripts found (or all already converted)');
    process.exit(0);
  }

  console.log(`📚 Found ${interviews.length} interviews with transcripts\n`);

  // Ask for confirmation
  console.log('⚠️  WARNING: This will use OpenAI API to analyze transcripts');
  console.log(`   Estimated cost: ~$${(interviews.length * 0.05).toFixed(2)} (GPT-4)` );
  console.log('\nProcessing interviews...\n');

  let successCount = 0;
  let errorCount = 0;
  const storyTexts: string[] = [];
  const storyIds: string[] = [];

  for (let i = 0; i < interviews.length; i++) {
    const interview = interviews[i];
    const num = i + 1;

    console.log(`\n[${num}/${interviews.length}] Processing interview: ${interview.id}`);

    if (!interview.raw_transcript || interview.raw_transcript.length < 100) {
      console.log('   ⚠️  Transcript too short, skipping');
      errorCount++;
      continue;
    }

    try {
      // Analyze transcript with AI
      console.log('   🤖 Analyzing transcript with AI...');
      const storyData = await analyzeTranscript(
        interview.raw_transcript,
        interview.storyteller
      );

      console.log(`   ✓ Generated: "${storyData.title}"`);
      console.log(`   → Type: ${storyData.story_type}`);
      console.log(`   → Theme: ${storyData.emotional_theme}`);
      console.log(`   → Cultural sensitivity: ${storyData.cultural_sensitivity_level}`);

      if (storyData.contains_traditional_knowledge) {
        console.log('   ⚠️  Contains traditional knowledge - requires elder approval');
      }

      // Determine if elder approval is needed
      const needsElderApproval =
        storyData.contains_traditional_knowledge ||
        storyData.cultural_sensitivity_level === 'high' ||
        interview.requires_elder_approval;

      const isElder = interview.storyteller?.is_elder === true;

      // Create story in database
      const { data: newStory, error: storyError } = await supabase
        .from('stories')
        .insert({
          title: storyData.title,
          content: storyData.content,
          story_type: storyData.story_type,
          category: storyData.category,
          sub_category: storyData.emotional_theme, // Store emotional theme in sub_category
          storyteller_id: interview.storyteller_id,

          // Cultural protocols
          contains_traditional_knowledge: storyData.contains_traditional_knowledge,
          cultural_sensitivity_level: storyData.cultural_sensitivity_level,
          elder_approval_required: needsElderApproval,
          elder_approval_given: isElder && !needsElderApproval, // Auto-approve elder's own stories if not sensitive

          // Publication status
          is_public: !needsElderApproval, // Auto-publish if no approval needed
          is_verified: isElder, // Verify elder stories automatically
          status: needsElderApproval ? 'draft' : 'published',
          published_at: needsElderApproval ? null : new Date().toISOString(),
          story_date: interview.interview_date,

          // Metadata
          tags: storyData.key_themes,
          keywords: storyData.key_themes,
          metadata: {
            source: 'interview',
            interview_id: interview.id,
            interview_date: interview.interview_date,
            interview_location: interview.interview_location,
            key_quotes: storyData.key_quotes,
            emotional_theme: storyData.emotional_theme,
            ai_generated: true,
            generation_date: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (storyError) {
        console.log(`   ❌ Error creating story: ${storyError.message}`);
        errorCount++;
        continue;
      }

      // Update interview to mark story as created
      await supabase
        .from('interviews')
        .update({
          stories_created: true,
          key_themes: storyData.key_themes,
          edited_transcript: storyData.content // Store the story as edited transcript
        })
        .eq('id', interview.id);

      // Collect for embedding generation
      storyTexts.push(`${storyData.title}\n\n${storyData.content}`);
      storyIds.push(newStory.id);

      console.log(`   ✅ Story created: ${newStory.id}`);
      console.log(`   📍 Status: ${needsElderApproval ? 'DRAFT (needs approval)' : 'PUBLISHED'}`);

      successCount++;

      // Rate limiting - wait 1 second between API calls
      if (i < interviews.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  // Generate embeddings for all new stories
  if (storyTexts.length > 0) {
    console.log('\n\n🔮 Generating vector embeddings for new stories...\n');

    try {
      const embeddings = await batchEmbeddings(storyTexts, {
        batchSize: 20,
        preferredProvider: 'openai',
        inputType: 'document',
        onProgress: (completed, total) => {
          const percent = ((completed / total) * 100).toFixed(0);
          process.stdout.write(`\r   Progress: ${completed}/${total} (${percent}%)   `);
        }
      });

      console.log('\n   ✓ Embeddings generated\n');

      // Update stories with embeddings
      for (let i = 0; i < storyIds.length; i++) {
        await supabase
          .from('stories')
          .update({ embedding: embeddings[i] })
          .eq('id', storyIds[i]);
      }

      console.log('   ✓ Embeddings saved to database\n');
    } catch (embError: any) {
      console.error('   ⚠️  Error generating embeddings:', embError.message);
      console.log('   Stories created but without embeddings - run generate-story-embeddings.ts later\n');
    }
  }

  // Summary
  console.log('\n============================================================');
  console.log('📊 GENERATION SUMMARY');
  console.log('============================================================');
  console.log(`✅ Stories created: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Total interviews processed: ${interviews.length}\n`);

  // Show story breakdown
  const { data: newStories } = await supabase
    .from('stories')
    .select('story_type, is_public, contains_traditional_knowledge')
    .in('id', storyIds);

  if (newStories && newStories.length > 0) {
    const published = newStories.filter(s => s.is_public).length;
    const needsApproval = newStories.filter(s => !s.is_public).length;
    const elderStories = newStories.filter(s => s.story_type === 'elder_wisdom').length;
    const traditionalKnowledge = newStories.filter(s => s.contains_traditional_knowledge).length;

    console.log('📋 BREAKDOWN:');
    console.log(`   Published: ${published}`);
    console.log(`   Needs Approval: ${needsApproval}`);
    console.log(`   Elder Stories: ${elderStories}`);
    console.log(`   Traditional Knowledge: ${traditionalKnowledge}\n`);

    const storyTypes: Record<string, number> = {};
    newStories.forEach(s => {
      storyTypes[s.story_type] = (storyTypes[s.story_type] || 0) + 1;
    });

    console.log('📊 BY TYPE:');
    Object.entries(storyTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log();
  }

  console.log('✅ Story generation complete!\n');

  if (successCount > 0) {
    console.log('🚀 NEXT STEPS:');
    console.log('1. Review stories in Supabase (especially those needing approval)');
    console.log('2. Run auto-assignment to place new stories:');
    console.log('   npx tsx scripts/auto-assign-stories.ts');
    console.log();
  }
}

generateStoriesFromInterviews()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\n❌ FATAL ERROR:', err.message);
    console.error(err);
    process.exit(1);
  });
