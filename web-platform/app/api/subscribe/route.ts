import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * POST /api/subscribe
 *
 * Stores a newsletter subscription in Supabase and (when configured)
 * forwards the contact to GoHighLevel for campaign management.
 *
 * Body: { email: string, name?: string, interests?: string[] }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, interests } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Upsert into newsletter_subscribers (idempotent on email)
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
          interests: interests || [],
          subscribed_at: new Date().toISOString(),
          status: 'active',
        },
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save subscription. Please try again.' },
        { status: 500 }
      );
    }

    // TODO: Wire to GHL when webhook URL is configured.
    // When GHL_SUBSCRIBE_WEBHOOK_URL is set, forward the contact:
    //
    // const ghlWebhookUrl = process.env.GHL_SUBSCRIBE_WEBHOOK_URL;
    // if (ghlWebhookUrl) {
    //   await fetch(ghlWebhookUrl, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       email: email.toLowerCase().trim(),
    //       name: name?.trim() || '',
    //       tags: (interests || []).map((i: string) => `interest:${i}`),
    //       source: 'website_subscribe_form',
    //     }),
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
    });
  } catch (error: unknown) {
    console.error('Subscribe error:', error);
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
