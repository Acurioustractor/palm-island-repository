#!/usr/bin/env tsx
/**
 * STORM STORIES IMPORT SCRIPT V2
 * Matches your actual database schema
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// PICC Organization ID
const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479';

// Service IDs from your database
const SERVICES = {
  bwgcolmanHealing: 'caeea230-5121-4f19-a388-c6efb7b68322',
  mentalHealth: '4de6e20c-bc16-49fb-add7-a1ffc76c8fe6',
  familyWellbeing: '2e1a87d2-f1c5-428f-8aab-abad6c09235c',
  childCare: '1260c7bd-dfba-4233-b4fe-2849525d5524',
  educationSupport: '45a7c2fe-f6bd-4897-8aff-01ff07e9317d',
  communityDevelopment: '58fd6ba5-23ad-4e4b-a0b4-24c18a14920f',
  youthServices: '98a6cea8-a728-423a-a615-23c7994bca25',
};

async function main() {
  console.log('🌪️  Storm Stories Import Script V2');
  console.log('================================================\n');

  try {
    // Step 1: Setup profiles
    console.log('📝 Step 1: Setting up storyteller profiles...');
    const profiles = await setupProfiles();
    console.log('✅ Profiles ready\n');

    // Step 2: Import stories
    console.log('📚 Step 2: Importing 26 storm stories...');
    const count = await importStories(profiles);
    console.log(`✅ Imported ${count} stories\n`);

    // Step 3: Verify
    console.log('🔍 Step 3: Verifying import...');
    const { count: totalCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Total stories in database: ${totalCount}\n`);

    console.log('================================================');
    console.log('🎉 SUCCESS! Storm stories imported.');
    console.log('================================================\n');
    console.log('Next: npm run dev → http://localhost:3000/stories\n');

  } catch (error) {
    console.error('❌ Error during import:');
    console.error(error);
    process.exit(1);
  }
}

async function setupProfiles() {
  const profiles: Record<string, string> = {};

  // Community Voice
  const communityVoice = await getOrCreateProfile({
    full_name: 'Community Voice',
    preferred_name: 'Community',
    bio: 'Collective voice of Palm Island community members sharing their experiences.',
    location: 'Palm Island',
    storyteller_type: 'community_member',
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
  profiles.communityVoice = communityVoice;
  console.log('  ✓ Community Voice');

  // Men's Group
  const mensGroup = await getOrCreateProfile({
    full_name: "Men's Group",
    preferred_name: "Men's Group",
    bio: "Palm Island Men's Group - supporting recovery and community.",
    location: 'Palm Island',
    storyteller_type: 'community_member',
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
  profiles.mensGroup = mensGroup;
  console.log("  ✓ Men's Group");

  // Elders Group
  const eldersGroup = await getOrCreateProfile({
    full_name: 'Elders Group',
    preferred_name: 'Elders',
    bio: 'Palm Island Elders - keepers of traditional knowledge.',
    location: 'Palm Island',
    storyteller_type: 'elder',
    is_elder: true,
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
  profiles.eldersGroup = eldersGroup;
  console.log('  ✓ Elders Group');

  // Playgroup Staff
  const playgroupStaff = await getOrCreateProfile({
    full_name: 'Playgroup Staff',
    preferred_name: 'Playgroup Team',
    bio: 'Staff from Palm Island Early Learning Centre.',
    location: 'Palm Island',
    storyteller_type: 'service_provider',
    is_service_provider: true,
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
  profiles.playgroupStaff = playgroupStaff;
  console.log('  ✓ Playgroup Staff');

  return profiles;
}

async function getOrCreateProfile(profileData: any): Promise<string> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', profileData.full_name)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

async function importStories(profiles: Record<string, string>) {
  const stories = [
    {
      storyteller_id: profiles.mensGroup,
      title: "Finding Purpose Beyond Addiction - Men's Group",
      content: "Men from the Palm Island Men's Group discuss their journey to find purpose in life beyond addiction. The discussions cover breaking dependency cycles, the critical importance of community involvement, education, and employment opportunities. Cultural identity plays a central role in recovery. The program received $1.9 million in funding over 5 years for men's programs, creating job opportunities and fostering attitude change toward independence and self-sufficiency.",
      story_type: 'impact_story',
      category: 'health',
      sub_category: 'mens_health',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.mentalHealth,
      published_at: new Date().toISOString()
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Clay Alfred: Prepared for the Storm',
      content: "Clay Alfred was well-prepared when the storm hit Palm Island - he had a generator and was ready. He has been involved with the men's group for 5 years, sharing his recovery journey from alcohol dependency. Clay keeps busy and productive by making furniture from recycled materials, turning waste into functional art. His story demonstrates the power of preparation, community support, and finding creative outlets in recovery.",
      story_type: 'personal_story',
      category: 'health',
      sub_category: 'recovery',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.mentalHealth,
      published_at: new Date().toISOString()
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Sisters Patricia and Kranjus: Community Strength During the Storm',
      content: "Patricia and Kranjus Doyle, sisters deeply connected to Palm Island, share their Aboriginal identity and their roles at PIC and Telstra. When the storm hit, they experienced significant power outages but found strength in community support. Their story highlights the resilience of family bonds and the importance of community connections during crisis events. Their work at essential services kept them connected to the community's needs throughout the recovery.",
      story_type: 'community_story',
      category: 'community',
      sub_category: 'resilience',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.communityDevelopment,
      published_at: new Date().toISOString()
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Agnes Watten: $5,000 in Storm Damage',
      content: "Agnes Watten experienced devastating storm damage to her home. Water infiltrated her house, ruining a $5,000 bedroom suite and causing significant electrical issues. Months after the storm, repairs are still needed and ongoing. Despite these challenges, Agnes remains active in the community and has artwork displayed at the hospital, showing resilience and continued cultural contribution even in the face of housing crisis.",
      story_type: 'impact_story',
      category: 'housing',
      sub_category: 'storm_damage',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      published_at: new Date().toISOString()
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Thomas the Tanker, Margaret & Venus: Storm Veterans',
      content: 'Thomas "the Tanker", Margaret, and Venus demonstrate the strength of preparation and experience. They weathered the storm without needing government assistance, drawing on Thomas\'s extensive experience with multiple cyclones over the years. The community benefited from quality banana distribution from Woolworths during recovery. Their story shows how experience, self-sufficiency, and community food support systems work together during disasters.',
      story_type: 'community_story',
      category: 'community',
      sub_category: 'preparedness',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.communityDevelopment,
      published_at: new Date().toISOString()
    },
    {
      storyteller_id: profiles.playgroupStaff,
      title: 'Playgroup Closed for Weeks: Building Flooded',
      content: "Jane, Sakia, Gary, Talitha, and Alice from the playgroup describe the devastating flooding that closed their early learning services for 2-3 weeks. Water damaged electrical systems throughout the building. Mold became a serious health concern. The closure impacted families across the island, with daycare closure affecting medical staff's ability to work. Months after the storm, they are still awaiting proper repairs. Their story reveals the cascading effects when essential childcare services are disrupted.",
      story_type: 'service_story',
      category: 'education',
      sub_category: 'early_learning',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.childCare,
      published_at: new Date().toISOString()
    },
    {
      storyteller_id: profiles.eldersGroup,
      title: 'Elders Speak: "We Should Have Been Consulted"',
      content: 'Ethel, Frank, Elsa, and other elders gathered to discuss the storm\'s devastating impacts: severe flooding, power outages lasting days, barge delays cutting off supplies, critical food shortages, and extensive palm tree damage. But their deepest frustration is being excluded from emergency planning and decision-making. "We should have been consulted," they state. Elders possess generations of knowledge about surviving disasters on Palm Island. Their exclusion from emergency planning represents a failure to honor traditional knowledge and community governance structures. They demand meaningful inclusion in future disaster preparedness.',
      story_type: 'traditional_knowledge',
      category: 'culture',
      sub_category: 'elder_wisdom',
      access_level: 'public',
      status: 'published',
      contains_traditional_knowledge: true,
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.familyWellbeing,
      published_at: new Date().toISOString()
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Gregory: Worse Rain Than 50 Years of Cyclones',
      content: 'Gregory, 58 years old, has lived through decades of cyclones including the legendary Cyclone Althea in 1971. He states unequivocally that this recent rain event produced worse rainfall than all previous cyclones combined over 50 years. Landslides devastated roads across the island. Months later, road repairs continue. Gregory\'s historical perspective provides crucial context - this was not just another storm, but an unprecedented weather event that exceeded anything in living memory.',
      story_type: 'impact_story',
      category: 'environment',
      sub_category: 'climate',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      published_at: new Date().toISOString()
    }
  ];

  let imported = 0;
  for (const story of stories) {
    const { error } = await supabase
      .from('stories')
      .insert(story);

    if (error) {
      console.error(`  ❌ Failed: ${story.title}`);
      console.error(error);
    } else {
      imported++;
      console.log(`  ✓ ${story.title}`);
    }
  }

  return imported;
}

main();
