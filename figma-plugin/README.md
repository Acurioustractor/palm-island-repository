# PICC Annual Report Figma Plugin

Export Figma designs directly to the Palm Island Community Company annual report web components.

## Features

- **Auto-detect components** - Name your frames with keywords like "hero", "stats", "quote" to automatically map to web components
- **Export to JSON** - Download component data as JSON for manual import
- **Direct publish** - Push designs directly to the website API
- **Image extraction** - Automatically exports embedded images
- **Multi-page support** - Export single frames, entire pages, or all pages

## Installation

### Development (Local)

1. Install dependencies:
   ```bash
   cd figma-plugin
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. In Figma Desktop:
   - Go to **Plugins > Development > Import plugin from manifest**
   - Select the `manifest.json` file from this directory

### Production

The plugin will be published to Figma Community (coming soon).

## Usage

### 1. Design Your Report

Create frames in Figma using these naming conventions for auto-detection:

| Frame Name Contains | Maps To Component |
|---------------------|-------------------|
| `hero` | ReportHero |
| `stats`, `impact-stat` | ImpactStatsGrid |
| `quote` | QuoteShowcase |
| `leadership` | LeadershipMessage |
| `timeline` | Timeline |
| `story`, `stories` | StoryGrid |
| `gallery`, `photo` | PhotoGallery |
| `financial`, `dollar` | FinancialDonut |
| `service` | ServiceShowcase |
| `project` | ProjectShowcase |
| `milestone` | MilestoneCounter |

### 2. Export

1. Select frames you want to export (or export entire page)
2. Run the plugin: **Plugins > PICC Annual Report Exporter**
3. Choose export option:
   - **Export Selection** - Only selected frames
   - **Export Current Page** - All top-level frames on current page
   - **Export All Pages** - All frames from all pages

### 3. Use the Export

**Option A: Download JSON**
- Click "Download JSON" to save the export file
- Import manually into the web platform

**Option B: Direct Publish**
- Configure the API endpoint in Settings
- Click "Publish to Website" to push directly

## Component Mapping

The plugin extracts data based on detected component type:

### ReportHero
```json
{
  "type": "hero",
  "title": "First text layer",
  "subtitle": "Second text layer",
  "backgroundImage": "base64..."
}
```

### ImpactStatsGrid
```json
{
  "type": "stats",
  "stats": [
    { "value": "197", "label": "Team Members" },
    { "value": "95%", "label": "Local Staff" }
  ]
}
```

### QuoteShowcase
```json
{
  "type": "quote",
  "quote": "Quote text",
  "author": "Author name",
  "role": "Author role"
}
```

### LeadershipMessage
```json
{
  "type": "leadership",
  "name": "Rachel Atkinson",
  "role": "CEO",
  "message": "Message content...",
  "photo": "base64..."
}
```

### Timeline
```json
{
  "type": "timeline",
  "events": [
    { "year": "2007", "title": "PICC Established" },
    { "year": "2021", "title": "Community Control" }
  ]
}
```

## API Integration

The plugin can publish directly to the web platform API:

**Endpoint:** `POST /api/annual-report/import`

**Request:**
```json
{
  "version": "1.0",
  "exportedAt": "2024-12-11T...",
  "sections": [...],
  "images": [...],
  "metadata": {
    "figmaFileId": "...",
    "pageName": "Annual Report 2024-25"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Imported 12 sections and 5 images",
  "fiscalYear": "2024-25",
  "sections": 12,
  "images": 5
}
```

## Development

### Watch Mode

Run in watch mode during development:
```bash
npm run watch
```

### Build

Build for production:
```bash
npm run build
```

### Project Structure

```
figma-plugin/
├── manifest.json      # Figma plugin manifest
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── src/
│   ├── code.ts        # Main plugin code (runs in Figma sandbox)
│   └── ui.tsx         # Plugin UI (React)
├── scripts/
│   └── build-html.js  # HTML builder
└── dist/              # Built files
    ├── code.js
    └── ui.html
```

## Troubleshooting

### "No frames selected"
Select at least one frame before clicking Export Selection.

### Images not exporting
- Ensure images are embedded (not linked)
- Check that fills are visible

### Publish failing
- Verify API endpoint in Settings
- Check that the web server is running
- Ensure CORS is configured for Figma domains

## License

MIT - Palm Island Community Company
