import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Agentation } from 'agentation';
import { AdminProvider } from '@/lib/admin/AdminContext';
import AdminFloatingToolbar from '@/components/admin/AdminFloatingToolbar';
import './globals.css';
import 'leaflet/dist/leaflet.css';

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
        <AdminProvider>
          {children}
          <AdminFloatingToolbar />
        </AdminProvider>
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  );
}
