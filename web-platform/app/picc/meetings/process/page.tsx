import { Suspense } from 'react'
import ProcessMeetingClient from './ProcessClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Process Meeting · PICC Admin',
  description: 'Audio → transcript → themes + action items → save.',
}

export default function ProcessMeetingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <p className="text-sm text-stone-500">Loading…</p>
        </div>
      }
    >
      <ProcessMeetingClient />
    </Suspense>
  )
}
