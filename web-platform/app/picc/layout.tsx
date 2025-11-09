import PICCNavigation from '@/components/navigation/PICCNavigation';

export default function PICCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PICCNavigation />
      <div className="lg:ml-72 min-h-screen bg-gray-50">
        {children}
      </div>
    </>
  );
}
