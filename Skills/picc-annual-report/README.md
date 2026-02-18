# PICC Annual Report Design Skill

A reusable design system and PDF generation toolkit for Palm Island Community Company annual reports.

## Contents

| File | Description |
|------|-------------|
| `SKILL.md` | Complete design specification (colours, typography, layouts, templates) |
| `picc_report_generator.py` | Python module for programmatic PDF generation |

## Quick Start

### Using the Design Specs

Reference `SKILL.md` when designing in:
- Adobe InDesign
- Canva
- Microsoft Word
- Any design software

Key sections:
- **Colour Palette**: Hex codes for all brand colours
- **Typography**: Font choices and sizing
- **Page Layouts**: ASCII templates for each section type
- **Data Visualisation**: Table and chart styling

### Using the Python Generator

```python
from picc_report_generator import PICCReportGenerator

# Create a new report
report = PICCReportGenerator("Annual_Report_2024-25.pdf")

# Add pages
report.add_cover_page("2024-2025")
report.add_ceo_message("Rachel Atkinson", "Message text here...")
report.add_section_page("Corporate Governance", ["Content..."])
report.add_back_cover(
    address="61-73 Sturt Street\nTownsville QLD 4810",
    phone="07 4421 4300",
    website="www.picc.com.au",
    acn="640 793 728"
)

# Save
report.save()
```

### Dependencies

```bash
pip install reportlab pillow --break-system-packages
```

## Brand Colours (Quick Reference)

```
Ocean Blue:    #4A7C9B  (Primary)
Deep Teal:     #2D5A6B  (Secondary)
Lavender:      #9B7BB8  (Accent)
Soft Lilac:    #C4A8D4  (Waves)
```

## Based On

Design extracted from PICC 2023-24 Annual Report.

---

*Version 1.0 | January 2026*
