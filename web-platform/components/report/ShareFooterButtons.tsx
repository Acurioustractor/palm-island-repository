'use client';

import ShareButtons from '@/components/ui/ShareButtons';

export default function ShareFooterButtons({ fiscalYear }: { fiscalYear: string }) {
  return (
    <ShareButtons
      title={`PICC Annual Report ${fiscalYear}`}
      description={`Palm Island Community Company Annual Report ${fiscalYear} - Real-time community impact dashboard`}
    />
  );
}
