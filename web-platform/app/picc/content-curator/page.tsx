import { Metadata } from 'next'
import { fetchAvailableContent } from '@/lib/content-curator/fetch-content'
import ContentCuratorClient from './ContentCuratorClient'

export const metadata: Metadata = {
  title: 'Content Curator | PICC',
}

export const dynamic = 'force-dynamic'

export default async function ContentCuratorPage() {
  const content = await fetchAvailableContent()

  return <ContentCuratorClient initialContent={content} />
}
