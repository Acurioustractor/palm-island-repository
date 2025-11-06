#!/usr/bin/env tsx
/**
 * COMPLETE STORM STORIES IMPORT - ALL 26 STORIES
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

const PICC_ORG_ID = '3c2011b9-f80d-4289-b300-0cd383cff479';

const SERVICES = {
  bwgcolmanHealing: 'caeea230-5121-4f19-a388-c6efb7b68322',
  mentalHealth: '4de6e20c-bc16-49fb-add7-a1ffc76c8fe6',
  familyWellbeing: '2e1a87d2-f1c5-428f-8aab-abad6c09235c',
  childCare: '1260c7bd-dfba-4233-b4fe-2849525d5524',
  educationSupport: '45a7c2fe-f6bd-4897-8aff-01ff07e9317d',
  communityDevelopment: '58fd6ba5-23ad-4e4b-a0b4-24c18a14920f',
  youthServices: '98a6cea8-a728-423a-a615-23c7994bca25',
  culturalPrograms: '41d1f57c-2193-4c05-8374-b8304ecfce85',
  housingSupport: '68b4185e-f2a7-4942-b7ee-ceea4c3232ea',
};

async function main() {
  console.log('🌪️  Complete Storm Stories Import - All 26 Stories');
  console.log('================================================\n');

  try {
    console.log('📝 Step 1: Setting up storyteller profiles...');
    const profiles = await setupProfiles();
    console.log('✅ Profiles ready\n');

    console.log('📚 Step 2: Importing 26 storm stories...');
    const count = await importStories(profiles);
    console.log(`✅ Imported ${count} new stories\n`);

    console.log('🔍 Step 3: Verifying import...');
    const { count: totalCount } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true });
    console.log(`✅ Total stories in database: ${totalCount}\n`);

    console.log('================================================');
    console.log('🎉 SUCCESS! All storm stories imported.');
    console.log('================================================\n');
    console.log('Visit: http://localhost:3000/stories\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function setupProfiles() {
  const profiles: Record<string, string> = {};

  profiles.communityVoice = await getOrCreateProfile({
    full_name: 'Community Voice',
    preferred_name: 'Community',
    bio: 'Collective voice of Palm Island community members.',
    location: 'Palm Island',
    storyteller_type: 'community_member',
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
  console.log('  ✓ Community Voice');

  profiles.mensGroup = await getOrCreateProfile({
    full_name: "Men's Group",
    preferred_name: "Men's Group",
    bio: "Palm Island Men's Group - supporting recovery.",
    location: 'Palm Island',
    storyteller_type: 'community_member',
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
  console.log("  ✓ Men's Group");

  profiles.eldersGroup = await getOrCreateProfile({
    full_name: 'Elders Group',
    preferred_name: 'Elders',
    bio: 'Palm Island Elders - keepers of traditional knowledge.',
    location: 'Palm Island',
    storyteller_type: 'elder',
    is_elder: true,
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
  console.log('  ✓ Elders Group');

  profiles.playgroupStaff = await getOrCreateProfile({
    full_name: 'Playgroup Staff',
    preferred_name: 'Playgroup Team',
    bio: 'Staff from Palm Island Early Learning Centre.',
    location: 'Palm Island',
    storyteller_type: 'service_provider',
    is_service_provider: true,
    profile_visibility: 'public',
    primary_organization_id: PICC_ORG_ID
  });
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
  const allStories = [
    // 1-8: Already imported
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
      service_id: SERVICES.mentalHealth
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Clay Alfred: Prepared for the Storm',
      content: "Clay Alfred was well-prepared when the storm hit Palm Island - he had a generator and was ready. He has been involved with the men's group for 5 years, sharing his recovery journey from alcohol dependency. Clay keeps busy and productive by making furniture from recycled materials, turning waste into functional art.",
      story_type: 'personal_story',
      category: 'health',
      sub_category: 'recovery',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.mentalHealth
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Sisters Patricia and Kranjus: Community Strength',
      content: "Patricia and Kranjus Doyle, sisters deeply connected to Palm Island, share their Aboriginal identity and their roles at PIC and Telstra. When the storm hit, they experienced significant power outages but found strength in community support.",
      story_type: 'community_story',
      category: 'community',
      sub_category: 'resilience',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.communityDevelopment
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Agnes Watten: $5,000 in Storm Damage',
      content: "Agnes Watten experienced devastating storm damage to her home. Water infiltrated her house, ruining a $5,000 bedroom suite and causing significant electrical issues. Months after the storm, repairs are still needed.",
      story_type: 'impact_story',
      category: 'housing',
      sub_category: 'storm_damage',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.housingSupport
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Thomas the Tanker, Margaret & Venus: Storm Veterans',
      content: 'Thomas "the Tanker", Margaret, and Venus demonstrate the strength of preparation and experience. They weathered the storm without needing government assistance, drawing on Thomas\'s extensive experience with multiple cyclones over the years.',
      story_type: 'community_story',
      category: 'community',
      sub_category: 'preparedness',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.communityDevelopment
    },
    {
      storyteller_id: profiles.playgroupStaff,
      title: 'Playgroup Closed for Weeks: Building Flooded',
      content: "Jane, Sakia, Gary, Talitha, and Alice from the playgroup describe the devastating flooding that closed their early learning services for 2-3 weeks. Water damaged electrical systems throughout the building. Mold became a serious health concern.",
      story_type: 'service_story',
      category: 'education',
      sub_category: 'early_learning',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.childCare
    },
    {
      storyteller_id: profiles.eldersGroup,
      title: 'Elders Speak: "We Should Have Been Consulted"',
      content: 'Ethel, Frank, Elsa, and other elders gathered to discuss the storm\'s devastating impacts: severe flooding, power outages lasting days, barge delays cutting off supplies, critical food shortages. But their deepest frustration is being excluded from emergency planning and decision-making. "We should have been consulted," they state.',
      story_type: 'traditional_knowledge',
      category: 'culture',
      sub_category: 'elder_wisdom',
      access_level: 'public',
      status: 'published',
      contains_traditional_knowledge: true,
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.familyWellbeing
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Gregory: Worse Rain Than 50 Years of Cyclones',
      content: 'Gregory, 58 years old, has lived through decades of cyclones including the legendary Cyclone Althea in 1971. He states unequivocally that this recent rain event produced worse rainfall than all previous cyclones combined over 50 years. Landslides devastated roads across the island.',
      story_type: 'impact_story',
      category: 'environment',
      sub_category: 'climate',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    // 9-26: NEW STORIES
    {
      storyteller_id: profiles.communityVoice,
      title: 'Community Innovation: Beds, Washing Machines, and Orange Sky',
      content: 'Palm Island community members discuss innovative projects addressing practical needs during recovery. Experimental collapsible beds and washing machine distribution programs help families recover from storm damage. Connections with Orange Sky bring mobile laundry services to the community.',
      story_type: 'impact_story',
      category: 'community',
      sub_category: 'innovation',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.communityDevelopment
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Storm, History, and Healing: Breaking Generational Trauma',
      content: 'Community members connect the storm\'s impact to deeper historical wounds. Discussion covers exemption cards, the forced loss of language, and oppressive government policies that have shaped Palm Island\'s history. The storm damage compounds generations of systemic disadvantage.',
      story_type: 'traditional_knowledge',
      category: 'culture',
      sub_category: 'historical_trauma',
      access_level: 'public',
      status: 'published',
      contains_traditional_knowledge: true,
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.culturalPrograms
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Christopher: The Storm Revealed Government Failures',
      content: 'Christopher speaks powerfully about how the storm exposed systemic failures in government support for First Nations people. Palm Island lacks proper evacuation centers despite being cyclone-prone. Store prices remain prohibitively expensive. First Nations people face disproportionate incarceration rates.',
      story_type: 'impact_story',
      category: 'justice',
      sub_category: 'systemic_inequality',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Ellen Friday: Still Waiting for a Fridge',
      content: 'Ellen Friday lost her fridge to storm damage. Months later, she still needs basic appliances - a replacement fridge and washing machine. Living at 190 Dee Street, Ellen reaches out for community support. Her story represents countless Palm Island families still waiting for assistance with essential household items long after the storm passed.',
      story_type: 'personal_story',
      category: 'housing',
      sub_category: 'basic_needs',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.housingSupport
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Storytelling, Data Sovereignty, and Community Recovery',
      content: 'Community leaders discuss the critical intersection of storytelling, data sovereignty, and disaster recovery. The Movember men\'s program brings $1.9 million over 5 years to support men\'s wellbeing. Storm recovery efforts include coordinated food distribution networks. Central to all of this is working with elders to preserve traditional knowledge.',
      story_type: 'impact_story',
      category: 'community',
      sub_category: 'data_sovereignty',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.mensGroup,
      title: 'Rodney, Daniel & George: 24 Hours Without Power',
      content: 'Rodney, Daniel, and George from the men\'s group share their experience of a 24-hour power outage during the storm. Despite the blackout, they stayed active in community support, helping distribute beds to families in need. The men\'s group meetings at the police station continued even during crisis.',
      story_type: 'community_story',
      category: 'health',
      sub_category: 'mens_health',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.mentalHealth
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Gail Larry: Artist Calls for Stronger Infrastructure',
      content: 'Artist Gail Larry uses her creative voice to advocate for change. She calls for stronger construction standards on Palm Island and dramatically improved infrastructure to withstand increasingly severe weather events. Her artwork displayed at the hospital brings beauty and cultural expression to healthcare spaces.',
      story_type: 'impact_story',
      category: 'culture',
      sub_category: 'art_activism',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.culturalPrograms
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Craig: Walking Palm Island Through the Storm',
      content: 'Craig walks Palm Island daily, carrying a stick for protection from dogs. During the floods, he continued his walks, observing the storm\'s impact across the community. While he personally wasn\'t badly affected, his daily walks gave him unique insight into which areas flooded worst and how different families were coping.',
      story_type: 'personal_story',
      category: 'community',
      sub_category: 'observation',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Margaret Rose Parker (75): Justice, DV Support & Storm Response',
      content: 'Margaret Rose Parker, 75 years old and born in 1946, works with the Community Justice Group alongside Denise Gia. They provide crucial domestic violence support and advocate for elder involvement in court processes. Margaret shares her own experience with domestic violence, using her story to help others. During and after the storm, they helped community members access basic needs.',
      story_type: 'impact_story',
      category: 'justice',
      sub_category: 'community_justice',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'James, Jordan & Stanley: PIC Emergency Response',
      content: 'James, Jordan, and Stanley from Palm Island Council (PIC) were on the front lines of storm response. They coordinated emergency services, managed ongoing road repairs, and dealt with increasing landslides caused by unprecedented rainfall. Their experience reveals the need for dramatically improved emergency services infrastructure.',
      story_type: 'service_story',
      category: 'environment',
      sub_category: 'emergency_response',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Catherine (66): Still No Repairs',
      content: 'Catherine, 66 years old, shares that months after the storm, she still hasn\'t had repairs done to her home. She refers to Auntie Denny, a counsellor, for more information about the repair situation. This brief interaction reveals the ongoing housing crisis affecting elders on Palm Island. Many seniors are living in storm-damaged homes without proper repairs.',
      story_type: 'personal_story',
      category: 'housing',
      sub_category: 'elder_care',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.housingSupport
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Technology Challenges: Drones and Documentation',
      content: 'Community members discuss challenges using drones to document storm damage. In Alice Springs, a phone overheated and lost connection during aerial documentation attempts. These technical challenges highlight the difficulties of using modern technology in remote areas with extreme temperatures.',
      story_type: 'service_story',
      category: 'community',
      sub_category: 'technology',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'At the Mountain During the Storm: A Story of Fear',
      content: 'A community member shares their experience of being at the mountain when the storm hit. It was scary. This brief but powerful statement captures the terror many Palm Islanders felt during the unprecedented weather event. Being in an exposed location like the mountain during such severe conditions would have been particularly frightening.',
      story_type: 'personal_story',
      category: 'community',
      sub_category: 'fear',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Preserving History: The Centenary Exhibition',
      content: 'The Palm Island local history museum and knowledge center preserves the community\'s story. The 2018 centenary exhibition documenting 100 years of Palm Island history traveled to Brisbane and Townsville, sharing the island\'s story with mainland audiences. This cultural preservation work continues even during recovery from the storm.',
      story_type: 'service_story',
      category: 'culture',
      sub_category: 'history',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.culturalPrograms
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Gunnamaru and Bugumanbara: Reclaiming Traditional Names',
      content: 'Community members discuss critical native title issues and the reclamation of traditional names. "Gunnamaru" is the traditional name for all the islands in the group, while "Bugumanbara" specifically refers to the Great Palm Islands. This conversation about naming represents the broader struggle to restore Indigenous sovereignty and recognition.',
      story_type: 'traditional_knowledge',
      category: 'culture',
      sub_category: 'native_title',
      access_level: 'public',
      status: 'published',
      contains_traditional_knowledge: true,
      organization_id: PICC_ORG_ID,
      service_id: SERVICES.culturalPrograms
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Angela: Documenting the Storm Through Photos',
      content: 'Angela participates in documenting the storm\'s impact through photography. She provides her phone number (0472 653 9653) to receive photos, showing the importance of community members having visual records of the disaster. These photos serve as evidence for insurance claims, government assistance applications, and historical documentation.',
      story_type: 'personal_story',
      category: 'community',
      sub_category: 'documentation',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Community Voice Fragment: "What\'s On Here"',
      content: 'A brief fragment of conversation captures someone asking "what\'s on here" - possibly referring to recording equipment, documentation materials, or information being shared. While brief, these fragments represent the many small interactions and questions that occurred during storm recovery documentation efforts.',
      story_type: 'personal_story',
      category: 'community',
      sub_category: 'conversation',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    },
    {
      storyteller_id: profiles.communityVoice,
      title: 'Group Conversation: Innovation and Expensive Goods',
      content: 'A group conversation explores multiple aspects of storm recovery and ongoing community challenges. Experimental bed and washing machine projects address immediate housing needs. Connections with Orange Sky mobile laundry services bring additional support. The persistent issue of expensive goods on Palm Island - making recovery even harder - is discussed frankly.',
      story_type: 'community_story',
      category: 'community',
      sub_category: 'challenges',
      access_level: 'public',
      status: 'published',
      organization_id: PICC_ORG_ID
    }
  ];

  // Check which stories already exist
  const { data: existingStories } = await supabase
    .from('stories')
    .select('title');

  const existingTitles = new Set(existingStories?.map((s: any) => s.title) || []);

  // Filter to only new stories
  const newStories = allStories.filter(s => !existingTitles.has(s.title));

  if (newStories.length === 0) {
    console.log('  ℹ️  All stories already imported!');
    return 0;
  }

  let imported = 0;
  for (const story of newStories) {
    const { error } = await supabase
      .from('stories')
      .insert({ ...story, published_at: new Date().toISOString() });

    if (error) {
      console.error(`  ❌ Failed: ${story.title}`);
      console.error(error);
    } else {
      imported++;
      console.log(`  ✓ ${story.title.substring(0, 60)}...`);
    }
  }

  return imported;
}

main();
