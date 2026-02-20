import { createClient } from '@supabase/supabase-js';
import { STAFF, SERVICES, FINANCIALS, MILESTONES } from '@/lib/stats/current-stats';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Embeddable Impact Widget
 *
 * Lightweight page designed to be embedded via iframe on external websites.
 * Auto-updates from Supabase.
 *
 * Usage: <iframe src="https://picc.com.au/embed/impact?theme=light&stats=staff,services,clients" />
 *
 * Query params:
 * - theme: light | dark (default: light)
 * - stats: comma-separated list of stats to show (default: all)
 */
export default async function EmbedImpactPage({
  searchParams,
}: {
  searchParams?: { theme?: string; stats?: string };
}) {
  const theme = searchParams?.theme || 'light';
  const requestedStats = searchParams?.stats?.split(',').map(s => s.trim()) || [];

  // Fetch real stats from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let stats: { staff: number; services: number; clients: string; since: number; budget: string } = {
    staff: STAFF.total,
    services: SERVICES.total,
    clients: '3,000+',
    since: MILESTONES.founded,
    budget: FINANCIALS.incomeDisplay,
  };

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data } = await supabase
        .from('organization_stats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        stats = {
          staff: data.staff_count || stats.staff,
          services: data.service_count || stats.services,
          clients: data.people_served?.toLocaleString() || stats.clients,
          since: MILESTONES.founded,
          budget: data.annual_budget
            ? `$${(data.annual_budget / 1_000_000).toFixed(0)}M`
            : stats.budget,
        };
      }
    } catch {
      // Use defaults
    }
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1a2e' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const accentColor = isDark ? '#818cf8' : '#2563eb';
  const borderColor = isDark ? '#334155' : '#e2e8f0';

  const allStats = [
    { key: 'staff', value: stats.staff, label: 'Staff Members' },
    { key: 'services', value: stats.services, label: 'Integrated Services' },
    { key: 'clients', value: stats.clients, label: 'People Served' },
    { key: 'since', value: stats.since, label: 'Community-Controlled Since' },
    { key: 'budget', value: stats.budget, label: 'Annual Investment' },
  ];

  const displayStats = requestedStats.length > 0
    ? allStats.filter(s => requestedStats.includes(s.key))
    : allStats;

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${bgColor};
            color: ${textColor};
            padding: 16px;
          }
          .widget {
            border: 1px solid ${borderColor};
            border-radius: 12px;
            padding: 20px;
            max-width: 480px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid ${borderColor};
          }
          .header h3 {
            font-size: 14px;
            font-weight: 700;
            color: ${accentColor};
            letter-spacing: 0.02em;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 12px;
          }
          .stat {
            text-align: center;
            padding: 12px 8px;
            border-radius: 8px;
            background: ${isDark ? '#1e293b' : '#f8fafc'};
          }
          .stat .value {
            font-size: 24px;
            font-weight: 800;
            color: ${textColor};
            line-height: 1.2;
          }
          .stat .label {
            font-size: 11px;
            color: ${mutedColor};
            margin-top: 2px;
          }
          .footer {
            margin-top: 12px;
            text-align: center;
          }
          .footer a {
            color: ${accentColor};
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
          }
          .footer a:hover { text-decoration: underline; }
        `}} />
      </head>
      <body>
        <div className="widget">
          <div className="header">
            <h3>PALM ISLAND COMMUNITY COMPANY</h3>
          </div>
          <div className="stats-grid">
            {displayStats.map(stat => (
              <div key={stat.key} className="stat">
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="footer">
            <a href="https://picc.com.au/annual-report/live" target="_blank" rel="noopener noreferrer">
              View Full Report →
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
