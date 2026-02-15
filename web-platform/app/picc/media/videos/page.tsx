import { redirect } from 'next/navigation';

export default function MediaVideosPage() {
  redirect('/picc/media/gallery?fileType=video');
}
