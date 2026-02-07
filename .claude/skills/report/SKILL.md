# Report Skill

Generate PICC annual reports end-to-end using the unified WeasyPrint pipeline.

## When to Use

- "Generate the annual report"
- "Create a PDF report for [year]"
- "Update and regenerate the report"
- Any annual report PDF work

## Architecture

**Production system**: WeasyPrint (Python) in `annual-reports/`

```
Supabase DB → assemble_content.py → JSON → generate_pdf.py → PDF
                                                    ↓
                                            validate_pdf.py → QA report
```

Other PDF systems in the repo are legacy/experimental:
- `web-platform/scripts/generate-annual-report-pdf.py` (ReportLab v1 - legacy)
- `web-platform/scripts/generate-annual-report-v2.py` (ReportLab v2 - legacy)
- `Skills/picc-annual-report/` (WeasyPrint POC - superseded)
- `.claude/skills/pdf-report-generator/` (Playwright-based - alternative approach)

**Always use the `annual-reports/` pipeline for production PDFs.**

## Full Pipeline

### Step 1: Validate Data
```bash
cd annual-reports/scripts
python3 validate_data.py --year 2025
```

If validation fails, fix data issues before proceeding. Use `/data-validate` skill for guidance.

### Step 2: Assemble Content
```bash
python3 assemble_content.py --year 2025 --output ../output/report-2025-assembled.json
```

Options:
- `--all-published`: Include all published stories from the fiscal year period (not just those flagged `annual_report_eligible`)

Review the assembled JSON for completeness:
- Leadership messages populated (not placeholders)
- Stories have content and images
- Financial data present
- Board members and partners listed

### Step 3: Generate PDF
```bash
python3 generate_pdf.py --input ../output/report-2025-assembled.json
```

Options:
- `--print-ready`: Generate print-ready PDF with 3mm bleeds and crop marks
- `--no-html`: Skip saving the HTML preview
- `--output PATH`: Custom output path

Output:
- `output/picc-annual-report-2025.pdf` (screen version)
- `output/picc-annual-report-2025.html` (preview)
- `output/picc-annual-report-2025-PRINT.pdf` (print version, if `--print-ready`)

### Step 4: Validate PDF
```bash
python3 validate_pdf.py --input ../output/picc-annual-report-2025.pdf
```

Checks:
- PDF opens and has expected page count
- File size is reasonable (not empty, not bloated)
- All expected sections present
- No missing image placeholders

### Step 5: Report Results

Show the user:
- PDF file path and size
- Page count
- Validation results
- Any warnings (missing images, placeholder text)
- HTML preview path for quick review

## Template Customization

- **Layout**: `templates/annual-report.html` (Jinja2)
- **Brand colors**: `templates/styles/picc-brand.css`
- **Page layout**: `templates/styles/report-layout.css`
- **Images**: `assets/photos/` directory

## Troubleshooting

| Issue | Solution |
|-------|---------|
| WeasyPrint not installed | `pip install weasyprint jinja2 pypdf --break-system-packages` |
| Fonts not rendering | Install Permanent Marker font or update CSS fallbacks |
| Images missing | Check `assets/` directory, ensure paths in JSON are correct |
| Blank pages | Check `@page` CSS rules for margin/size conflicts |
| Financial data missing | Run `validate_data.py` and check `annual_financials` table |

## Dependencies

```bash
# Python packages
pip install weasyprint jinja2 pypdf supabase python-dotenv --break-system-packages

# System dependencies (macOS)
brew install pango cairo libffi
```
