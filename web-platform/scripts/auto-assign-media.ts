#!/usr/bin/env tsx
/**
 * Auto-Assign Media to Pages
 *
 * Makes intelligent guesses to assign photos to all page sections
 * based on existing tags, titles, and metadata.
 *
 * Strategy:
 * - Analyzes tags to match photos to sections
 * - Assigns multiple photos per section for variety
 * - Sets display_order so best matches appear first
 * - User can then swap/refine assignments
 */

import { supabase, queries } from './lib/supabase';

interface AssignmentRule {
  pageContext: string;
  pageSection: string;
  tags?: string[];
  titleKeywords?: string[];
  limit: number;
  isFeatured?: boolean;
}

const assignmentRules: AssignmentRule[] = [
  // HOME PAGE - Assign lots so there's variety to choose from
  {
    pageContext: 'home',
    pageSection: 'hero',
    tags: ['aerial', 'landscape', 'palm-island', 'sunset', 'ocean', 'beach'],
    titleKeywords: ['aerial', 'island', 'view', 'panoramic'],
    limit: 100, // Give lots of hero options
    isFeatured: true,
  },
  {
    pageContext: 'home',
    pageSection: 'features',
    tags: ['community', 'gathering', 'celebration', 'event'],
    titleKeywords: ['community', 'people', 'gathering'],
    limit: 200, // Plenty of feature card options
  },
  {
    pageContext: 'home',
    pageSection: 'stats',
    tags: ['portrait', 'people', 'staff', 'leadership', 'community'],
    titleKeywords: ['portrait', 'people', 'staff', 'team'],
    limit: 50, // Circular portraits for stats humanization
  },
  {
    pageContext: 'home',
    pageSection: 'gallery',
    tags: ['community', 'action', 'program', 'event', 'gathering', 'activity'],
    titleKeywords: ['program', 'event', 'activity', 'gathering'],
    limit: 100, // Community in action grid
  },
  {
    pageContext: 'home',
    pageSection: 'testimonials',
    tags: ['portrait', 'elder', 'community', 'people'],
    titleKeywords: ['portrait', 'elder', 'community member'],
    limit: 50, // Testimonial portraits
  },
  {
    pageContext: 'home',
    pageSection: 'quotes',
    tags: ['community', 'gathering', 'landscape', 'palm-island', 'people'],
    titleKeywords: ['community', 'gathering', 'people'],
    limit: 20, // Background photos for quote sections
  },
  {
    pageContext: 'home',
    pageSection: 'cta',
    tags: ['community', 'engagement', 'gathering', 'storytelling', 'people'],
    titleKeywords: ['community', 'gathering', 'storytelling'],
    limit: 20, // Background photos for CTA sections
  },

  // ABOUT PAGE - Most comprehensive, needs lots of photos
  {
    pageContext: 'about',
    pageSection: 'hero',
    tags: ['palm-island', 'aerial', 'landscape', 'community'],
    titleKeywords: ['palm island', 'aerial', 'view'],
    limit: 100,
    isFeatured: true,
  },
  {
    pageContext: 'about',
    pageSection: 'vision',
    tags: ['building', 'picc', 'office', 'facility'],
    titleKeywords: ['picc', 'office', 'building', 'centre'],
    limit: 50,
  },
  {
    pageContext: 'about',
    pageSection: 'timeline',
    tags: ['historical', 'history', 'vintage', 'old', 'heritage'],
    titleKeywords: ['historical', 'history', '1960', '1970', '1980'],
    limit: 200, // Timeline needs lots of historical photos
  },
  {
    pageContext: 'about',
    pageSection: 'leadership',
    tags: ['leadership', 'rachel-atkinson', 'board', 'ceo', 'director', 'manager'],
    titleKeywords: ['rachel', 'ceo', 'director', 'board', 'leadership'],
    limit: 100,
  },
  {
    pageContext: 'about',
    pageSection: 'services',
    tags: ['health', 'clinic', 'healing', 'daycare', 'safe-haven', 'youth', 'education'],
    titleKeywords: ['clinic', 'health', 'daycare', 'healing', 'centre', 'program'],
    limit: 300, // Services is a big section
  },
  {
    pageContext: 'about',
    pageSection: 'testimonials',
    tags: ['elder', 'storyteller', 'community', 'portrait'],
    titleKeywords: ['elder', 'storyteller', 'community member'],
    limit: 150,
  },

  // IMPACT PAGE
  {
    pageContext: 'impact',
    pageSection: 'hero',
    tags: ['achievement', 'success', 'impact', 'award', 'celebration'],
    titleKeywords: ['achievement', 'success', 'award', 'impact'],
    limit: 100,
    isFeatured: true,
  },
  {
    pageContext: 'impact',
    pageSection: 'innovation',
    tags: ['innovation', 'digital', 'technology', 'photo-studio', 'digital-centre'],
    titleKeywords: ['innovation', 'digital', 'technology', 'studio', 'app'],
    limit: 200,
  },

  // COMMUNITY PAGE
  {
    pageContext: 'community',
    pageSection: 'hero',
    tags: ['community', 'gathering', 'celebration', 'event', 'people'],
    titleKeywords: ['community', 'gathering', 'celebration', 'event'],
    limit: 100,
    isFeatured: true,
  },
  {
    pageContext: 'community',
    pageSection: 'programs',
    tags: ['youth', 'education', 'program', 'training', 'workshop'],
    titleKeywords: ['program', 'youth', 'education', 'training'],
    limit: 200,
  },

  // STORIES PAGE
  {
    pageContext: 'stories',
    pageSection: 'hero',
    tags: ['storytelling', 'elder', 'community', 'culture'],
    titleKeywords: ['story', 'storytelling', 'elder'],
    limit: 50,
    isFeatured: true,
  },

  // SHARE VOICE PAGE
  {
    pageContext: 'share-voice',
    pageSection: 'hero',
    tags: ['community', 'voice', 'empowerment', 'people'],
    titleKeywords: ['voice', 'community', 'speak'],
    limit: 50,
    isFeatured: true,
  },
];

async function findMatchingMedia(rule: AssignmentRule) {
  console.log(`\n🔍 Finding matches for: ${rule.pageContext} > ${rule.pageSection}`);

  // Build query - try tags first
  let query = supabase
    .from('media_files')
    .select('id, filename, title, tags, public_url')
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .is('page_context', null); // Only unassigned photos

  // Try to match by tags first (most reliable)
  if (rule.tags && rule.tags.length > 0) {
    query = query.overlaps('tags', rule.tags);
  }

  let { data: matches } = await query.limit(rule.limit * 2); // Get more to filter

  // If no tag matches, try title keywords
  if ((!matches || matches.length === 0) && rule.titleKeywords) {
    console.log('   No tag matches, trying title keywords...');

    for (const keyword of rule.titleKeywords) {
      const { data: titleMatches } = await supabase
        .from('media_files')
        .select('id, filename, title, tags, public_url')
        .eq('file_type', 'image')
        .is('deleted_at', null)
        .is('page_context', null)
        .ilike('title', `%${keyword}%`)
        .limit(rule.limit);

      if (titleMatches && titleMatches.length > 0) {
        matches = titleMatches;
        break;
      }
    }
  }

  // If still no matches, just get some random nice photos
  if (!matches || matches.length === 0) {
    console.log('   No keyword matches, selecting random photos...');

    const { data: randomMatches } = await supabase
      .from('media_files')
      .select('id, filename, title, tags, public_url')
      .eq('file_type', 'image')
      .is('deleted_at', null)
      .is('page_context', null)
      .limit(rule.limit);

    matches = randomMatches;
  }

  return matches?.slice(0, rule.limit) || [];
}

async function assignMedia(
  mediaId: string,
  pageContext: string,
  pageSection: string,
  displayOrder: number,
  isFeatured: boolean = false
) {
  const { error } = await supabase
    .from('media_files')
    .update({
      page_context: pageContext,
      page_section: pageSection,
      display_order: displayOrder,
      is_featured: isFeatured,
    })
    .eq('id', mediaId);

  return !error;
}

async function main() {
  console.log('\n🤖 AUTO-ASSIGNING MEDIA TO PAGES\n');
  console.log('='.repeat(60));
  console.log('\nStrategy:');
  console.log('• Analyze tags and titles');
  console.log('• Make intelligent guesses');
  console.log('• Assign multiple photos per section');
  console.log('• You can swap/refine after');
  console.log('');

  let totalAssigned = 0;
  const assignments: any[] = [];

  for (const rule of assignmentRules) {
    const matches = await findMatchingMedia(rule);

    if (matches.length === 0) {
      console.log(`   ⚠️  No matches found`);
      continue;
    }

    console.log(`   ✅ Found ${matches.length} matches`);

    for (let i = 0; i < matches.length; i++) {
      const media = matches[i];
      const success = await assignMedia(
        media.id,
        rule.pageContext,
        rule.pageSection,
        i, // display_order: 0, 1, 2, etc.
        rule.isFeatured && i === 0 // Only first one is featured
      );

      if (success) {
        totalAssigned++;
        assignments.push({
          page: `${rule.pageContext} > ${rule.pageSection}`,
          order: i,
          title: media.title || media.filename,
          tags: media.tags?.join(', ') || 'none',
          featured: rule.isFeatured && i === 0,
        });

        console.log(`      ${i + 1}. ${media.title || media.filename}`);
        if (media.tags && media.tags.length > 0) {
          console.log(`         Tags: ${media.tags.join(', ')}`);
        }
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ AUTO-ASSIGNMENT COMPLETE!\n`);
  console.log(`📸 Total photos assigned: ${totalAssigned}`);

  // Group by page
  const byPage = assignments.reduce((acc: any, item: any) => {
    if (!acc[item.page]) {
      acc[item.page] = [];
    }
    acc[item.page].push(item);
    return acc;
  }, {});

  console.log('\n📊 Assignments by page:\n');
  Object.entries(byPage).forEach(([page, items]: [string, any]) => {
    console.log(`   ${page}: ${items.length} photos`);
  });

  console.log('\n🎯 NEXT STEPS:\n');
  console.log('1. Visit the public pages to see the photos:');
  console.log('   • http://localhost:3000/');
  console.log('   • http://localhost:3000/about');
  console.log('   • http://localhost:3000/impact');
  console.log('   • http://localhost:3000/community');
  console.log('');
  console.log('2. Swap/refine assignments:');
  console.log('   • Go to /picc/media/gallery');
  console.log('   • Filter by page_context');
  console.log('   • Edit any photo to change assignment');
  console.log('');
  console.log('3. Verify assignments:');
  console.log('   • Run: npx tsx scripts/verify-media-integration.ts');
  console.log('');

  console.log('='.repeat(60));
  console.log('');

  // Export detailed report
  console.log('📋 Detailed Assignment Report:\n');

  const report = Object.entries(byPage).map(([page, items]: [string, any]) => {
    return {
      page,
      photos: items.map((item: any) => ({
        order: item.order,
        title: item.title,
        featured: item.featured ? '⭐' : '',
      })),
    };
  });

  console.table(
    assignments.map(a => ({
      Page: a.page,
      Order: a.order,
      Title: a.title.substring(0, 40),
      Featured: a.featured ? '⭐' : '',
    }))
  );

  console.log('\n✅ Done! Check the pages to see your photos!\n');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
