import { getReportData } from '@/lib/annual-report/fetch-report-data';
import { getVisibleSections, getAudienceProfile } from '@/lib/annual-report/audience-profiles';
import { PrintReportConfigurator } from '@/components/report/PrintReportConfigurator';

/**
 * Print-optimized Annual Report page
 *
 * Supports:
 * - ?audience=government|community|funder|board — section filtering per audience
 * - ?edit=1 — inline contentEditable for ephemeral text tweaks before printing
 * - ?year=2023-24 — fiscal year selection
 *
 * Style notes (matching PICC 2023-24 PDF):
 * - Purple/blue/lavender color palette
 * - Clean typography with bold section headers
 * - Circular photo frames for board members
 * - Data cards with colored backgrounds
 * - Page breaks between major sections
 */

export const metadata = {
  title: 'PICC Annual Report — Print Version',
};

export default async function PrintAnnualReportPage({
  searchParams,
}: {
  searchParams?: { year?: string; audience?: string; edit?: string }
}) {
  const fiscalYear = searchParams?.year || '2023-24';
  const audienceParam = searchParams?.audience || null;
  const editMode = searchParams?.edit === '1';
  const audienceProfile = getAudienceProfile(audienceParam);
  const visibleSections = getVisibleSections(audienceParam);

  const {
    sections,
    statistics: stats,
    boardMembers: board,
    leadershipMessages: leadership,
    highlights,
  } = await getReportData(fiscalYear);

  const reportYear = fiscalYear;

  // contentEditable props for edit mode
  const editable = editMode
    ? { contentEditable: true, suppressContentEditableWarning: true, className: 'editable-block' }
    : {};

  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      </head>
      <body>
        {/* Audience badge (screen only) */}
        {audienceProfile && (
          <div className="no-print audience-badge">
            Viewing: <strong>{audienceProfile.label}</strong> version — {audienceProfile.description}
          </div>
        )}

        {/* Cover Page */}
        <div data-section="cover" className="cover-page" style={visibleSections.has('cover') ? {} : { display: 'none' }}>
          <div className="cover-badge">Annual Report</div>
          <h1 className="cover-title" {...editable}>Palm Island Community Company</h1>
          <p className="cover-subtitle" {...editable}>Annual Report {reportYear}</p>
          <p className="cover-tagline">&ldquo;Our Community, Our Future, Our Way&rdquo;</p>
          <div className="cover-stats">
            <div className="cover-stat">
              <span className="cover-stat-value">197</span>
              <span className="cover-stat-label">Staff Members</span>
            </div>
            <div className="cover-stat">
              <span className="cover-stat-value">16</span>
              <span className="cover-stat-label">Services</span>
            </div>
            <div className="cover-stat">
              <span className="cover-stat-value">$23.4M</span>
              <span className="cover-stat-label">Revenue</span>
            </div>
            <div className="cover-stat">
              <span className="cover-stat-value">2,283</span>
              <span className="cover-stat-label">Health Clients</span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div data-section="toc" style={visibleSections.has('toc') ? {} : { display: 'none' }}>
          <div className="page-break" />
          <div className="toc">
            <h2>Contents</h2>
            <ol>
              <li>Chair&rsquo;s Report</li>
              <li>CEO&rsquo;s Report</li>
              <li>About PICC</li>
              <li>Our History</li>
              <li>Our 16 Services</li>
              <li>Key Highlights</li>
              <li>Health Service Impact</li>
              <li>Community Services</li>
              <li>Financial Overview</li>
              <li>Our People</li>
              <li>Board of Directors</li>
              <li>Our Partners</li>
              <li>Looking Ahead</li>
              <li>Acknowledgments</li>
            </ol>
          </div>
        </div>

        {/* Leadership Messages */}
        {leadership.map((msg) => {
          const sectionId = msg.role === 'chair' ? 'chair-report' : 'ceo-report';
          return (
            <div key={msg.id} data-section={sectionId} style={visibleSections.has(sectionId) ? {} : { display: 'none' }}>
              <div className="page-break" />
              <div className="section">
                <h2 className="section-title purple-bg" {...editable}>
                  {msg.message_title || `${msg.role === 'chair' ? "Chair's" : "CEO's"} Report`}
                </h2>
                <div className="leader-intro">
                  <div className="leader-avatar">{msg.person_name?.charAt(0)}</div>
                  <div>
                    <strong>{msg.person_name}</strong>
                    <br />
                    <span className="leader-role">{msg.person_title}</span>
                  </div>
                </div>
                {msg.featured_quote && (
                  <blockquote className="featured-quote" {...editable}>
                    &ldquo;{msg.featured_quote}&rdquo;
                  </blockquote>
                )}
                <div className="body-text" {...editable}>{msg.message_content}</div>
              </div>
            </div>
          );
        })}

        {/* Report Sections */}
        {sections.map((section) => (
          <div key={section.id} data-section={section.section_type || 'about'} style={visibleSections.has(section.section_type || 'about') ? {} : { display: 'none' }}>
            <div className="page-break" />
            <div className="section">
              <h2 className="section-title" {...editable}>{section.section_title}</h2>
              {section.featured_quote && (
                <blockquote className="featured-quote" {...editable}>
                  &ldquo;{section.featured_quote}&rdquo;
                  {section.quote_author && (
                    <cite>&mdash; {section.quote_author}{section.quote_author_title ? `, ${section.quote_author_title}` : ''}</cite>
                  )}
                </blockquote>
              )}
              <div className="body-text" {...editable}>{section.section_content}</div>
            </div>
          </div>
        ))}

        {/* Key Highlights */}
        <div data-section="highlights" style={visibleSections.has('highlights') ? {} : { display: 'none' }}>
          <div className="page-break" />
          <div className="section">
            <h2 className="section-title purple-bg">Key Highlights {reportYear}</h2>
            <div className="highlights-grid">
              {highlights.map((h) => (
                <div key={h.id} className="highlight-card">
                  <span className="highlight-type">{h.highlight_type?.replace('_', ' ')}</span>
                  <h3 {...editable}>{h.title}</h3>
                  {h.subtitle && <p className="highlight-subtitle" {...editable}>{h.subtitle}</p>}
                  <p {...editable}>{h.description}</p>
                  {h.impact_achieved && (
                    <div className="impact-box" {...editable}>
                      <strong>Impact:</strong> {h.impact_achieved}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div data-section="financials" style={visibleSections.has('financials') ? {} : { display: 'none' }}>
          <div className="page-break" />
          <div className="section">
            <h2 className="section-title">Impact by the Numbers</h2>
            <div className="stats-grid">
              {stats.map((stat) => (
                <div key={stat.id} className="stat-card" data-category={stat.category}>
                  <div className="stat-value" {...editable}>{stat.stat_value}</div>
                  <div className="stat-label">{stat.stat_label}</div>
                  {stat.stat_description && (
                    <div className="stat-desc">{stat.stat_description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Board of Directors */}
        <div data-section="board" style={visibleSections.has('board') ? {} : { display: 'none' }}>
          <div className="page-break" />
          <div className="section">
            <h2 className="section-title purple-bg">Board of Directors</h2>
            <div className="board-grid">
              {board.map((member) => (
                <div key={member.id} className="board-member">
                  <div className="board-avatar">{member.full_name?.charAt(0)}</div>
                  <strong>{member.full_name}</strong>
                  <span className="board-position">{member.position}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Back Cover */}
        <div data-section="acknowledgments" style={visibleSections.has('acknowledgments') ? {} : { display: 'none' }}>
          <div className="page-break" />
          <div className="back-cover">
            <h2>Palm Island Community Company</h2>
            <p className="back-tagline">&ldquo;Our Community, Our Future, Our Way&rdquo;</p>
            <p>Annual Report {reportYear}</p>
            <p className="back-note">
              This report was designed and produced by PICC&rsquo;s Communications and Design team.
            </p>
            <p className="acknowledgment" {...editable}>
              Palm Island Community Company acknowledges the Traditional Owners of Bwgcolman (Palm Island),
              the Manbarra people, and pays respects to Elders past, present, and emerging.
            </p>
          </div>
        </div>

        {/* Print Configurator (hidden when printing) */}
        <PrintReportConfigurator
          currentAudience={(audienceParam as any) || null}
          editMode={editMode}
        />
      </body>
    </html>
  );
}

// ============================================================================
// Print Styles — PICC Brand Colors
// ============================================================================

const printStyles = `
  /* PICC Brand Palette */
  :root {
    --picc-purple: #5B2D8E;
    --picc-purple-light: #7B4FB0;
    --picc-blue: #2563EB;
    --picc-lavender: #E8DEFF;
    --picc-sand: #FEF3C7;
    --picc-teal: #0D9488;
    --picc-dark: #1A202C;
    --picc-text: #374151;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: var(--picc-text);
    font-size: 11pt;
    line-height: 1.6;
    background: white;
  }

  /* Audience badge */
  .audience-badge {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: var(--picc-lavender);
    color: var(--picc-purple);
    padding: 8px 20px;
    border-radius: 999px;
    font-size: 12px;
    font-family: system-ui, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  /* Editable blocks (edit mode) */
  .editable-block {
    outline: none;
    position: relative;
  }
  .editable-block:hover {
    outline: 2px dashed var(--picc-purple-light);
    outline-offset: 4px;
    border-radius: 4px;
  }
  .editable-block:focus {
    outline: 2px solid var(--picc-purple);
    outline-offset: 4px;
    border-radius: 4px;
  }

  /* Cover Page */
  .cover-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, var(--picc-purple) 0%, #1E3A5F 50%, var(--picc-dark) 100%);
    color: white;
    padding: 60px;
  }
  .cover-badge {
    display: inline-block;
    padding: 8px 24px;
    border: 2px solid rgba(255,255,255,0.4);
    border-radius: 999px;
    font-size: 14pt;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 40px;
  }
  .cover-title {
    font-size: 36pt;
    font-weight: bold;
    margin-bottom: 16px;
    line-height: 1.2;
  }
  .cover-subtitle {
    font-size: 20pt;
    opacity: 0.9;
    margin-bottom: 12px;
  }
  .cover-tagline {
    font-size: 14pt;
    font-style: italic;
    opacity: 0.8;
    margin-bottom: 60px;
  }
  .cover-stats {
    display: flex;
    gap: 40px;
    justify-content: center;
  }
  .cover-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cover-stat-value {
    font-size: 28pt;
    font-weight: bold;
  }
  .cover-stat-label {
    font-size: 10pt;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Table of Contents */
  .toc {
    padding: 80px 60px;
  }
  .toc h2 {
    font-size: 28pt;
    color: var(--picc-purple);
    margin-bottom: 30px;
    border-bottom: 3px solid var(--picc-purple);
    padding-bottom: 10px;
  }
  .toc ol {
    list-style: none;
    counter-reset: toc;
  }
  .toc li {
    counter-increment: toc;
    padding: 12px 0;
    border-bottom: 1px solid #E5E7EB;
    font-size: 13pt;
  }
  .toc li::before {
    content: counter(toc) ".";
    color: var(--picc-purple);
    font-weight: bold;
    margin-right: 12px;
  }

  /* Sections */
  .section {
    padding: 60px;
  }
  .section-title {
    font-size: 24pt;
    color: var(--picc-purple);
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 3px solid var(--picc-lavender);
  }
  .section-title.purple-bg {
    background: var(--picc-purple);
    color: white;
    padding: 16px 24px;
    border-bottom: none;
    border-radius: 8px;
  }

  /* Leader intro */
  .leader-intro {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--picc-lavender);
    border-radius: 12px;
  }
  .leader-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--picc-purple);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24pt;
    font-weight: bold;
    flex-shrink: 0;
  }
  .leader-role {
    color: var(--picc-purple);
    font-size: 10pt;
  }

  /* Quotes */
  .featured-quote {
    font-size: 14pt;
    font-style: italic;
    color: var(--picc-purple);
    border-left: 4px solid var(--picc-purple);
    padding: 16px 24px;
    margin: 24px 0;
    background: var(--picc-lavender);
    border-radius: 0 8px 8px 0;
  }
  .featured-quote cite {
    display: block;
    font-size: 10pt;
    margin-top: 8px;
    font-style: normal;
    color: var(--picc-text);
  }

  /* Body text */
  .body-text {
    white-space: pre-line;
    font-size: 11pt;
    line-height: 1.7;
  }

  /* Highlights */
  .highlights-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 24px;
  }
  .highlight-card {
    border: 2px solid var(--picc-lavender);
    border-radius: 12px;
    padding: 20px;
    break-inside: avoid;
  }
  .highlight-type {
    display: inline-block;
    padding: 4px 12px;
    background: var(--picc-lavender);
    color: var(--picc-purple);
    border-radius: 999px;
    font-size: 9pt;
    text-transform: capitalize;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .highlight-card h3 {
    font-size: 14pt;
    color: var(--picc-dark);
    margin-bottom: 8px;
  }
  .highlight-subtitle {
    color: var(--picc-purple);
    font-size: 10pt;
    margin-bottom: 8px;
  }
  .impact-box {
    margin-top: 12px;
    padding: 12px;
    background: #F0FDF4;
    border-radius: 8px;
    font-size: 10pt;
    border: 1px solid #BBF7D0;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 24px;
  }
  .stat-card {
    text-align: center;
    padding: 16px;
    border-radius: 12px;
    background: var(--picc-lavender);
    break-inside: avoid;
  }
  .stat-card[data-category="health"] { background: #DBEAFE; }
  .stat-card[data-category="financial"] { background: #D1FAE5; }
  .stat-card[data-category="workforce"] { background: var(--picc-lavender); }
  .stat-card[data-category="service_delivery"] { background: #FEF3C7; }
  .stat-card[data-category="outcomes"] { background: #FCE7F3; }
  .stat-value {
    font-size: 22pt;
    font-weight: bold;
    color: var(--picc-dark);
  }
  .stat-label {
    font-size: 9pt;
    font-weight: bold;
    color: var(--picc-purple);
    margin-top: 4px;
  }
  .stat-desc {
    font-size: 8pt;
    color: #6B7280;
    margin-top: 4px;
  }

  /* Board Grid */
  .board-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-top: 24px;
    text-align: center;
  }
  .board-member {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .board-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--picc-purple), var(--picc-purple-light));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28pt;
    font-weight: bold;
    border: 3px solid var(--picc-lavender);
  }
  .board-position {
    font-size: 10pt;
    color: var(--picc-purple);
  }

  /* Back Cover */
  .back-cover {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: var(--picc-dark);
    color: white;
    padding: 60px;
  }
  .back-cover h2 {
    font-size: 28pt;
    margin-bottom: 16px;
  }
  .back-tagline {
    font-size: 16pt;
    font-style: italic;
    opacity: 0.8;
    margin-bottom: 24px;
  }
  .back-note {
    font-size: 10pt;
    opacity: 0.6;
    margin-top: 40px;
  }
  .acknowledgment {
    font-size: 10pt;
    opacity: 0.7;
    max-width: 500px;
    margin-top: 24px;
    line-height: 1.5;
  }

  /* Page breaks */
  .page-break {
    page-break-after: always;
    break-after: page;
    height: 0;
  }

  /* Print-specific overrides */
  @media print {
    .no-print { display: none !important; }
    body { font-size: 10pt; }
    .audience-badge { display: none !important; }
    .editable-block:hover, .editable-block:focus { outline: none; }
    .cover-page {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .back-cover {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .section-title.purple-bg {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .stat-card, .featured-quote, .leader-intro, .highlight-card, .board-avatar, .leader-avatar {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .section { padding: 40px; }
    .highlights-grid { grid-template-columns: 1fr 1fr; }
    .stats-grid { grid-template-columns: repeat(4, 1fr); }
    .board-grid { grid-template-columns: repeat(4, 1fr); }
  }

  @page {
    size: A4;
    margin: 0;
  }
`;
