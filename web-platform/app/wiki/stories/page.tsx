import { redirect } from 'next/navigation';

// Redirect /wiki/stories to /stories
export default function WikiStoriesPage() {
  redirect('/stories');
}
