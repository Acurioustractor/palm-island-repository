# Figma + Claude Code Workflow

Connect Claude Code to Figma for rapid design exploration, especially for annual report layouts and brand materials.

## Setup

### 1. Get a Figma Personal Access Token

1. Open Figma → Settings → Account
2. Scroll to **Personal Access Tokens**
3. Click **Generate new token**
4. Give it a name (e.g. "Claude Code")
5. Copy the token

### 2. Configure the MCP Server

Edit `.mcp.json` in the project root and paste your token:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_TOKEN_HERE"],
      "env": {
        "FIGMA_API_KEY": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

### 3. Restart Claude Code

The Figma MCP tools will now appear in your tool list.

## Workflows

### Read a Figma Design into Code

1. Open your Figma file and copy the file URL
2. Ask Claude Code: "Read this Figma file and describe the layout: [paste URL]"
3. Claude will use the Figma MCP to inspect frames, components, and styles
4. You can then say: "Convert this design to a React component" or "Match this layout in the annual report PDF"

### Explore Design Variations

1. Start with an existing page (e.g. the annual report cover)
2. Ask Claude: "Create 3 variations of this cover layout with different color schemes"
3. Review the variations in Figma
4. Pick your favorite: "Use variation 2 and implement it in FocusReportPDF.tsx"

### Design → PDF Pipeline

The typical flow:

```
Figma design → Claude reads layout → React PDF template → /api/pdf/generate → PDF output
```

1. **Design in Figma** — Create or iterate on a layout
2. **Read into Claude** — Claude inspects the Figma frames via MCP
3. **Generate React PDF** — Claude translates the design to `@react-pdf/renderer` components
4. **Test** — Hit `/api/pdf/generate?type=...` to preview the output
5. **Iterate** — Adjust in Figma or code until satisfied

### Brand Consistency Check

Ask Claude: "Compare the colors in this Figma file against our brand palette in lib/pdf/theme.ts"

Claude will read both and flag any inconsistencies.

## Available Figma MCP Tools

Once configured, Claude Code can:

- **Read Figma files** — inspect pages, frames, components, and styles
- **Get design tokens** — extract colors, typography, and spacing from Figma
- **Read specific frames** — focus on individual components or pages

## Connection to PICC PDF System

The Figma workflow feeds directly into:

- `lib/pdf/theme.ts` — brand colors, typography, and dimensions
- `lib/pdf/components/` — reusable PDF components (StatBox, PhotoCover, Card, etc.)
- `lib/pdf/templates/` — full PDF templates (AnnualReportPDF, FocusReportPDF, BrandGuidePDF)
- `/api/pdf/generate` — the API endpoint that renders PDFs server-side

Design decisions made in Figma can be directly translated to theme tokens and component props.
