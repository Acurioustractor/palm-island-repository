/**
 * Annual Report API Route
 * GET /api/annual-report?year=2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateAnnualReport } from '@/lib/annual-report/generator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');

    // Default to current year if not specified
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    // Validate year
    if (isNaN(year) || year < 2020 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Invalid year parameter. Must be between 2020 and current year.' },
        { status: 400 }
      );
    }

    console.log(`📊 Generating annual report for ${year}...`);

    const reportData = await generateAnnualReport(year);

    console.log(`✅ Annual report generated successfully for ${year}`);
    console.log(`   - ${reportData.summary.totalStories} stories`);
    console.log(`   - ${reportData.summary.totalStorytellers} storytellers`);
    console.log(`   - ${reportData.summary.totalPeopleAffected} people affected`);

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    console.error('❌ Error generating annual report:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate annual report',
      },
      { status: 500 }
    );
  }
}
