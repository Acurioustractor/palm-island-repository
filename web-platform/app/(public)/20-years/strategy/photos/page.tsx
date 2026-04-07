import { createClient } from '@supabase/supabase-js'
import PhotoPickerClient from './client'

const EL_URL = 'https://yvnuayzslukamizrlhwb.supabase.co'

export const metadata = { title: 'Strategy Photo Picker | PICC' }
export const dynamic = 'force-dynamic'

const PICC_ORG_ID = '084f851c-72e0-41fb-b5ba-f3088f44862d'

export default async function PhotoPickerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '0', 10)
  const PAGE_SIZE = 100

  const elKey = process.env.EMPATHY_LEDGER_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!elKey) return <div className="p-8 text-red-500">Missing service key</div>

  const supabase = createClient(EL_URL, elKey)

  // Fetch ALL PICC photos (paginated through Supabase 1000-row limit)
  let allPhotos: any[] = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase
      .from('media_assets')
      .select('id, url, alt_text, display_name, original_filename, created_at')
      .eq('organization_id', PICC_ORG_ID)
      .not('url', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + 999)

    if (error || !data || data.length === 0) break
    allPhotos = allPhotos.concat(data)
    if (data.length < 1000) break
    offset += 1000
    if (offset > 5000) break // safety
  }

  const validPhotos = allPhotos.filter((p: any) => {
    if (!p.url) return false
    const url = p.url.toLowerCase()
    return url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.webp')
  })

  const totalPages = Math.ceil(validPhotos.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const pagePhotos = validPhotos.slice(start, start + PAGE_SIZE)

  return (
    <PhotoPickerClient
      photos={pagePhotos}
      totalCount={validPhotos.length}
      currentPage={page}
      totalPages={totalPages}
    />
  )
}
