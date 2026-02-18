import { redirect } from 'next/navigation';

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect('/chat');
}
