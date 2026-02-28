import { WikiNavigation } from '@/components/wiki/WikiNavigation';

export const metadata = {
  title: 'Palm Island History Wiki',
  description: 'Comprehensive history of Palm Island — Manbarra & Bwgcolman Country',
};

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <WikiNavigation />
      <main className="lg:ml-72">
        {children}
      </main>
    </div>
  );
}
