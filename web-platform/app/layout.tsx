import type { Metadata } from 'next'
import './globals.css'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Palm Island Community Repository',
  description: 'Our Stories, Our Sovereignty, Our Future - A world-class AI-powered cultural knowledge platform for the Palm Island Community',
  keywords: ['Palm Island', 'Indigenous', 'Cultural Heritage', 'Community Stories', 'Bwgcolman', 'Manbarra'],
  authors: [{ name: 'Palm Island Community Company' }],
  creator: 'Palm Island Community Company',
  publisher: 'Palm Island Community Company',
  robots: 'index, follow',
  openGraph: {
    title: 'Palm Island Community Repository',
    description: 'Our Stories, Our Sovereignty, Our Future',
    url: 'https://stories.palmicc.com.au',
    siteName: 'Palm Island Community Repository',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palm Island Community Repository',
    description: 'Our Stories, Our Sovereignty, Our Future',
  },
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn('font-sans min-h-screen bg-earth-bg antialiased')}>
        <Sidebar />
        <div className="main-content">
          {/* Cultural Acknowledgment Banner */}
          <div className="bg-gradient-to-r from-sunset-orange via-coral-warm to-sand-gold px-4 py-2 text-center text-sm text-white">
            <p>
              We acknowledge the <strong>Manbarra people</strong> as the traditional owners of Palm Island
              and recognize the <strong>Bwgcolman people</strong> descended from those forcibly relocated to the island.
              We respect elders past, present, and emerging.
            </p>
          </div>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer with Data Sovereignty Notice */}
          <footer className="border-t bg-earth-bg px-4 py-8 text-center text-sm text-earth-medium">
            <div className="mx-auto max-w-4xl space-y-4">
              <p className="font-medium text-ocean-deep">
                © 2024 Palm Island Community Company
              </p>
              <p>
                This platform is built on principles of <strong>Indigenous data sovereignty</strong>.
                All content remains the intellectual property of the Palm Island community.
                Use requires explicit community permission following cultural protocols.
              </p>
              <p className="text-xs">
                🌊 Our Stories · 🔥 Our Sovereignty · 📚 Our Future
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}