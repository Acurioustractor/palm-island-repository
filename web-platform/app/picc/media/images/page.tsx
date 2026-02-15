import { redirect } from 'next/navigation';

export default function MediaImagesPage() {
  redirect('/picc/media/gallery?fileType=image');
}
