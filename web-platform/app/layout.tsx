import type { Metadata } from 'next';
import { Inter, Fraunces, Caveat } from 'next/font/google';
import { AdminProvider } from '@/lib/admin/AdminContext';
import { ogMeta } from '@/lib/seo/og';
import './globals.css';
import 'leaflet/dist/leaflet.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
// Caveat retained as a tertiary "curator's hand" accent for MarginNote only.
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });

export const metadata: Metadata = ogMeta({
  title: 'Palm Island Community Company',
  description:
    'Manbarra & Bwgcolman Country — community-controlled storytelling, services, and impact across Palm Island.',
  path: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${caveat.variable}`}>
      <body className={inter.className}>
        <AdminProvider>
          {children}

        </AdminProvider>
      </body>
    </html>
  );
}
