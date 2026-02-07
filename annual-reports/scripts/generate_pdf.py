#!/usr/bin/env python3
"""
PICC Annual Report - PDF Generation Script

Generates branded PDF from assembled JSON content using WeasyPrint.

Usage:
    python generate_pdf.py --input ../output/report-2025-assembled.json --output ../output/picc-annual-report-2025.pdf

Requirements:
    pip install weasyprint jinja2 pypdf --break-system-packages

Note: WeasyPrint requires system dependencies:
    # macOS
    brew install pango cairo libffi

    # Ubuntu/Debian
    sudo apt-get install python3-cffi python3-brotli libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0
"""

import os
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional

# Try imports with helpful messages
try:
    from jinja2 import Environment, FileSystemLoader, select_autoescape
except ImportError:
    print("Jinja2 not installed. Run: pip install jinja2 --break-system-packages")
    exit(1)

try:
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
except ImportError:
    print("WeasyPrint not installed. Run: pip install weasyprint --break-system-packages")
    print("Also ensure system dependencies are installed (pango, cairo)")
    exit(1)


# Paths
SCRIPT_DIR = Path(__file__).parent
TEMPLATES_DIR = SCRIPT_DIR.parent / "templates"
STYLES_DIR = TEMPLATES_DIR / "styles"
OUTPUT_DIR = SCRIPT_DIR.parent / "output"
ASSETS_DIR = SCRIPT_DIR.parent / "assets"


def format_number(value: int | float) -> str:
    """Format number with thousands separator."""
    if isinstance(value, float):
        return f"{value:,.2f}"
    return f"{value:,}"


def setup_jinja_env() -> Environment:
    """Configure Jinja2 environment with custom filters."""

    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=select_autoescape(['html', 'xml'])
    )

    # Add custom filters
    env.filters['format_number'] = format_number

    return env


def load_report_data(input_path: Path) -> dict:
    """Load assembled report content from JSON file."""

    with open(input_path) as f:
        return json.load(f)


def generate_html(data: dict, template_name: str = "annual-report.html") -> str:
    """Generate HTML from Jinja2 template with report data."""

    env = setup_jinja_env()
    template = env.get_template(template_name)

    return template.render(**data)


def generate_pdf(
    html_content: str,
    output_path: Path,
    base_url: Optional[str] = None
) -> Path:
    """Convert HTML to PDF with PICC branding styles."""

    font_config = FontConfiguration()

    # Load stylesheets
    stylesheets = [
        CSS(STYLES_DIR / "picc-brand.css", font_config=font_config),
        CSS(STYLES_DIR / "report-layout.css", font_config=font_config),
    ]

    # Check for print overrides
    print_css = STYLES_DIR / "print-overrides.css"
    if print_css.exists():
        stylesheets.append(CSS(print_css, font_config=font_config))

    # Set base URL for resolving relative paths (images, etc.)
    if not base_url:
        base_url = str(ASSETS_DIR)

    # Generate PDF
    html = HTML(string=html_content, base_url=base_url)

    html.write_pdf(
        output_path,
        stylesheets=stylesheets,
        font_config=font_config,
        optimize_images=True,
        jpeg_quality=85,
    )

    return output_path


def add_pdf_metadata(pdf_path: Path, metadata: dict) -> None:
    """Add metadata to the generated PDF."""

    try:
        from pypdf import PdfReader, PdfWriter
    except ImportError:
        print("pypdf not installed, skipping metadata. Run: pip install pypdf --break-system-packages")
        return

    reader = PdfReader(pdf_path)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    writer.add_metadata({
        '/Title': metadata.get('title', 'PICC Annual Report'),
        '/Author': 'Palm Island Community Company',
        '/Subject': metadata.get('subject', 'Annual Report'),
        '/Creator': 'PICC Report Generator',
        '/Producer': 'WeasyPrint + pypdf',
        '/CreationDate': datetime.now().strftime("D:%Y%m%d%H%M%S"),
        '/Keywords': 'Palm Island, PICC, Annual Report, Indigenous, Community',
    })

    with open(pdf_path, 'wb') as f:
        writer.write(f)


def generate_report(
    input_path: Path,
    output_path: Optional[Path] = None,
    save_html: bool = True
) -> Path:
    """
    Main generation function - orchestrates the full pipeline.

    Args:
        input_path: Path to assembled JSON content
        output_path: Path for output PDF (optional, derived from input if not provided)
        save_html: Whether to save the intermediate HTML for preview/debugging

    Returns:
        Path to generated PDF
    """

    print(f"Generating PICC Annual Report PDF...")
    print(f"  Input: {input_path}")

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load content
    print("  Loading assembled content...")
    data = load_report_data(input_path)

    year = data.get('year', datetime.now().year)

    # Generate output path if not provided
    if not output_path:
        output_path = OUTPUT_DIR / f"picc-annual-report-{year}.pdf"

    # Generate HTML
    print("  Generating HTML from template...")
    html_content = generate_html(data)

    # Save HTML for preview
    if save_html:
        html_path = output_path.with_suffix('.html')
        with open(html_path, 'w') as f:
            f.write(html_content)
        print(f"  HTML preview saved: {html_path}")

    # Generate PDF
    print("  Converting to PDF (this may take a moment)...")
    generate_pdf(html_content, output_path)

    # Add metadata
    print("  Adding PDF metadata...")
    add_pdf_metadata(output_path, {
        'title': f"Palm Island Community Company Annual Report {year}",
        'subject': f"Annual Report for financial year {year}",
    })

    print(f"\n✅ PDF generated successfully!")
    print(f"   Output: {output_path}")
    print(f"   Size: {output_path.stat().st_size / 1024:.1f} KB")

    return output_path


def generate_print_ready_pdf(
    input_path: Path,
    output_path: Optional[Path] = None
) -> Path:
    """
    Generate print-ready PDF with bleeds and crop marks.

    For professional printing, this adds:
    - 3mm bleed on all edges
    - Crop marks
    - Higher resolution settings
    """

    print("Generating print-ready PDF with bleeds...")

    # Load content
    data = load_report_data(input_path)
    year = data.get('year', datetime.now().year)

    if not output_path:
        output_path = OUTPUT_DIR / f"picc-annual-report-{year}-PRINT.pdf"

    # Generate HTML
    html_content = generate_html(data)

    # Additional print CSS
    print_css = CSS(string="""
        @page {
            size: 216mm 303mm;  /* A4 + 3mm bleed each side */
            margin: 0;
            marks: crop cross;
            bleed: 3mm;
        }

        .page {
            /* Extend backgrounds into bleed area */
            padding: 18mm;  /* 15mm content margin + 3mm bleed */
        }

        /* Ensure images extend to bleed */
        .cover-photo,
        .story-featured-image {
            margin: -3mm;
        }
    """)

    font_config = FontConfiguration()

    stylesheets = [
        CSS(STYLES_DIR / "picc-brand.css", font_config=font_config),
        CSS(STYLES_DIR / "report-layout.css", font_config=font_config),
        print_css,
    ]

    html = HTML(string=html_content, base_url=str(ASSETS_DIR))
    html.write_pdf(
        output_path,
        stylesheets=stylesheets,
        font_config=font_config,
        optimize_images=False,  # Keep full resolution for print
        jpeg_quality=100,
    )

    print(f"✅ Print-ready PDF: {output_path}")
    return output_path


def main():
    parser = argparse.ArgumentParser(
        description="Generate PICC Annual Report PDF from assembled content"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        required=True,
        help="Path to assembled JSON content file"
    )
    parser.add_argument(
        "--output", "-o",
        type=str,
        default=None,
        help="Output PDF path (optional)"
    )
    parser.add_argument(
        "--print-ready",
        action="store_true",
        help="Generate print-ready PDF with bleeds"
    )
    parser.add_argument(
        "--no-html",
        action="store_true",
        help="Don't save intermediate HTML file"
    )

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output) if args.output else None

    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        exit(1)

    if args.print_ready:
        generate_print_ready_pdf(input_path, output_path)
    else:
        generate_report(input_path, output_path, save_html=not args.no_html)


if __name__ == "__main__":
    main()
