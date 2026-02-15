// app/admin/data-collection/page.tsx
import TheCentreDataForm from '@/components/data-collection/TheCentreDataForm';

export const metadata = {
  title: 'Data Collection | PICC Admin',
  description: 'Collect quarterly metrics for The Centre projects'
};

export default function DataCollectionPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Data Collection</h1>
        <p className="text-gray-600">
          Enter quarterly metrics for The Centre innovation projects
        </p>
      </header>
      
      <TheCentreDataForm />
      
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-3">Data Collection Schedule</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>Q1: July - September (Due: October 15)</li>
          <li>Q2: October - December (Due: January 15)</li>
          <li>Q3: January - March (Due: April 15)</li>
          <li>Q4: April - June (Due: July 15)</li>
        </ul>
      </div>
    </main>
  );
}
