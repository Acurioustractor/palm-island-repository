import WikiNavigation from '@/components/wiki/WikiNavigation';

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WikiNavigation />
      <div className="lg:ml-72 min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20">
        {children}
      </div>
    </>
  );
}
