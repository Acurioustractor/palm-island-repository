import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import InnovationAdminDetail from '@/components/innovation-admin/InnovationAdminDetail'

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

export default async function InnovationDetailPage({ params }: { params: { slug: string } }) {
  const supabase = getServerClient()
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !project) notFound()

  return <InnovationAdminDetail project={project} />
}
