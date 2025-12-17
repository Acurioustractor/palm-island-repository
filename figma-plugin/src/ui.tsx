import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Types
interface SelectionItem {
  id: string;
  name: string;
  type: string;
  componentType: string | null;
}

interface PageInfo {
  id: string;
  name: string;
  childCount: number;
}

interface ExportData {
  version: string;
  exportedAt: string;
  sections: any[];
  images: any[];
  metadata: any;
  pageName?: string;
  pages?: any[];
}

// Component type icons
const COMPONENT_ICONS: Record<string, string> = {
  'ReportHero': '🎯',
  'ImpactStat': '📊',
  'ImpactStatsGrid': '📈',
  'QuoteShowcase': '💬',
  'LeadershipMessage': '👤',
  'Timeline': '📅',
  'StoryCard': '📖',
  'StoryGrid': '📚',
  'PhotoGallery': '🖼️',
  'HeroGallery': '🌄',
  'FinancialDonut': '💰',
  'DollarBreakdown': '💵',
  'ServiceShowcase': '🏥',
  'Section': '📄',
};

// Annual Report Template
const ANNUAL_REPORT_TEMPLATE = {
  "name": "PICC Annual Report 2024-25",
  "version": "1.0",
  "fiscalYear": "2024-25",
  "sections": [
    { "id": "hero", "type": "ReportHero", "name": "Hero Section", "order": 0, "width": 1440, "height": 800, "props": { "title": "PICC Annual Report 2024-25", "subtitle": "Our Community, Our Future, Our Way" }, "placeholders": { "backgroundImage": { "width": 1440, "height": 800, "label": "Hero Background Image" } } },
    { "id": "impact-stats", "type": "ImpactStatsGrid", "name": "Key Statistics", "order": 1, "width": 1440, "height": 400, "props": { "title": "Year at a Glance", "stats": [{ "value": "197+", "label": "Staff Members" }, { "value": "2,283", "label": "Health Clients" }, { "value": "17,488", "label": "Episodes of Care" }, { "value": "1,187", "label": "Children Supported" }, { "value": "95%", "label": "Local Staff" }, { "value": "$23.4M", "label": "Revenue" }] } },
    { "id": "executive-summary", "type": "Section", "name": "Executive Summary", "order": 2, "width": 1440, "height": 600, "props": { "title": "Executive Summary", "content": "[Update with 2024-25 achievements]" } },
    { "id": "ceo-message", "type": "LeadershipMessage", "name": "CEO Message", "order": 3, "width": 1440, "height": 700, "props": { "name": "Rachel Atkinson", "role": "Chief Executive Officer", "message": "[CEO message for 2024-25]" }, "placeholders": { "photo": { "width": 400, "height": 500, "label": "CEO Portrait" } } },
    { "id": "chair-message", "type": "LeadershipMessage", "name": "Chair Message", "order": 4, "width": 1440, "height": 700, "props": { "name": "Luella Bligh", "role": "Board Chair", "message": "[Chair message for 2024-25]" }, "placeholders": { "photo": { "width": 400, "height": 500, "label": "Chair Portrait" } } },
    { "id": "quote-1", "type": "QuoteShowcase", "name": "Community Quote", "order": 5, "width": 1440, "height": 400, "props": { "quote": "[Add community quote]", "author": "[Name]", "role": "[Role]" } },
    { "id": "services", "type": "ServiceShowcase", "name": "Our Services", "order": 6, "width": 1440, "height": 800, "props": { "title": "Services We Deliver", "services": [{ "name": "Health Services", "icon": "health" }, { "name": "Safe Haven", "icon": "shield" }, { "name": "Housing", "icon": "home" }, { "name": "Youth Programs", "icon": "graduation" }, { "name": "Elder Services", "icon": "heart" }, { "name": "Employment", "icon": "briefcase" }] } },
    { "id": "timeline", "type": "Timeline", "name": "Year Timeline", "order": 7, "width": 1440, "height": 900, "props": { "title": "Our Journey Through 2024-25", "events": [{ "date": "July 2024", "title": "[Event]", "description": "[Description]" }, { "date": "Sept 2024", "title": "[Event]", "description": "[Description]" }, { "date": "Nov 2024", "title": "[Event]", "description": "[Description]" }, { "date": "Jan 2025", "title": "[Event]", "description": "[Description]" }, { "date": "Mar 2025", "title": "[Event]", "description": "[Description]" }, { "date": "May 2025", "title": "[Event]", "description": "[Description]" }, { "date": "June 2025", "title": "[Event]", "description": "[Description]" }] } },
    { "id": "stories", "type": "StoryGrid", "name": "Community Stories", "order": 8, "width": 1440, "height": 1000, "props": { "title": "Stories from Our Community" }, "placeholders": { "images": [{ "width": 400, "height": 300, "label": "Story 1" }, { "width": 400, "height": 300, "label": "Story 2" }, { "width": 400, "height": 300, "label": "Story 3" }, { "width": 400, "height": 300, "label": "Story 4" }] } },
    { "id": "voices", "type": "PersonQuoteGrid", "name": "Community Voices", "order": 9, "width": 1440, "height": 1200, "props": { "title": "Voices from Palm Island" }, "placeholders": { "photos": [{ "width": 300, "height": 300, "label": "Person 1" }, { "width": 300, "height": 300, "label": "Person 2" }, { "width": 300, "height": 300, "label": "Person 3" }, { "width": 300, "height": 300, "label": "Person 4" }, { "width": 300, "height": 300, "label": "Person 5" }, { "width": 300, "height": 300, "label": "Person 6" }] } },
    { "id": "projects", "type": "ProjectShowcase", "name": "Innovation Projects", "order": 10, "width": 1440, "height": 900, "props": { "title": "Innovation & Special Projects" } },
    { "id": "financial", "type": "FinancialDonut", "name": "Financial Overview", "order": 11, "width": 1440, "height": 700, "props": { "title": "Where Our Funding Goes", "segments": [{ "label": "Wages & Salaries", "percentage": 60, "color": "#2d6a4f" }, { "label": "Administration", "percentage": 21, "color": "#1e3a5f" }, { "label": "Program Supplies", "percentage": 9, "color": "#e85d04" }, { "label": "Contractors", "percentage": 6, "color": "#8b5a2b" }, { "label": "Other Costs", "percentage": 4, "color": "#6b7280" }] } },
    { "id": "gallery", "type": "PhotoGallery", "name": "Year in Photos", "order": 12, "width": 1440, "height": 1000, "props": { "title": "Our Year in Photos" }, "placeholders": { "images": [{ "width": 600, "height": 400, "label": "Photo 1" }, { "width": 600, "height": 400, "label": "Photo 2" }, { "width": 600, "height": 400, "label": "Photo 3" }, { "width": 600, "height": 400, "label": "Photo 4" }] } },
    { "id": "acknowledgments", "type": "Section", "name": "Acknowledgments", "order": 13, "width": 1440, "height": 500, "props": { "title": "Acknowledgments", "content": "We acknowledge the Manbarra and Bwgcolman peoples...", "backgroundColor": "#1e3a5f", "textColor": "white" } }
  ],
  "designTokens": { "colors": { "primary": "#1e3a5f", "secondary": "#7c3aed", "accent": "#e85d04" }, "spacing": { "section": 80 } }
};

// Main App
function App() {
  const [tab, setTab] = useState<'template' | 'export' | 'preview' | 'settings'>('template');
  const [selection, setSelection] = useState<SelectionItem[]>([]);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:3000/api/annual-report/import');

  // Listen for messages from plugin code
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      switch (msg.type) {
        case 'selection-info':
          setSelection(msg.payload);
          break;
        case 'pages-info':
          setPages(msg.payload);
          break;
        case 'export-complete':
          setExportData(msg.payload);
          setIsExporting(false);
          setSuccess('Export complete!');
          setTab('preview');
          break;
        case 'error':
          setError(msg.payload);
          setIsExporting(false);
          setIsCreating(false);
          break;
        case 'do-publish':
          doPublish(msg.payload);
          break;
        case 'publish-status':
          if (msg.payload.status === 'complete') {
            setIsPublishing(false);
            setSuccess('Published successfully!');
          }
          break;
        case 'template-status':
          if (msg.payload.status === 'complete') {
            setIsCreating(false);
            setSuccess(msg.payload.message);
          } else if (msg.payload.status === 'error') {
            setIsCreating(false);
            setError(msg.payload.message);
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send message to plugin code
  const postMessage = (type: string, payload?: any) => {
    parent.postMessage({ pluginMessage: { type, payload } }, '*');
  };

  // Export handlers
  const handleExportSelection = () => {
    setIsExporting(true);
    setError(null);
    postMessage('export-selection');
  };

  const handleExportPage = () => {
    setIsExporting(true);
    setError(null);
    postMessage('export-page');
  };

  const handleExportAll = () => {
    setIsExporting(true);
    setError(null);
    postMessage('export-all');
  };

  // Create from template
  const handleCreateTemplate = () => {
    setIsCreating(true);
    setError(null);
    postMessage('create-template', ANNUAL_REPORT_TEMPLATE);
  };

  // Copy to clipboard
  const handleCopyJSON = () => {
    if (exportData) {
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      setSuccess('Copied to clipboard!');
    }
  };

  // Download JSON
  const handleDownloadJSON = () => {
    if (exportData) {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annual-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Publish to API
  const doPublish = async (data: any) => {
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setIsPublishing(false);
      setSuccess('Published successfully!');
    } catch (err) {
      setError(`Publish failed: ${err}`);
      setIsPublishing(false);
    }
  };

  const handlePublish = () => {
    if (exportData) {
      setIsPublishing(true);
      setError(null);
      doPublish(exportData);
    }
  };

  // Clear messages after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>PICC Annual Report</h1>
        <p>Export Figma designs to web components</p>
      </header>

      {/* Tabs */}
      <nav className="tabs">
        <button
          className={tab === 'template' ? 'active' : ''}
          onClick={() => setTab('template')}
        >
          Template
        </button>
        <button
          className={tab === 'export' ? 'active' : ''}
          onClick={() => setTab('export')}
        >
          Export
        </button>
        <button
          className={tab === 'preview' ? 'active' : ''}
          onClick={() => setTab('preview')}
          disabled={!exportData}
        >
          Preview
        </button>
        <button
          className={tab === 'settings' ? 'active' : ''}
          onClick={() => setTab('settings')}
        >
          Settings
        </button>
      </nav>

      {/* Messages */}
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* Content */}
      <main className="content">
        {tab === 'template' && (
          <TemplateTab
            isCreating={isCreating}
            onCreateTemplate={handleCreateTemplate}
          />
        )}

        {tab === 'export' && (
          <ExportTab
            selection={selection}
            pages={pages}
            isExporting={isExporting}
            onExportSelection={handleExportSelection}
            onExportPage={handleExportPage}
            onExportAll={handleExportAll}
          />
        )}

        {tab === 'preview' && exportData && (
          <PreviewTab
            data={exportData}
            isPublishing={isPublishing}
            onCopy={handleCopyJSON}
            onDownload={handleDownloadJSON}
            onPublish={handlePublish}
          />
        )}

        {tab === 'settings' && (
          <SettingsTab
            apiEndpoint={apiEndpoint}
            onApiEndpointChange={setApiEndpoint}
          />
        )}
      </main>
    </div>
  );
}

// Template Tab
function TemplateTab({
  isCreating,
  onCreateTemplate,
}: {
  isCreating: boolean;
  onCreateTemplate: () => void;
}) {
  return (
    <div className="template-tab">
      <section className="section">
        <h2>Create Annual Report Template</h2>
        <p className="template-intro">
          Generate a complete 2024-25 annual report template in Figma with all sections pre-configured.
          This creates frames based on the successful 2023-24 report structure.
        </p>
        <button
          className="primary create-button"
          onClick={onCreateTemplate}
          disabled={isCreating}
        >
          {isCreating ? 'Creating Template...' : 'Create 2024-25 Template'}
        </button>
      </section>

      <section className="section">
        <h2>Template Sections ({ANNUAL_REPORT_TEMPLATE.sections.length})</h2>
        <ul className="template-list">
          {ANNUAL_REPORT_TEMPLATE.sections.map((section, i) => (
            <li key={section.id} className="template-item">
              <span className="order">{i + 1}</span>
              <span className="icon">
                {COMPONENT_ICONS[section.type] || '📄'}
              </span>
              <div className="info">
                <span className="name">{section.name}</span>
                <span className="dimensions">{section.width} × {section.height}px</span>
              </div>
              <span className="type-badge">{section.type}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>What Gets Created</h2>
        <div className="features-grid">
          <div className="feature">
            <span className="feature-icon">📐</span>
            <span className="feature-text">Pre-sized frames for each section</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🖼️</span>
            <span className="feature-text">Image placeholders marked for drop-in</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📝</span>
            <span className="feature-text">Text content with placeholder markers</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span className="feature-text">PICC brand colors applied</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Workflow</h2>
        <ol className="workflow-list">
          <li>Click "Create Template" to generate all frames</li>
          <li>Replace placeholder images with actual photos</li>
          <li>Update text content for 2024-25</li>
          <li>Switch to Export tab to export to website</li>
        </ol>
      </section>
    </div>
  );
}

// Export Tab
function ExportTab({
  selection,
  pages,
  isExporting,
  onExportSelection,
  onExportPage,
  onExportAll,
}: {
  selection: SelectionItem[];
  pages: PageInfo[];
  isExporting: boolean;
  onExportSelection: () => void;
  onExportPage: () => void;
  onExportAll: () => void;
}) {
  return (
    <div className="export-tab">
      {/* Selection Info */}
      <section className="section">
        <h2>Current Selection</h2>
        {selection.length === 0 ? (
          <p className="empty">No frames selected. Select frames to export.</p>
        ) : (
          <ul className="selection-list">
            {selection.map(item => (
              <li key={item.id}>
                <span className="icon">
                  {COMPONENT_ICONS[item.componentType || 'Section'] || '📄'}
                </span>
                <span className="name">{item.name}</span>
                <span className="type">
                  {item.componentType || 'Section'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Export Options */}
      <section className="section">
        <h2>Export Options</h2>
        <div className="button-group">
          <button
            className="primary"
            onClick={onExportSelection}
            disabled={isExporting || selection.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export Selection'}
          </button>
          <button
            onClick={onExportPage}
            disabled={isExporting}
          >
            Export Current Page
          </button>
          <button
            onClick={onExportAll}
            disabled={isExporting}
          >
            Export All Pages
          </button>
        </div>
      </section>

      {/* Component Mapping Reference */}
      <section className="section">
        <h2>Component Mapping</h2>
        <p className="help">
          Name your Figma frames with these keywords to auto-detect components:
        </p>
        <div className="mapping-grid">
          {Object.entries(COMPONENT_ICONS).map(([name, icon]) => (
            <div key={name} className="mapping-item">
              <span className="icon">{icon}</span>
              <span className="name">{name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Preview Tab
function PreviewTab({
  data,
  isPublishing,
  onCopy,
  onDownload,
  onPublish,
}: {
  data: ExportData;
  isPublishing: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="preview-tab">
      {/* Summary */}
      <section className="section">
        <h2>Export Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="value">{data.sections.length}</span>
            <span className="label">Sections</span>
          </div>
          <div className="summary-item">
            <span className="value">{data.images.length}</span>
            <span className="label">Images</span>
          </div>
          <div className="summary-item">
            <span className="value">{data.pages?.length || 1}</span>
            <span className="label">Pages</span>
          </div>
        </div>
      </section>

      {/* Sections List */}
      <section className="section">
        <h2>Detected Components</h2>
        <ul className="component-list">
          {data.sections.map((section, i) => (
            <li key={i}>
              <span className="icon">
                {COMPONENT_ICONS[section.componentType] || '📄'}
              </span>
              <div className="info">
                <span className="name">{section.name}</span>
                <span className="type">{section.componentType}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Actions */}
      <section className="section">
        <h2>Actions</h2>
        <div className="button-group">
          <button className="primary" onClick={onDownload}>
            Download JSON
          </button>
          <button onClick={onCopy}>
            Copy to Clipboard
          </button>
          <button
            className="publish"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish to Website'}
          </button>
        </div>
      </section>

      {/* JSON Preview */}
      <section className="section">
        <h2>JSON Preview</h2>
        <pre className="json-preview">
          {JSON.stringify(data, null, 2).slice(0, 2000)}
          {JSON.stringify(data, null, 2).length > 2000 && '\n...'}
        </pre>
      </section>
    </div>
  );
}

// Settings Tab
function SettingsTab({
  apiEndpoint,
  onApiEndpointChange,
}: {
  apiEndpoint: string;
  onApiEndpointChange: (value: string) => void;
}) {
  return (
    <div className="settings-tab">
      <section className="section">
        <h2>API Configuration</h2>
        <label>
          <span>API Endpoint</span>
          <input
            type="url"
            value={apiEndpoint}
            onChange={e => onApiEndpointChange(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <p className="help">
          The API endpoint where exported data will be published.
        </p>
      </section>

      <section className="section">
        <h2>About</h2>
        <p>
          PICC Annual Report Figma Plugin v1.0.0
        </p>
        <p className="help">
          This plugin exports Figma designs to JSON format compatible with
          the PICC Annual Report web components.
        </p>
      </section>
    </div>
  );
}

// Styles
const styles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    color: var(--figma-color-text);
    background: var(--figma-color-bg);
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .header {
    padding: 16px;
    border-bottom: 1px solid var(--figma-color-border);
    background: linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%);
    color: white;
  }

  .header h1 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .header p {
    font-size: 11px;
    opacity: 0.8;
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid var(--figma-color-border);
  }

  .tabs button {
    flex: 1;
    padding: 10px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: var(--figma-color-text-secondary);
    transition: all 0.2s;
  }

  .tabs button:hover {
    background: var(--figma-color-bg-hover);
  }

  .tabs button.active {
    color: var(--figma-color-text);
    border-bottom: 2px solid #7c3aed;
  }

  .tabs button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .message {
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 500;
  }

  .message.error {
    background: #fef2f2;
    color: #dc2626;
  }

  .message.success {
    background: #f0fdf4;
    color: #16a34a;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .section {
    margin-bottom: 20px;
  }

  .section h2 {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--figma-color-text-secondary);
    margin-bottom: 10px;
  }

  .empty {
    color: var(--figma-color-text-tertiary);
    font-style: italic;
    padding: 20px;
    text-align: center;
    background: var(--figma-color-bg-secondary);
    border-radius: 6px;
  }

  .selection-list,
  .component-list {
    list-style: none;
    background: var(--figma-color-bg-secondary);
    border-radius: 6px;
    overflow: hidden;
  }

  .selection-list li,
  .component-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--figma-color-border);
  }

  .selection-list li:last-child,
  .component-list li:last-child {
    border-bottom: none;
  }

  .selection-list .icon,
  .component-list .icon {
    font-size: 16px;
  }

  .selection-list .name,
  .component-list .info .name {
    flex: 1;
    font-weight: 500;
  }

  .selection-list .type,
  .component-list .info .type {
    font-size: 10px;
    color: var(--figma-color-text-tertiary);
    background: var(--figma-color-bg);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .component-list .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  button {
    padding: 10px 16px;
    border: 1px solid var(--figma-color-border);
    border-radius: 6px;
    background: var(--figma-color-bg);
    color: var(--figma-color-text);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover:not(:disabled) {
    background: var(--figma-color-bg-hover);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.primary {
    background: #7c3aed;
    border-color: #7c3aed;
    color: white;
  }

  button.primary:hover:not(:disabled) {
    background: #6d28d9;
  }

  button.publish {
    background: #1e3a5f;
    border-color: #1e3a5f;
    color: white;
  }

  button.publish:hover:not(:disabled) {
    background: #172e4d;
  }

  .help {
    font-size: 11px;
    color: var(--figma-color-text-tertiary);
    margin-top: 6px;
  }

  .mapping-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .mapping-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    background: var(--figma-color-bg-secondary);
    border-radius: 4px;
    font-size: 10px;
  }

  .mapping-item .icon {
    font-size: 14px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: var(--figma-color-bg-secondary);
    border-radius: 8px;
  }

  .summary-item .value {
    font-size: 24px;
    font-weight: 700;
    color: #7c3aed;
  }

  .summary-item .label {
    font-size: 10px;
    color: var(--figma-color-text-tertiary);
    margin-top: 4px;
  }

  .json-preview {
    background: var(--figma-color-bg-secondary);
    border-radius: 6px;
    padding: 12px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 10px;
    overflow-x: auto;
    max-height: 200px;
    white-space: pre-wrap;
    word-break: break-all;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label span {
    font-size: 11px;
    font-weight: 500;
  }

  input {
    padding: 10px 12px;
    border: 1px solid var(--figma-color-border);
    border-radius: 6px;
    font-size: 12px;
    background: var(--figma-color-bg);
    color: var(--figma-color-text);
  }

  input:focus {
    outline: none;
    border-color: #7c3aed;
  }

  /* Template Tab Styles */
  .template-intro {
    font-size: 12px;
    line-height: 1.5;
    color: var(--figma-color-text-secondary);
    margin-bottom: 16px;
  }

  .create-button {
    width: 100%;
    padding: 14px 20px;
    font-size: 14px;
  }

  .template-list {
    list-style: none;
    background: var(--figma-color-bg-secondary);
    border-radius: 8px;
    overflow: hidden;
    max-height: 300px;
    overflow-y: auto;
  }

  .template-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--figma-color-border);
  }

  .template-item:last-child {
    border-bottom: none;
  }

  .template-item .order {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #7c3aed;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    font-weight: 600;
  }

  .template-item .icon {
    font-size: 18px;
  }

  .template-item .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .template-item .name {
    font-weight: 500;
    font-size: 12px;
  }

  .template-item .dimensions {
    font-size: 10px;
    color: var(--figma-color-text-tertiary);
  }

  .template-item .type-badge {
    font-size: 9px;
    padding: 3px 8px;
    background: var(--figma-color-bg);
    border-radius: 4px;
    color: var(--figma-color-text-tertiary);
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: var(--figma-color-bg-secondary);
    border-radius: 6px;
  }

  .feature-icon {
    font-size: 16px;
  }

  .feature-text {
    font-size: 11px;
    color: var(--figma-color-text-secondary);
  }

  .workflow-list {
    padding-left: 20px;
    margin: 0;
  }

  .workflow-list li {
    padding: 8px 0;
    font-size: 12px;
    color: var(--figma-color-text-secondary);
    border-bottom: 1px solid var(--figma-color-border);
  }

  .workflow-list li:last-child {
    border-bottom: none;
  }
`;

// Inject styles and render
const styleEl = document.createElement('style');
styleEl.textContent = styles;
document.head.appendChild(styleEl);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
