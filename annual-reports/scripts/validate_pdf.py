#!/usr/bin/env python3
"""
PICC Annual Report - PDF Validation Script

Validates a generated PDF report for quality issues:
- File exists and is readable
- Has expected page count range
- File size is reasonable
- PDF metadata is present
- No blank pages (basic check)
- Expected sections are present in text

Usage:
    python validate_pdf.py --input ../output/picc-annual-report-2025.pdf

Requirements:
    pip install pypdf --break-system-packages
"""

import argparse
import sys
from pathlib import Path
from typing import List, Tuple

try:
    from pypdf import PdfReader
except ImportError:
    print("pypdf not installed. Run: pip install pypdf --break-system-packages")
    sys.exit(1)


class Colors:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    CYAN = "\033[36m"
    DIM = "\033[2m"


def colorize(text: str, color: str, bold: bool = False) -> str:
    prefix = Colors.BOLD if bold else ""
    return f"{prefix}{color}{text}{Colors.RESET}"


class PDFValidator:
    """Validates a generated PICC annual report PDF."""

    # Expected sections that should appear in the text
    EXPECTED_SECTIONS = [
        "Annual Report",
        "Palm Island Community Company",
    ]

    # Optional sections - warn if missing but don't fail
    OPTIONAL_SECTIONS = [
        "Acknowledgement",
        "Chair",
        "CEO",
        "Financial",
        "Board",
        "Partners",
    ]

    MIN_PAGES = 8
    MAX_PAGES = 120
    MIN_SIZE_KB = 100
    MAX_SIZE_MB = 100

    def __init__(self, pdf_path: Path):
        self.pdf_path = pdf_path
        self.checks: List[Tuple[str, bool, str]] = []
        self.warnings: List[str] = []
        self.reader = None

    def add_check(self, name: str, passed: bool, details: str = ""):
        self.checks.append((name, passed, details))

    def validate(self) -> bool:
        print(f"\n{colorize('=' * 60, Colors.CYAN, bold=True)}")
        print(f"{colorize('PDF Validation Report', Colors.CYAN, bold=True)}")
        print(f"{colorize('=' * 60, Colors.CYAN, bold=True)}\n")
        print(f"File: {self.pdf_path}\n")

        # Check file exists
        if not self.pdf_path.exists():
            self.add_check("File exists", False, "File not found")
            self.print_results()
            return False

        self.add_check("File exists", True)

        # Check file size
        size_bytes = self.pdf_path.stat().st_size
        size_kb = size_bytes / 1024
        size_mb = size_bytes / (1024 * 1024)

        if size_kb < self.MIN_SIZE_KB:
            self.add_check("File size", False, f"{size_kb:.1f} KB (too small, likely empty)")
        elif size_mb > self.MAX_SIZE_MB:
            self.add_check("File size", False, f"{size_mb:.1f} MB (too large, may have unoptimized images)")
        else:
            self.add_check("File size", True, f"{size_mb:.1f} MB")

        # Try to read PDF
        try:
            self.reader = PdfReader(self.pdf_path)
            self.add_check("PDF readable", True)
        except Exception as e:
            self.add_check("PDF readable", False, str(e))
            self.print_results()
            return False

        # Check page count
        num_pages = len(self.reader.pages)
        if num_pages < self.MIN_PAGES:
            self.add_check("Page count", False, f"{num_pages} pages (expected >= {self.MIN_PAGES})")
        elif num_pages > self.MAX_PAGES:
            self.add_check("Page count", False, f"{num_pages} pages (expected <= {self.MAX_PAGES})")
        else:
            self.add_check("Page count", True, f"{num_pages} pages")

        # Check metadata
        meta = self.reader.metadata
        if meta:
            title = meta.get('/Title', '')
            author = meta.get('/Author', '')
            if title:
                self.add_check("PDF title", True, title)
            else:
                self.add_check("PDF title", False, "No title set")

            if author:
                self.add_check("PDF author", True, author)
            else:
                self.warnings.append("No author metadata set")
        else:
            self.add_check("PDF metadata", False, "No metadata found")

        # Extract all text for content checks
        all_text = ""
        blank_pages = []

        for i, page in enumerate(self.reader.pages):
            try:
                text = page.extract_text() or ""
                all_text += text + "\n"

                # Check for blank pages (less than 10 chars of content)
                if len(text.strip()) < 10 and i > 0:  # Skip cover page
                    blank_pages.append(i + 1)
            except Exception:
                blank_pages.append(i + 1)

        # Report blank pages
        if blank_pages:
            if len(blank_pages) <= 3:
                self.warnings.append(f"Potentially blank pages: {blank_pages}")
            else:
                self.add_check("Blank pages", False, f"{len(blank_pages)} blank pages found: {blank_pages[:5]}...")

        # Check for expected sections in text
        for section in self.EXPECTED_SECTIONS:
            if section.lower() in all_text.lower():
                self.add_check(f"Section: {section}", True)
            else:
                self.add_check(f"Section: {section}", False, "Not found in PDF text")

        # Check optional sections
        for section in self.OPTIONAL_SECTIONS:
            if section.lower() not in all_text.lower():
                self.warnings.append(f"Optional section '{section}' not found in text")

        # Check for placeholder text
        placeholders = ["[to be added]", "[placeholder]", "[insert", "lorem ipsum"]
        found_placeholders = []
        for placeholder in placeholders:
            if placeholder.lower() in all_text.lower():
                found_placeholders.append(placeholder)

        if found_placeholders:
            self.add_check("No placeholder text", False, f"Found: {', '.join(found_placeholders)}")
        else:
            self.add_check("No placeholder text", True)

        # Check for broken image references (common pattern)
        if "missing image" in all_text.lower() or "[image]" in all_text.lower():
            self.add_check("No missing images", False, "Found missing image references")
        else:
            self.add_check("No missing images", True)

        self.print_results()

        # Return True if no critical failures
        return all(passed for _, passed, _ in self.checks)

    def print_results(self):
        print(f"\n{colorize('Validation Results:', Colors.BOLD, bold=True)}")
        print("-" * 60)

        passed = 0
        failed = 0

        for name, check_passed, details in self.checks:
            icon = colorize("PASS", Colors.GREEN, bold=True) if check_passed else colorize("FAIL", Colors.RED, bold=True)
            detail_str = f"  {colorize(details, Colors.DIM)}" if details else ""
            print(f"  [{icon}]  {name}{detail_str}")

            if check_passed:
                passed += 1
            else:
                failed += 1

        if self.warnings:
            print(f"\n{colorize('Warnings:', Colors.YELLOW, bold=True)}")
            for warning in self.warnings:
                print(f"  {colorize('WARN', Colors.YELLOW)}  {warning}")

        print(f"\n{colorize('Summary:', Colors.BOLD, bold=True)}")
        print(f"  Passed: {colorize(str(passed), Colors.GREEN, bold=True)}")
        print(f"  Failed: {colorize(str(failed), Colors.RED if failed else Colors.GREEN, bold=True)}")
        print(f"  Warnings: {colorize(str(len(self.warnings)), Colors.YELLOW)}")

        if failed == 0:
            print(f"\n{colorize('PDF VALIDATION PASSED', Colors.GREEN, bold=True)}")
        else:
            print(f"\n{colorize('PDF VALIDATION FAILED', Colors.RED, bold=True)}")
            print(f"{colorize(f'{failed} check(s) failed — review issues above', Colors.RED)}")

        print(f"\n{colorize('=' * 60, Colors.CYAN, bold=True)}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Validate a generated PICC annual report PDF"
    )
    parser.add_argument(
        "--input", "-i",
        type=str,
        required=True,
        help="Path to the PDF file to validate"
    )

    args = parser.parse_args()
    pdf_path = Path(args.input)

    validator = PDFValidator(pdf_path)
    passed = validator.validate()

    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
