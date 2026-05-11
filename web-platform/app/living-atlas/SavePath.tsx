'use client'

/**
 * SavePath — Cooper-Hewitt-pattern "take this with you" button.
 *
 * On a kiosk / TV / office screen, a visitor taps "Save this path" and
 * gets a QR code encoding the current Atlas URL. They scan it with their
 * phone and continue the exploration there. No login, no account, no
 * tracking — just a URL handoff.
 *
 * Future (Stage 6): encode active lens + active node + breadcrumb in the
 * URL so the receiving phone lands on the exact same view, not just the
 * Atlas home.
 */

import { useEffect, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { QrCode, X } from 'lucide-react'

export default function SavePath() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') setUrl(window.location.href)
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') setUrl(window.location.href)
          setOpen(true)
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-charcoal hover:bg-stone-50"
        title="Generate a QR code for the current view"
      >
        <QrCode className="w-4 h-4" />
        Save this path
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-cream rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-ochre font-bold">
                  Take it with you
                </div>
                <h3 className="font-serif text-xl text-charcoal mt-1">
                  Save this path
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-stone-500 hover:text-charcoal text-2xl leading-none px-1"
              >
                ×
              </button>
            </div>

            <div className="flex justify-center py-4">
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <QRCodeCanvas
                  value={url || 'https://picc.studio/living-atlas'}
                  size={220}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#2D5F4F"
                />
              </div>
            </div>

            <p className="text-sm text-stone-700 text-center leading-relaxed">
              Scan with your phone camera. The Atlas opens where you left it.
            </p>

            <div className="text-[10.5px] text-stone-500 mt-3 text-center break-all">
              {url}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 rounded-md py-2 font-semibold text-white text-sm"
              style={{ backgroundColor: '#2D5F4F' }}
            >
              <X className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
