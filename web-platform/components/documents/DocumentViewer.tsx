'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Printer, Maximize } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export default function DocumentViewer({ fileUrl, fileName, onClose }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handlePrint = () => {
    window.open(fileUrl, '_blank');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const isPDF = fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex flex-col">
      {/* Header */}
      <div className="bg-ocean-deep text-white p-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold truncate">{fileName}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Print"
          >
            <Printer className="w-5 h-5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize className="w-5 h-5" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto bg-earth-bg/50 flex items-center justify-center p-4">
        {isPDF ? (
          <div className="bg-white shadow-2xl">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coral-warm"></div>
                </div>
              }
              error={
                <div className="p-12 text-center">
                  <p className="text-error text-lg">Failed to load PDF</p>
                  <p className="text-earth-medium text-sm mt-2">
                    Try downloading the file instead
                  </p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-warm"></div>
                  </div>
                }
              />
            </Document>
          </div>
        ) : (
          // For non-PDF files (images, etc.)
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
            style={{ transform: `scale(${scale})` }}
          />
        )}
      </div>

      {/* Controls Footer */}
      <div className="bg-ocean-deep text-white p-4">
        <div className="flex items-center justify-center gap-6">
          {isPDF && (
            <>
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                  className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm font-medium px-4">
                  Page {pageNumber} of {numPages}
                </span>

                <button
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                  className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="w-px h-6 bg-white/20"></div>
            </>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm font-medium px-4 w-20 text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              disabled={scale >= 3.0}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
