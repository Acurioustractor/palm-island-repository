import { redirect } from 'next/navigation'

export default function PublicStoryEditRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/picc/stories/${params.id}/edit`)
}
