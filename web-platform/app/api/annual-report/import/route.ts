import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Component type to database table mapping
const COMPONENT_TO_CONTENT_TYPE: Record<string, string> = {
  'ReportHero': 'hero',
  'ImpactStat': 'stat',
  'ImpactStatsGrid': 'stats',
  'QuoteShowcase': 'quote',
  'LeadershipMessage': 'leadership',
  'Timeline': 'timeline',
  'StoryCard': 'story',
  'StoryGrid': 'stories',
  'PhotoGallery': 'gallery',
  'HeroGallery': 'hero-gallery',
  'FinancialDonut': 'financial',
  'DollarBreakdown': 'financial',
  'ServiceShowcase': 'services',
  'Section': 'section',
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the import data
    if (!data.version || !data.sections) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    // Extract fiscal year from metadata or use current
    const fiscalYear = data.metadata?.fiscalYear || getCurrentFiscalYear();

    // Process sections and convert to database format
    const processedSections = data.sections.map((section: any, index: number) => ({
      fiscal_year: fiscalYear,
      section_type: COMPONENT_TO_CONTENT_TYPE[section.componentType] || 'section',
      section_order: section.order ?? index,
      title: section.title || section.name,
      content: section,
      figma_node_id: section.id,
      imported_at: new Date().toISOString(),
      source: 'figma',
    }));

    // Process images
    const processedImages = data.images?.map((image: any) => ({
      fiscal_year: fiscalYear,
      image_hash: image.id,
      name: image.name,
      width: image.width,
      height: image.height,
      base64: image.base64,
      imported_at: new Date().toISOString(),
    })) || [];

    // Check if we have the annual_report_sections table
    const { error: tableCheckError } = await supabase
      .from('annual_report_sections')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      // Table doesn't exist, create it
      await createTables();
    }

    // Upsert sections (update if figma_node_id exists, insert otherwise)
    const { data: sectionsResult, error: sectionsError } = await supabase
      .from('annual_report_sections')
      .upsert(processedSections, {
        onConflict: 'figma_node_id',
        ignoreDuplicates: false,
      })
      .select();

    if (sectionsError) {
      console.error('Error upserting sections:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to save sections', details: sectionsError.message },
        { status: 500 }
      );
    }

    // Upsert images
    if (processedImages.length > 0) {
      const { error: imagesError } = await supabase
        .from('annual_report_images')
        .upsert(processedImages, {
          onConflict: 'image_hash',
          ignoreDuplicates: false,
        });

      if (imagesError) {
        console.error('Error upserting images:', imagesError);
        // Don't fail the whole import if images fail
      }
    }

    // Log the import
    await supabase.from('annual_report_imports').insert({
      fiscal_year: fiscalYear,
      figma_file_id: data.metadata?.figmaFileId,
      page_name: data.metadata?.pageName,
      sections_count: processedSections.length,
      images_count: processedImages.length,
      imported_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Imported ${processedSections.length} sections and ${processedImages.length} images`,
      fiscalYear,
      sections: sectionsResult?.length || 0,
      images: processedImages.length,
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Get current fiscal year (July to June)
function getCurrentFiscalYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  if (month >= 6) { // July onwards
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

// Create tables if they don't exist
async function createTables() {
  const createSectionsTable = `
    CREATE TABLE IF NOT EXISTS annual_report_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      fiscal_year TEXT NOT NULL,
      section_type TEXT NOT NULL,
      section_order INTEGER DEFAULT 0,
      title TEXT,
      content JSONB DEFAULT '{}',
      figma_node_id TEXT UNIQUE,
      imported_at TIMESTAMPTZ DEFAULT NOW(),
      source TEXT DEFAULT 'manual',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_sections_fiscal_year ON annual_report_sections(fiscal_year);
    CREATE INDEX IF NOT EXISTS idx_sections_type ON annual_report_sections(section_type);
  `;

  const createImagesTable = `
    CREATE TABLE IF NOT EXISTS annual_report_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      fiscal_year TEXT NOT NULL,
      image_hash TEXT UNIQUE,
      name TEXT,
      width INTEGER,
      height INTEGER,
      base64 TEXT,
      url TEXT,
      imported_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_images_fiscal_year ON annual_report_images(fiscal_year);
  `;

  const createImportsTable = `
    CREATE TABLE IF NOT EXISTS annual_report_imports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      fiscal_year TEXT NOT NULL,
      figma_file_id TEXT,
      page_name TEXT,
      sections_count INTEGER DEFAULT 0,
      images_count INTEGER DEFAULT 0,
      imported_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    // Note: This requires appropriate permissions
    // In production, these tables should be created via migrations
    await supabase.rpc('exec_sql', { sql: createSectionsTable });
    await supabase.rpc('exec_sql', { sql: createImagesTable });
    await supabase.rpc('exec_sql', { sql: createImportsTable });
  } catch (error) {
    console.error('Error creating tables:', error);
    // Tables might already exist or we don't have permission - continue anyway
  }
}

// GET endpoint to retrieve imported sections
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fiscalYear = searchParams.get('year') || getCurrentFiscalYear();

  try {
    const { data: sections, error } = await supabase
      .from('annual_report_sections')
      .select('*')
      .eq('fiscal_year', fiscalYear)
      .order('section_order', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sections', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      fiscalYear,
      sections: sections || [],
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data', details: String(error) },
      { status: 500 }
    );
  }
}
