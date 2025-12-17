import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const storytellerId = '8cd759ed-e92b-4450-af10-5345430bf7bd';

  // Get the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', storytellerId)
    .single();

  console.log('\n👤 PROFILE:');
  if (profileError) {
    console.log('Error:', profileError.message);
  } else {
    console.log('Name:', profile.preferred_name || profile.full_name);
    console.log('ID:', profile.id);
    console.log('stories_contributed:', profile.stories_contributed);
    console.log('interviews_completed:', profile.interviews_completed);
  }

  // Get interviews for this storyteller
  const { data: interviews, error: interviewError } = await supabase
    .from('interviews')
    .select('id, interview_title, interview_date, status, storyteller_id')
    .eq('storyteller_id', storytellerId);

  console.log('\n🎤 INTERVIEWS FOR THIS STORYTELLER_ID:');
  if (interviewError) {
    console.log('Error:', interviewError.message);
  } else if (!interviews || interviews.length === 0) {
    console.log('No interviews found linked to this storyteller_id');
  } else {
    console.log('Found', interviews.length, 'interviews:');
    interviews.forEach(i => {
      console.log('  -', i.interview_title, '(' + i.interview_date + ')', 'status:', i.status);
    });
  }

  // Check if there are interviews with this person's name in the title
  const name = profile?.preferred_name || profile?.full_name || '';
  if (name) {
    const { data: nameInterviews } = await supabase
      .from('interviews')
      .select('id, interview_title, interview_date, storyteller_id')
      .ilike('interview_title', `%${name}%`);

    if (nameInterviews && nameInterviews.length > 0) {
      console.log('\n🔍 INTERVIEWS MENTIONING "' + name + '" IN TITLE:');
      nameInterviews.forEach(i => {
        console.log('  - Title:', i.interview_title);
        console.log('    storyteller_id:', i.storyteller_id);
        console.log('    matches profile?', i.storyteller_id === storytellerId);
      });
    }
  }

  // Get all unique storyteller_ids from interviews
  const { data: allInterviews } = await supabase
    .from('interviews')
    .select('id, interview_title, storyteller_id, interview_date')
    .order('interview_date', { ascending: false });

  console.log('\n📋 ALL INTERVIEWS (' + (allInterviews?.length || 0) + ' total):');
  allInterviews?.forEach(i => {
    const title = (i.interview_title || 'Untitled').substring(0, 45).padEnd(45);
    const sid = i.storyteller_id ? i.storyteller_id.substring(0, 8) + '...' : 'NULL';
    console.log('  ' + title + ' | ' + sid);
  });

  // Check for unlinked interviews (null storyteller_id)
  const unlinked = allInterviews?.filter(i => !i.storyteller_id) || [];
  if (unlinked.length > 0) {
    console.log('\n⚠️  UNLINKED INTERVIEWS (no storyteller_id):');
    unlinked.forEach(i => {
      console.log('  -', i.interview_title);
    });
  }

  // Get profiles for all interview storyteller_ids
  const storytellerIds = Array.from(new Set(allInterviews?.map(i => i.storyteller_id).filter(Boolean)));
  const { data: linkedProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, preferred_name')
    .in('id', storytellerIds);

  console.log('\n👥 PROFILES LINKED TO INTERVIEWS:');
  linkedProfiles?.forEach(p => {
    const interviewCount = allInterviews?.filter(i => i.storyteller_id === p.id).length || 0;
    console.log('  -', (p.preferred_name || p.full_name).padEnd(30), '(' + interviewCount + ' interviews)');
  });
}

check()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
