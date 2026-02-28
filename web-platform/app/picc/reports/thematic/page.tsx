'use client';

import ThematicReportBuilder from '@/components/report/ThematicReportBuilder';
import { BespokeIcon } from '@/components/ui/BespokeIcon';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ThematicReportPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Back */}
      <Link
        href="/picc/reports/builder"
        className="inline-flex items-center gap-2 text-picc-ochre hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reports
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BespokeIcon name="story" size={36} />
          <h1 className="text-3xl font-bold text-picc-earth font-serif">
            Thematic Report Generator
          </h1>
        </div>
        <p className="text-picc-earth-300 max-w-2xl">
          Generate themed reports by pulling together stories, service data,
          community voices, and media around a specific topic. Export as JSON
          for the WeasyPrint pipeline or review directly in-browser.
        </p>
      </div>

      <ThematicReportBuilder />
    </div>
  );
}
