import { createServerComponentClient } from '@/lib/supabase/server'
import TwentyYearsClient from './TwentyYearsClient'
import { assetUrl } from '@/lib/media/asset-url'

export default async function TwentyYearsPage() {
  const supabase = await createServerComponentClient()

  // Fetch hero image via tags (20-years is not a standard page_context value)
  const { data: heroImageData } = await (supabase as any)
    .from('media_files')
    .select('public_url')
    .contains('tags', ['page:20-years', 'hero'])
    .eq('file_type', 'image')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch hero video via same tags
  const { data: heroVideoData } = await (supabase as any)
    .from('media_files')
    .select('public_url')
    .contains('tags', ['page:20-years', 'hero'])
    .eq('file_type', 'video')
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <TwentyYearsClient
      heroImage={heroImageData?.public_url || null}
      heroVideo={heroVideoData?.public_url || assetUrl('/hero-assets/clips/palm-island-sunset.mp4')}
    />
  )
}
