import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../.env.local') })

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

;(async () => {
  const { data } = await s.from('media_files')
    .select('id, filename, file_path, public_url, bucket_name')
    .eq('file_type', 'image').is('deleted_at', null).limit(5)

  for (const f of data || []) {
    console.log('filename:', f.filename)
    console.log('file_path:', f.file_path)
    console.log('bucket:', f.bucket_name)
    console.log('url:', f.public_url?.substring(0, 100))

    // Try download with file_path
    const { data: blob, error } = await s.storage.from(f.bucket_name || 'story-media').download(f.file_path)
    console.log('download via file_path:', blob ? `OK (${blob.size} bytes)` : `FAIL: ${JSON.stringify(error)}`)
    console.log('---')
  }
})()
