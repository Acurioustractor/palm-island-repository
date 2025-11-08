import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WikiNavigation from '@/components/wiki/WikiNavigation';

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
        <WikiNavigation />
        <main className="lg:ml-72 min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          {children}
        </main>
      </body>
    </html>
  );
}
