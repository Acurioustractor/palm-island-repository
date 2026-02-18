/**
 * Bootstrap Smart Folders for all PICC services and innovation projects.
 *
 * Run: npx tsx scripts/bootstrap-service-folders.ts
 *
 * Creates smart folders in the `smart_folders` table with query_rules
 * that auto-filter media by service/project tags.
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const CATEGORY_ICONS: Record<string, string> = {
  'Health & Wellbeing': 'Heart',
  'Family & Children': 'Users',
  'Justice & Safety': 'AlertCircle',
  'Culture & Community': 'Star',
  'Education & Training': 'FileText',
  'Economic Development': 'Folder',
  'Corporate': 'Folder',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Health & Wellbeing': 'green',
  'Family & Children': 'blue',
  'Justice & Safety': 'red',
  'Culture & Community': 'amber',
  'Education & Training': 'purple',
  'Economic Development': 'green',
  'Corporate': 'gray',
}

const INNOVATION_PROJECTS = [
  { slug: 'elders-trip', name: 'Elders Trip', icon: 'Users', color: 'amber' },
  { slug: 'photo-studio', name: 'Photo Studio', icon: 'Star', color: 'blue' },
  { slug: 'local-server', name: 'Local Server', icon: 'Folder', color: 'green' },
  { slug: 'storm-recovery', name: 'Storm Recovery', icon: 'AlertCircle', color: 'red' },
]

async function main() {
  console.log('Bootstrapping smart folders...\n')

  // 1. Load active services
  const { data: services, error: svcError } = await supabase
    .from('organization_services')
    .select('id, name, slug, service_category')
    .eq('is_active', true)
    .order('name')

  if (svcError) {
    console.error('Error loading services:', svcError.message)
    process.exit(1)
  }

  console.log(`Found ${services?.length || 0} active services`)

  // 2. Check existing smart folders to avoid duplicates
  const { data: existing } = await supabase
    .from('smart_folders')
    .select('slug')

  const existingSlugs = new Set((existing || []).map((f: any) => f.slug))

  let created = 0
  let skipped = 0

  // 3. Create service folders
  for (const svc of (services || [])) {
    const folderSlug = `service-${svc.slug}`

    if (existingSlugs.has(folderSlug)) {
      console.log(`  SKIP: ${folderSlug} (already exists)`)
      skipped++
      continue
    }

    const category = svc.service_category || 'Corporate'
    const folder = {
      name: svc.name,
      slug: folderSlug,
      description: `Photos tagged with service:${svc.slug}`,
      icon: CATEGORY_ICONS[category] || 'Folder',
      color: CATEGORY_COLORS[category] || 'gray',
      is_system: true,
      query_rules: {
        filters: [{
          field: 'tags',
          operator: 'contains',
          value: `service:${svc.slug}`,
        }],
      },
    }

    const { error } = await supabase.from('smart_folders').insert(folder)

    if (error) {
      console.error(`  ERROR: ${folderSlug}: ${error.message}`)
    } else {
      console.log(`  CREATED: ${folderSlug}`)
      created++
    }
  }

  // 4. Create innovation project folders
  for (const proj of INNOVATION_PROJECTS) {
    const folderSlug = `project-${proj.slug}`

    if (existingSlugs.has(folderSlug)) {
      console.log(`  SKIP: ${folderSlug} (already exists)`)
      skipped++
      continue
    }

    const folder = {
      name: `Innovation: ${proj.name}`,
      slug: folderSlug,
      description: `Photos tagged with project:${proj.slug}`,
      icon: proj.icon,
      color: proj.color,
      is_system: true,
      query_rules: {
        filters: [{
          field: 'tags',
          operator: 'contains',
          value: `project:${proj.slug}`,
        }],
      },
    }

    const { error } = await supabase.from('smart_folders').insert(folder)

    if (error) {
      console.error(`  ERROR: ${folderSlug}: ${error.message}`)
    } else {
      console.log(`  CREATED: ${folderSlug}`)
      created++
    }
  }

  // 5. Create a "Cover Photos" folder
  const coverSlug = 'cover-photos'
  if (!existingSlugs.has(coverSlug)) {
    const { error } = await supabase.from('smart_folders').insert({
      name: 'Cover Photos',
      slug: coverSlug,
      description: 'All hero/cover images across services',
      icon: 'Star',
      color: 'amber',
      is_system: true,
      query_rules: {
        filters: [{
          field: 'tags',
          operator: 'contains',
          value: 'hero',
        }],
      },
    })

    if (error) {
      console.error(`  ERROR: ${coverSlug}: ${error.message}`)
    } else {
      console.log(`  CREATED: ${coverSlug}`)
      created++
    }
  } else {
    skipped++
  }

  console.log(`\nDone! Created: ${created}, Skipped: ${skipped}`)
}

main().catch(console.error)
