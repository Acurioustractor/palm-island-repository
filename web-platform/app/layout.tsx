import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PublicNavigation } from '@/components/navigation/PublicNavigation';
import { PublicFooter } from '@/components/navigation/PublicFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Palm Island Community Repository',
  description: 'Manbarra & Bwgcolman Country - Community-controlled storytelling and impact measurement',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PublicNavigation />
        <main className="min-h-screen">
          {children}
        </main>
        <PublicFooter />
      </body>
    </html>
  );
}
