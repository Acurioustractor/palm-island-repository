import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/annual-reports/generate-pdf
 *
 * Triggers PDF generation for an annual report year.
 *
 * On Vercel, WeasyPrint can't run (needs system libs), so this endpoint:
 * 1. Assembles report data from Supabase
 * 2. Stores it as JSON in Supabase Storage
 * 3. Returns the JSON URL for local generation via `python generate_pdf.py`
 *
 * For local/self-hosted environments, it can optionally spawn the Python process.
 *
 * Body: { year: number }
 */
export async function POST(request: Request) {
  try {
    const { year } = await request.json();

    if (!year || typeof year !== 'number') {
      return NextResponse.json({ error: 'year is required (number)' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Fetch all report data
    const reportData = await assembleReportData(supabase, year);

    // Store assembled JSON in Supabase Storage for the Python pipeline to consume
    const jsonFileName = `report-${year}-assembled.json`;
    const jsonContent = JSON.stringify(reportData, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: 'application/json' });

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(jsonFileName, jsonBlob, {
        upsert: true,
        contentType: 'application/json',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to store report data' }, { status: 500 });
    }

    // Get signed URL for the JSON
    const { data: signedData } = await supabase.storage
      .from('reports')
      .createSignedUrl(jsonFileName, 3600);

    // Check if a PDF already exists
    const pdfFileName = `picc-annual-report-${year - 1}-${String(year).slice(-2)}.pdf`;
    const { data: pdfSignedData } = await supabase.storage
      .from('reports')
      .createSignedUrl(pdfFileName, 3600);

    return NextResponse.json({
      success: true,
      year,
      data_url: signedData?.signedUrl || null,
      pdf_url: pdfSignedData?.signedUrl || null,
      pdf_exists: !!pdfSignedData?.signedUrl,
      instructions: [
        'Report data has been assembled and stored.',
        `To generate PDF locally, run:`,
        `  cd annual-reports && python scripts/generate_pdf.py --input <downloaded-json> --output output/picc-annual-report-${year - 1}-${String(year).slice(-2)}.pdf`,
        'Then upload the PDF to Supabase Storage "reports" bucket.',
      ],
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

/**
 * GET /api/annual-reports/generate-pdf?year=2025
 *
 * Returns the status of the latest PDF for a given year.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const year = parseInt(url.searchParams.get('year') || '', 10);

  if (!year) {
    return NextResponse.json({ error: 'year param required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const pdfFileName = `picc-annual-report-${year - 1}-${String(year).slice(-2)}.pdf`;

  // Check if PDF exists
  const { data: files } = await supabase.storage
    .from('reports')
    .list('', { search: pdfFileName });

  const file = files?.find((f) => f.name === pdfFileName);

  if (!file) {
    return NextResponse.json({ exists: false, year });
  }

  const { data: signedData } = await supabase.storage
    .from('reports')
    .createSignedUrl(pdfFileName, 3600);

  return NextResponse.json({
    exists: true,
    year,
    url: signedData?.signedUrl || null,
    file_size: file.metadata?.size || null,
    updated_at: file.updated_at || file.created_at || null,
  });
}

// Assemble report data from Supabase (TypeScript equivalent of assemble_content.py)
async function assembleReportData(supabase: any, year: number) {
  const fiscalYear = `${year - 1}-${String(year).slice(-2)}`;

  const [
    reportResult,
    statsResult,
    servicesResult,
    financialsResult,
    highlightsResult,
    leadershipResult,
    boardResult,
    storiesResult,
  ] = await Promise.all([
    supabase.from('annual_reports').select('*').eq('report_year', year).limit(1).single(),
    supabase.from('organization_stats').select('*').order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('organization_services').select('id, name, slug, description, service_category, service_metrics(*)').eq('is_active', true).order('name'),
    supabase.from('annual_financials').select('*').eq('fiscal_year', year).limit(1).single(),
    supabase.from('report_highlights').select('*').order('display_order'),
    supabase.from('leadership').select('*').eq('is_active', true).order('position_order'),
    supabase.from('board_members').select('*').order('display_order'),
    supabase.from('stories').select('*, storyteller:storyteller_id(id, full_name, preferred_name, is_elder, profile_image_url)').eq('status', 'published').eq('is_public', true).order('created_at', { ascending: false }).limit(20),
  ]);

  return {
    title: `Annual Report ${fiscalYear}`,
    year,
    year_range: `${year - 1} - ${year}`,
    generated_at: new Date().toISOString(),
    report: reportResult.data || null,
    stats: statsResult.data || null,
    services: (servicesResult.data || []).map((s: any) => s.name),
    services_detailed: servicesResult.data || [],
    financials: financialsResult.data || null,
    highlights: highlightsResult.data || [],
    leadership: leadershipResult.data || [],
    board_members: (boardResult.data || []).map((b: any) => ({ name: b.name, role: b.role })),
    stories: (storiesResult.data || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      summary: s.summary,
      category: s.category,
      storyteller_name: s.storyteller?.full_name || null,
      featured_image_url: s.featured_image_url || null,
    })),
  };
}
