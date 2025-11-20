import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Navigation, MobileNavigation } from '@/components/navigation'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        {/* Cultural Acknowledgment Banner */}
        <div className="bg-gradient-to-r from-orange-800 via-red-800 to-yellow-800 px-4 py-2 text-center text-sm text-white">
          <p>
            We acknowledge the <strong>Manbarra people</strong> as the traditional owners of Palm Island
            and recognize the <strong>Bwgcolman people</strong> descended from those forcibly relocated to the island.
            We respect elders past, present, and emerging.
          </p>
        </div>

        {/* Layout with Sidebar */}
        <div className="flex min-h-[calc(100vh-48px)]">
          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:flex w-64 flex-shrink-0 h-[calc(100vh-48px)] sticky top-0">
            <Navigation />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Mobile Navigation - Shown on mobile only */}
            <div className="lg:hidden">
              <MobileNavigation />
            </div>

            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>

            {/* Footer with Data Sovereignty Notice */}
            <footer className="border-t bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
              <div className="mx-auto max-w-4xl space-y-4">
                <p className="font-medium text-gray-900">
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
        </div>
      </body>
    </html>
  )
}