import { redirect } from 'next/navigation';

export default function MediaAudioPage() {
  redirect('/picc/media/gallery?fileType=audio');
}
