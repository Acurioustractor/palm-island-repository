import { PublicNavigation } from '@/components/navigation/PublicNavigation';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import ChatWidget from '@/components/chat/ChatWidget';

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicNavigation />
      <main className="min-h-screen">
        {children}
      </main>
      <PublicFooter />
      <ChatWidget />
    </>
  );
}
