/**
 * Align Services to 2023-24 Annual Report
 *
 * Steps:
 * 1. Rename 3 mismatched services
 * 2. Create Women's Healing Service
 * 3. Rename Early Childhood Services → Early Childhood Services (CFC)
 * 4. Merge Child Care Services + Early Learning Centre → Early Childhood Services (CFC)
 * 5. Archive 18 non-report services
 * 6. Tag 16 official services with annual_report_2023_24
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

const API = 'http://localhost:3008'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function api(method: string, path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok || json.error) {
    throw new Error(`${method} ${path} failed: ${json.error || res.statusText}`)
  }
  return json
}

// ─── Step 1: Rename mismatched services ─────────────────────────────────────

async function renameServices() {
  console.log('\n=== Step 1: Rename mismatched services ===')

  const renames = [
    {
      id: 'e9447f4b-6241-4cb6-89c5-ee91bf71c3c1',
      name: 'Community Justice Group',
      slug: 'community-justice-group',
    },
    {
      id: 'ea8c1d4b-b643-41bf-9c42-8e882423ade4',
      name: "Women's Service",
      slug: 'womens-service',
    },
    {
      id: '0f763e1d-bd5b-47a1-90bc-62e56ed802ac',
      name: 'Youth Service',
      slug: 'youth-service',
    },
  ]

  for (const r of renames) {
    const result = await api('PATCH', `/api/services/${r.id}`, { name: r.name, slug: r.slug })
    console.log(`  ✓ Renamed → ${result.service.name} (${result.service.slug})`)
  }
}

// ─── Step 2: Create Women's Healing Service ─────────────────────────────────

async function createWomensHealingService() {
  console.log('\n=== Step 2: Create Women\'s Healing Service ===')

  // Check if it already exists
  const { services } = await api('GET', '/api/services')
  const existing = services.find((s: any) => s.slug === 'womens-healing-service')
  if (existing) {
    console.log(`  ⏭ Already exists: ${existing.name} (${existing.id})`)
    return existing.id
  }

  const result = await api('POST', '/api/services', {
    name: "Women's Healing Service",
    slug: 'womens-healing-service',
    service_category: 'health',
  })
  console.log(`  ✓ Created: ${result.service.name} (${result.service.id})`)
  return result.service.id
}

// ─── Step 3: Rename Early Childhood Services ────────────────────────────────

async function renameEarlyChildhood() {
  console.log('\n=== Step 3: Rename Early Childhood Services → Early Childhood Services (CFC) ===')

  const targetId = 'c0000000-0000-0000-0000-000000000005'
  const result = await api('PATCH', `/api/services/${targetId}`, {
    name: 'Early Childhood Services (CFC)',
  })
  console.log(`  ✓ Renamed → ${result.service.name}`)
}

// ─── Step 4: Merge duplicates into Early Childhood Services (CFC) ───────────

async function mergeIntoEarlyChildhood() {
  console.log('\n=== Step 4: Merge Child Care + Early Learning → Early Childhood Services (CFC) ===')

  const targetId = 'c0000000-0000-0000-0000-000000000005'
  const targetSlug = 'early-childhood-services'

  const sources = [
    { id: '1260c7bd-dfba-4233-b4fe-2849525d5524', slug: 'child-care', name: 'Child Care Services' },
    { id: 'bf963391-48d1-44ca-908f-cba12ac72748', slug: 'early_learning', name: 'Early Learning Centre' },
  ]

  for (const src of sources) {
    console.log(`\n  Merging ${src.name} (${src.id}) → target...`)

    // 4a. Migrate service_metrics
    const { data: metrics, error: metricsErr } = await supabase
      .from('service_metrics')
      .select('id, fiscal_year')
      .eq('organization_service_id', src.id)

    if (metricsErr) {
      console.log(`    ⚠ service_metrics query error: ${metricsErr.message}`)
    } else if (metrics && metrics.length > 0) {
      // Check for conflicts
      const { data: existingMetrics } = await supabase
        .from('service_metrics')
        .select('fiscal_year')
        .eq('organization_service_id', targetId)

      const existingYears = new Set((existingMetrics || []).map((m: any) => m.fiscal_year))

      for (const m of metrics) {
        if (existingYears.has(m.fiscal_year)) {
          console.log(`    ⏭ service_metrics fiscal_year=${m.fiscal_year} already exists on target, skipping`)
        } else {
          const { error } = await supabase
            .from('service_metrics')
            .update({ organization_service_id: targetId })
            .eq('id', m.id)
          if (error) console.log(`    ⚠ service_metrics update error: ${error.message}`)
          else console.log(`    ✓ service_metrics fiscal_year=${m.fiscal_year} moved`)
        }
      }
    } else {
      console.log(`    - No service_metrics to migrate`)
    }

    // 4b. Migrate partner_service_links
    const { data: links, error: linksErr } = await supabase
      .from('partner_service_links')
      .select('id')
      .eq('service_id', src.id)

    if (linksErr) {
      console.log(`    ⚠ partner_service_links query error: ${linksErr.message}`)
    } else if (links && links.length > 0) {
      const { error } = await supabase
        .from('partner_service_links')
        .update({ service_id: targetId })
        .eq('service_id', src.id)
      if (error) console.log(`    ⚠ partner_service_links update error: ${error.message}`)
      else console.log(`    ✓ partner_service_links: ${links.length} rows moved`)
    } else {
      console.log(`    - No partner_service_links to migrate`)
    }

    // 4c. Migrate service_grants
    const { data: grants, error: grantsErr } = await supabase
      .from('service_grants')
      .select('id')
      .eq('service_id', src.id)

    if (grantsErr) {
      console.log(`    ⚠ service_grants query error: ${grantsErr.message}`)
    } else if (grants && grants.length > 0) {
      const { error } = await supabase
        .from('service_grants')
        .update({ service_id: targetId })
        .eq('service_id', src.id)
      if (error) console.log(`    ⚠ service_grants update error: ${error.message}`)
      else console.log(`    ✓ service_grants: ${grants.length} rows moved`)
    } else {
      console.log(`    - No service_grants to migrate`)
    }

    // 4d. Migrate service_notes
    const { data: notes, error: notesErr } = await supabase
      .from('service_notes')
      .select('id')
      .eq('service_id', src.id)

    if (notesErr) {
      console.log(`    ⚠ service_notes query error: ${notesErr.message}`)
    } else if (notes && notes.length > 0) {
      const { error } = await supabase
        .from('service_notes')
        .update({ service_id: targetId })
        .eq('service_id', src.id)
      if (error) console.log(`    ⚠ service_notes update error: ${error.message}`)
      else console.log(`    ✓ service_notes: ${notes.length} rows moved`)
    } else {
      console.log(`    - No service_notes to migrate`)
    }

    // 4e. Migrate service_relationships
    const { data: relsSrc } = await supabase
      .from('service_relationships')
      .select('id')
      .eq('source_service_id', src.id)

    if (relsSrc && relsSrc.length > 0) {
      const { error } = await supabase
        .from('service_relationships')
        .update({ source_service_id: targetId })
        .eq('source_service_id', src.id)
      if (error) console.log(`    ⚠ service_relationships (source) update error: ${error.message}`)
      else console.log(`    ✓ service_relationships (source): ${relsSrc.length} rows moved`)
    }

    const { data: relsTgt } = await supabase
      .from('service_relationships')
      .select('id')
      .eq('target_service_id', src.id)

    if (relsTgt && relsTgt.length > 0) {
      const { error } = await supabase
        .from('service_relationships')
        .update({ target_service_id: targetId })
        .eq('target_service_id', src.id)
      if (error) console.log(`    ⚠ service_relationships (target) update error: ${error.message}`)
      else console.log(`    ✓ service_relationships (target): ${relsTgt.length} rows moved`)
    }

    // 4f. Media tag transfer
    console.log(`    Transferring media tags: service:${src.slug} → service:${targetSlug}`)
    const { data: taggedMedia } = await supabase
      .from('media_files')
      .select('id')
      .contains('tags', [`service:${src.slug}`])

    if (taggedMedia && taggedMedia.length > 0) {
      const mediaIds = taggedMedia.map((m: any) => m.id)
      const res = await fetch(`${API}/api/media/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaIds,
          addTags: [`service:${targetSlug}`],
        }),
      })
      const bulkResult = await res.json()
      if (bulkResult.ok) {
        console.log(`    ✓ Added service:${targetSlug} tag to ${bulkResult.updated} media files`)
      } else {
        console.log(`    ⚠ Media bulk tag error: ${bulkResult.error}`)
      }
    } else {
      console.log(`    - No media with service:${src.slug} tag`)
    }
  }
}

// ─── Step 5: Archive non-report services ────────────────────────────────────

async function archiveNonReportServices() {
  console.log('\n=== Step 5: Archive non-report services ===')

  const archiveIds = [
    '1260c7bd-dfba-4233-b4fe-2849525d5524', // Child Care Services (merged)
    'bf963391-48d1-44ca-908f-cba12ac72748', // Early Learning Centre (merged)
    '58fd6ba5-23ad-4e4b-a0b4-24c18a14920f', // Community Development
    '0a267c05-ef54-4ee0-b835-721f3473cd5f', // Cultural Centre
    '41d1f57c-2193-4c05-8374-b8304ecfce85', // Cultural Programs
    'c0424b6e-e703-453a-9f0a-b510644b96e4', // Economic Development
    '45a7c2fe-f6bd-4897-8aff-01ff07e9317d', // Education Support
    '0e4afdfb-0a29-43bd-bde6-09b4989c640a', // Elder Support Services
    'ffcea0e6-3673-442c-bbb8-8bf7642ad6df', // Employment Services
    '3b34ec79-42b2-4f9f-96c8-e36599091206', // Family Support
    'ac8db546-0ace-4de5-9c46-14601d25ca1b', // Food Security
    '333301ec-314f-4e06-871b-1658876f51d3', // Housing Services
    '13fdc076-2e40-4a21-9785-e4694f8feca1', // Language & Culture
    '28f40a54-0055-4fd6-9ae2-f5c4d41e6627', // Men's Programs
    '4de6e20c-bc16-49fb-add7-a1ffc76c8fe6', // Mental Health Services
    'b51bbe15-3834-405c-847f-83333f88f24b', // Ranger Program
    '990c2488-fc5f-4ab7-bfd5-faee1bf6f05e', // Sport & Recreation
    '0acccdac-e137-497b-b881-63cce6a33224', // Transport Services
  ]

  for (const id of archiveIds) {
    try {
      const result = await api('PATCH', `/api/services/${id}`, { is_active: false })
      console.log(`  ✓ Archived: ${result.service.name}`)
    } catch (err: any) {
      console.log(`  ⚠ Failed to archive ${id}: ${err.message}`)
    }
  }
}

// ─── Step 6: Tag official services ──────────────────────────────────────────

async function tagOfficialServices() {
  console.log('\n=== Step 6: Tag 16 official annual report services ===')

  // Fetch current services to get IDs of all active ones
  const { services } = await api('GET', '/api/services')
  const active = services.filter((s: any) => s.is_active)

  console.log(`  Found ${active.length} active services`)

  for (const svc of active) {
    const currentMeta = svc.metadata || {}
    const result = await api('PATCH', `/api/services/${svc.id}`, {
      metadata: { ...currentMeta, annual_report_2023_24: true },
    })
    console.log(`  ✓ Tagged: ${result.service.name}`)
  }
}

// ─── Verification ───────────────────────────────────────────────────────────

async function verify() {
  console.log('\n=== Verification ===')

  const { services } = await api('GET', '/api/services')
  const active = services.filter((s: any) => s.is_active)
  const archived = services.filter((s: any) => !s.is_active)

  console.log(`\n  Total services: ${services.length}`)
  console.log(`  Active: ${active.length}`)
  console.log(`  Archived: ${archived.length}`)

  console.log('\n  Active services:')
  for (const s of active) {
    const tag = s.metadata?.annual_report_2023_24 ? '📋' : '  '
    console.log(`    ${tag} ${s.name} (${s.slug})`)
  }

  console.log('\n  Archived services:')
  for (const s of archived) {
    console.log(`    🗄 ${s.name} (${s.slug})`)
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔧 Aligning services to 2023-24 Annual Report...\n')

  await renameServices()
  await createWomensHealingService()
  await renameEarlyChildhood()
  await mergeIntoEarlyChildhood()
  await archiveNonReportServices()
  await tagOfficialServices()
  await verify()

  console.log('\n✅ Done!')
}

main().catch((err) => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
