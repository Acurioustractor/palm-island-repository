import { NextResponse } from 'next/server';

/**
 * POST /api/campaigns/trigger
 *
 * Triggers a GHL (GoHighLevel) workflow/campaign with report data.
 * GHL handles: templates, contact lists, delivery, tracking.
 * We send: report URL, key stats, featured story.
 *
 * Body: {
 *   campaign_type: 'government' | 'indigenous' | 'public',
 *   report_url: string,
 *   stats: { staff_count, services_count, people_served, budget },
 *   featured_story?: { title, excerpt, url },
 *   fiscal_year: string,
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { campaign_type, report_url, stats, featured_story, fiscal_year } = body;

    if (!campaign_type || !report_url) {
      return NextResponse.json(
        { error: 'campaign_type and report_url are required' },
        { status: 400 }
      );
    }

    const ghlApiKey = process.env.GHL_API_KEY;
    const ghlLocationId = process.env.GHL_LOCATION_ID;

    if (!ghlApiKey || !ghlLocationId) {
      return NextResponse.json(
        { error: 'GHL not configured. Set GHL_API_KEY and GHL_LOCATION_ID.' },
        { status: 500 }
      );
    }

    // Map campaign types to GHL workflow IDs
    const workflowMap: Record<string, string | undefined> = {
      government: process.env.GHL_WORKFLOW_GOVERNMENT,
      indigenous: process.env.GHL_WORKFLOW_INDIGENOUS,
      public: process.env.GHL_WORKFLOW_PUBLIC,
    };

    const workflowId = workflowMap[campaign_type];
    if (!workflowId) {
      return NextResponse.json(
        { error: `No GHL workflow configured for campaign type: ${campaign_type}. Set GHL_WORKFLOW_${campaign_type.toUpperCase()} env var.` },
        { status: 400 }
      );
    }

    // Build custom data payload for GHL
    const customData = {
      report_url,
      fiscal_year: fiscal_year || '',
      staff_count: stats?.staff_count?.toString() || '',
      services_count: stats?.services_count?.toString() || '',
      people_served: stats?.people_served?.toString() || '',
      annual_budget: stats?.budget?.toString() || '',
      featured_story_title: featured_story?.title || '',
      featured_story_excerpt: featured_story?.excerpt || '',
      featured_story_url: featured_story?.url || '',
      campaign_type,
    };

    // Trigger the GHL workflow
    const ghlResponse = await fetch(
      `https://services.leadconnectorhq.com/hooks/workflows/${workflowId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ghlApiKey}`,
        },
        body: JSON.stringify({
          locationId: ghlLocationId,
          customData,
        }),
      }
    );

    if (!ghlResponse.ok) {
      const ghlError = await ghlResponse.text();
      console.error('GHL workflow trigger failed:', ghlError);
      return NextResponse.json(
        { error: 'Failed to trigger GHL workflow', details: ghlError },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign_type,
      message: `${campaign_type} campaign triggered via GHL workflow`,
    });
  } catch (error: any) {
    console.error('Campaign trigger error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
