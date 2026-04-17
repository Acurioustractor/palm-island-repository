/**
 * Enrich Service Descriptions
 *
 * Reads annual reports and knowledge entries from the database,
 * uses Claude to extract accurate 2-3 sentence descriptions for each service,
 * then outputs results for review before applying.
 *
 * Usage:
 *   npx tsx scripts/enrich-service-descriptions.ts              # Dry run (show proposals)
 *   npx tsx scripts/enrich-service-descriptions.ts --apply       # Apply to database
 */
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY as string,
});

const APPLY = process.argv.includes('--apply');
const MIN_DESC_LENGTH = 100; // Only enrich descriptions shorter than this

async function main() {
  console.log(`=== ENRICH SERVICE DESCRIPTIONS (${APPLY ? 'APPLY' : 'DRY RUN'}) ===\n`);

  // 1. Load all services
  const { data: services } = await supabase
    .from('organization_services')
    .select('id, name, slug, description, service_category')
    .eq('is_active', true)
    .order('name');

  const needsEnrichment = (services || []).filter(
    (s: any) => !s.description || s.description.trim().length < MIN_DESC_LENGTH
  );

  console.log(`Total services: ${(services || []).length}`);
  console.log(`Need enrichment (< ${MIN_DESC_LENGTH} chars): ${needsEnrichment.length}\n`);

  if (needsEnrichment.length === 0) {
    console.log('All services already have adequate descriptions.');
    return;
  }

  // 2. Load knowledge base content
  console.log('Loading knowledge base...');

  // Annual reports
  const { data: annualReports } = await supabase
    .from('knowledge_entries')
    .select('title, content')
    .eq('category', 'Annual Reports')
    .order('title', { ascending: false });

  // Service-specific entries
  const { data: serviceEntries } = await supabase
    .from('knowledge_entries')
    .select('title, category, content')
    .neq('category', 'Annual Reports')
    .gt('content', '');

  // Build context document from annual reports (most recent first, truncate to fit)
  const reportContext = (annualReports || [])
    .filter((r: any) => r.content && r.content.length > 200)
    .slice(0, 8) // Most recent 8 years
    .map((r: any) => `### ${r.title}\n${r.content.slice(0, 4000)}`)
    .join('\n\n---\n\n');

  const serviceContext = (serviceEntries || [])
    .filter((e: any) => e.content && e.content.length > 50)
    .map((e: any) => `### ${e.title} [${e.category}]\n${e.content}`)
    .join('\n\n');

  console.log(`  Annual reports loaded: ${(annualReports || []).length} (using top 8)`);
  console.log(`  Service entries loaded: ${(serviceEntries || []).length}`);
  console.log(`  Total context: ~${Math.round((reportContext.length + serviceContext.length) / 1000)}k chars\n`);

  // 3. Build the service list for the prompt
  const serviceList = needsEnrichment.map((s: any) =>
    `- ${s.name} (slug: ${s.slug}, category: ${s.service_category}, current: "${s.description || ''}")`
  ).join('\n');

  // Also include the good descriptions as examples
  const goodExamples = (services || [])
    .filter((s: any) => s.description && s.description.trim().length >= MIN_DESC_LENGTH)
    .slice(0, 5)
    .map((s: any) => `- ${s.name}: "${s.description}"`)
    .join('\n');

  // 4. Call Claude to generate descriptions
  console.log('Generating descriptions from historical content...\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are helping write service descriptions for the Palm Island Community Company (PICC) website. PICC is an Aboriginal community-controlled organization on Palm Island, Queensland.

## Task
Write a 2-3 sentence description for each service listed below. Each description should:
- Be factual and grounded in the source material provided
- Mention what the service actually does (not generic platitudes)
- Reference Palm Island or the community where appropriate
- Be written in present tense, third person
- Be 80-200 characters long (concise but informative)
- Match the tone of the good examples below

## Good Examples (match this style)
${goodExamples}

## Services Needing Descriptions
${serviceList}

## Source Material: Annual Reports
${reportContext}

## Source Material: Service Knowledge Entries
${serviceContext}

## Output Format
Return ONLY a JSON array with objects like:
[
  { "slug": "service-slug", "description": "The new description text." },
  ...
]

No markdown, no explanation, just the JSON array. If you cannot find specific information about a service in the source material, write a general but accurate description based on the service name and category. Never make up statistics or specific claims not in the sources.`
    }],
  });

  // 5. Parse the response
  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  let descriptions: Array<{ slug: string; description: string }>;
  try {
    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');
    descriptions = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    console.error('Raw response:', text.slice(0, 500));
    return;
  }

  // 6. Display results
  let updated = 0;
  for (const desc of descriptions) {
    const service = needsEnrichment.find((s: any) => s.slug === desc.slug);
    if (!service) {
      console.log(`  [SKIP] Unknown slug: ${desc.slug}`);
      continue;
    }

    console.log(`[${(service as any).service_category}] ${(service as any).name}`);
    console.log(`  OLD: "${(service as any).description || '(empty)'}"`);
    console.log(`  NEW: "${desc.description}"`);
    console.log(`  (${desc.description.length} chars)`);

    if (APPLY) {
      const { error } = await supabase
        .from('organization_services')
        .update({ description: desc.description })
        .eq('slug', desc.slug);

      if (error) {
        console.log(`  [ERROR] ${error.message}`);
      } else {
        console.log(`  [APPLIED]`);
        updated++;
      }
    }
    console.log();
  }

  // 7. Summary
  console.log(`\n=== SUMMARY ===`);
  console.log(`  Descriptions generated: ${descriptions.length}`);
  if (APPLY) {
    console.log(`  Applied to database: ${updated}`);
  } else {
    console.log(`  Run with --apply to update the database.`);
  }
}

main().catch(console.error);
