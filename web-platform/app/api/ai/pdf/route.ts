/**
 * PDF Processing API
 *
 * Process and analyze PDF documents (annual reports, policies, etc.)
 */

import { NextResponse } from 'next/server';
import {
  extractPDFText,
  analyzeAnnualReport,
  extractReportInfo
} from '@/lib/ai/pdf-processing';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let pdfBuffer: Buffer;
    let year: string | undefined;
    let action = 'analyze';

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      year = formData.get('year') as string | undefined;
      action = (formData.get('action') as string) || 'analyze';

      if (!file) {
        return NextResponse.json({
          error: 'No file uploaded'
        }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({
          error: 'File must be a PDF'
        }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else {
      // Handle JSON with base64 PDF
      const body = await request.json();

      if (!body.pdf) {
        return NextResponse.json({
          error: 'No PDF data provided. Send as multipart/form-data or JSON with base64 pdf field'
        }, { status: 400 });
      }

      pdfBuffer = Buffer.from(body.pdf, 'base64');
      year = body.year;
      action = body.action || 'analyze';
    }

    // Extract text from PDF
    const document = await extractPDFText(pdfBuffer);

    let result;

    switch (action) {
      case 'extract':
        // Just extract text
        result = {
          title: document.title,
          pageCount: document.pageCount,
          text: document.pages.map(p => p.text).join('\n\n'),
          metadata: document.metadata
        };
        break;

      case 'analyze':
        // Full analysis for annual reports
        result = await analyzeAnnualReport(document, year);
        break;

      case 'financial':
      case 'programs':
      case 'staff':
      case 'achievements':
      case 'statistics':
        // Extract specific information
        const fullText = document.pages.map(p => p.text).join('\n\n');
        result = await extractReportInfo(fullText, action as 'financial' | 'programs' | 'staff' | 'achievements' | 'statistics');
        break;

      default:
        return NextResponse.json({
          error: `Unknown action: ${action}. Use: extract, analyze, financial, programs, staff, achievements, statistics`
        }, { status: 400 });
    }

    return NextResponse.json({
      action,
      result,
      documentInfo: {
        title: document.title,
        pageCount: document.pageCount,
        year
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('PDF Processing error:', error);
    return NextResponse.json({
      error: error.message || 'PDF processing failed'
    }, { status: 500 });
  }
}

// GET endpoint for API info
export async function GET() {
  return NextResponse.json({
    name: 'PDF Processing API',
    version: '1.0.0',
    description: 'Process and analyze PDF documents for the knowledge base',
    actions: {
      extract: 'Extract raw text from PDF',
      analyze: 'Full analysis for annual reports (default)',
      financial: 'Extract financial information',
      programs: 'Extract program information',
      staff: 'Extract staff and leadership info',
      achievements: 'Extract achievements and milestones',
      statistics: 'Extract statistics and metrics'
    },
    usage: {
      multipart: {
        method: 'POST',
        contentType: 'multipart/form-data',
        fields: {
          file: 'PDF file',
          year: 'Report year (optional)',
          action: 'Processing action (optional, default: analyze)'
        }
      },
      json: {
        method: 'POST',
        contentType: 'application/json',
        body: {
          pdf: 'Base64 encoded PDF',
          year: 'Report year (optional)',
          action: 'Processing action (optional)'
        }
      }
    },
    example: {
      curl: 'curl -X POST -F "file=@annual-report-2023.pdf" -F "year=2023" http://localhost:3000/api/ai/pdf'
    }
  });
}
