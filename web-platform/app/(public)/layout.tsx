import { PublicNavigation } from '@/components/navigation/PublicNavigation';
import { PublicFooter } from '@/components/navigation/PublicFooter';

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
    </>
  );
}
