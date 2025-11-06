'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

export default function DocumentUploadPage() {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Redirect to documents page after successful upload
    setTimeout(() => {
      router.push('/documents');
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Navigation */}
        <div className="bg-white shadow-md">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <Link
              href="/documents"
              className="flex items-center text-coral-warm hover:text-ocean-medium font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Documents
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-ocean-deep to-ocean-medium text-white py-12">
          <div className="max-w-5xl mx-auto px-8">
            <div className="flex items-center gap-4 mb-4">
              <Upload className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Upload Documents</h1>
            </div>
            <p className="text-xl text-white/90 max-w-3xl">
              Add new documents to the community repository. Support for PDFs, images, and more.
            </p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="max-w-5xl mx-auto px-8 py-12">
          <div className="card-modern p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-ocean-deep mb-2">
                Document Information
              </h2>
              <p className="text-earth-medium">
                Upload one or more documents and provide metadata for each one.
                All fields marked with * are required.
              </p>
            </div>

            <DocumentUpload onUploadComplete={handleUploadComplete} />

            {/* Guidelines */}
            <div className="mt-8 p-6 bg-earth-bg rounded-lg">
              <h3 className="font-bold text-ocean-deep mb-3">Upload Guidelines</h3>
              <ul className="space-y-2 text-sm text-earth-dark">
                <li className="flex items-start gap-2">
                  <span className="text-coral-warm">•</span>
                  <span>Supported formats: PDF, Images (PNG, JPG), Word documents, Text files</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-warm">•</span>
                  <span>Maximum file size: 50MB per file</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-warm">•</span>
                  <span>Provide clear, descriptive titles for better searchability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-warm">•</span>
                  <span>Add relevant tags to help others find related documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-warm">•</span>
                  <span>Set appropriate access levels based on document sensitivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-coral-warm">•</span>
                  <span>Use document date to indicate when the content was created or relates to</span>
                </li>
              </ul>
            </div>

            {/* Categories Reference */}
            <div className="mt-6 p-6 bg-earth-bg rounded-lg">
              <h3 className="font-bold text-ocean-deep mb-3">Document Categories</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-earth-dark">
                <div>
                  <span className="font-medium text-ocean-deep">Report:</span> Annual reports, research documents, surveys
                </div>
                <div>
                  <span className="font-medium text-ocean-deep">Photo:</span> Community photos, event images
                </div>
                <div>
                  <span className="font-medium text-ocean-deep">Historical:</span> Historical records, archival materials
                </div>
                <div>
                  <span className="font-medium text-ocean-deep">Meeting Minutes:</span> Meeting records, agendas
                </div>
                <div>
                  <span className="font-medium text-ocean-deep">News:</span> Newsletters, announcements, press releases
                </div>
                <div>
                  <span className="font-medium text-ocean-deep">Policy:</span> Policy documents, guidelines, procedures
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
