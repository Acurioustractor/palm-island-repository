import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/og?title=...&subtitle=...&type=...
 *
 * Generates dynamic Open Graph images for social sharing.
 *
 * Query params:
 * - title: Main text (required)
 * - subtitle: Secondary text
 * - type: annual-report | story | service | impact (affects styling)
 * - stat: A key stat to highlight (e.g., "197 Staff")
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'Palm Island Community Company';
  const subtitle = searchParams.get('subtitle') || '';
  const type = searchParams.get('type') || 'default';
  const stat = searchParams.get('stat') || '';

  const gradients: Record<string, string> = {
    'annual-report': 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
    'story': 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    'service': 'linear-gradient(135deg, #059669 0%, #2563eb 100%)',
    'impact': 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
    'default': 'linear-gradient(135deg, #2563eb 0%, #9333ea 100%)',
  };

  const bg = gradients[type] || gradients.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: bg,
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* PICC Logo Text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            P
          </div>
          <span
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            PALM ISLAND COMMUNITY COMPANY
          </span>
        </div>

        {/* Main Title */}
        <h1
          style={{
            color: 'white',
            fontSize: title.length > 40 ? '48px' : '56px',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            margin: 0,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '24px',
              textAlign: 'center',
              marginTop: '16px',
              maxWidth: '700px',
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Stat Badge */}
        {stat && (
          <div
            style={{
              display: 'flex',
              marginTop: '32px',
              padding: '12px 32px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <span
              style={{
                color: 'white',
                fontSize: '22px',
                fontWeight: 'bold',
              }}
            >
              {stat}
            </span>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '16px',
          }}
        >
          picc.com.au
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
