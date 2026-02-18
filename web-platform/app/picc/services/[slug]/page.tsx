import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import ServiceAdminDetail from '@/components/service-admin/ServiceAdminDetail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase credentials')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const supabase = getServerClient()
  const { data: service, error } = await supabase
    .from('organization_services')
    .select('id, name, slug, service_category, description, is_active, metadata, created_at, updated_at')
    .eq('slug', params.slug)
    .single()

  if (error || !service) notFound()

  return <ServiceAdminDetail service={service} />
}
