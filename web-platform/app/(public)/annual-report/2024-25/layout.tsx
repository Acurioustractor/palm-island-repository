import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Annual Report 2024-25 | Palm Island Community Company',
  description:
    'Palm Island Community Company Annual Report 2024-25 — Our Community, Our Future, Our Way. Explore our impact, services, and community stories.',
  openGraph: {
    title: 'PICC Annual Report 2024-25',
    description:
      '197 staff, 17,488 episodes of care, 1,187 children supported. Explore the story of Palm Island Community Company.',
    type: 'website',
    locale: 'en_AU',
    siteName: 'Palm Island Community Company',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PICC Annual Report 2024-25',
    description:
      'Our Community, Our Future, Our Way — Explore the impact of Palm Island Community Company.',
  },
};

export default function AnnualReport2025Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={playfair.variable}>{children}</div>;
}
