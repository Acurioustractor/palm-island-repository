'use client';

import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Printer, Check, QrCode } from 'lucide-react';

interface ShareProfileProps {
  profileId: string;
  storytellerName: string;
}

export default function ShareProfile({ profileId, storytellerName }: ShareProfileProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/storytellers/${profileId}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
    setShowMenu(false);
  };

  const handleGenerateQR = () => {
    // For now, we'll link to a QR code generator
    // In production, you could integrate a library like qrcode.react
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`;
    window.open(qrUrl, '_blank');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-ocean-medium text-white rounded-lg hover:bg-ocean-deep transition-all"
      >
        <Share2 className="w-4 h-4" />
        <span>Share Profile</span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-earth-light z-20">
            <div className="p-2">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-earth-bg rounded-lg transition-all"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-success" />
                ) : (
                  <LinkIcon className="w-5 h-5 text-ocean-medium" />
                )}
                <div>
                  <div className="font-medium text-ocean-deep">
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </div>
                  <div className="text-xs text-earth-medium">
                    Share this profile URL
                  </div>
                </div>
              </button>

              {/* Generate QR Code */}
              <button
                onClick={handleGenerateQR}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-earth-bg rounded-lg transition-all"
              >
                <QrCode className="w-5 h-5 text-ocean-medium" />
                <div>
                  <div className="font-medium text-ocean-deep">QR Code</div>
                  <div className="text-xs text-earth-medium">
                    Generate scannable code
                  </div>
                </div>
              </button>

              {/* Print Profile */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-earth-bg rounded-lg transition-all"
              >
                <Printer className="w-5 h-5 text-ocean-medium" />
                <div>
                  <div className="font-medium text-ocean-deep">Print</div>
                  <div className="text-xs text-earth-medium">
                    Print-friendly view
                  </div>
                </div>
              </button>
            </div>

            {/* URL Display */}
            <div className="border-t border-earth-light p-3">
              <div className="text-xs text-earth-medium mb-1">Profile URL:</div>
              <div className="text-xs text-ocean-deep bg-earth-bg px-2 py-1 rounded break-all">
                {profileUrl}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
