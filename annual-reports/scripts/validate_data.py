#!/usr/bin/env python3
"""
Validate that the Supabase database is ready for annual report generation.

Checks for:
- Required tables and their data
- Annual report eligible stories
- Financial data for current and previous year
- Staff statistics for past 3 years
- Board members and partners
- Leadership messages

Exit codes:
  0 = All checks passed
  1 = Issues found
"""

import argparse
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

from dotenv import load_dotenv

try:
    from supabase import create_client
except ImportError:
    print("❌ Missing dependency: supabase")
    print("   Install with: pip install supabase python-dotenv")
    sys.exit(1)


class Colors:
    """ANSI color codes for terminal output."""
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    
    # Foreground colors
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    WHITE = "\033[37m"
    
    # Background colors
    BG_RED = "\033[41m"
    BG_GREEN = "\033[42m"
    BG_YELLOW = "\033[43m"


def colorize(text: str, color: str, bold: bool = False) -> str:
    """Apply color to text."""
    prefix = Colors.BOLD if bold else ""
    return f"{prefix}{color}{text}{Colors.RESET}"


class DataValidator:
    """Validates Supabase database readiness for annual report generation."""
    
    def __init__(self, year: int):
        """
        Initialize validator.
        
        Args:
            year: The year to validate for
        """
        self.year = year
        self.client = None
        self.checks: List[Tuple[str, bool, Optional[str]]] = []
        self.issues: List[str] = []
        self.suggestions: List[str] = []
        
    def connect(self) -> bool:
        """Connect to Supabase."""
        load_dotenv()
        
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not key:
            key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        
        if not url or not key:
            self.add_issue(
                "Missing Supabase credentials",
                "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables"
            )
            return False
        
        try:
            self.client = create_client(url, key)
            return True
        except Exception as e:
            self.add_issue(f"Failed to connect to Supabase: {str(e)}", None)
            return False
    
    def add_check(self, name: str, passed: bool, details: Optional[str] = None):
        """Record a check result."""
        self.checks.append((name, passed, details))
    
    def add_issue(self, issue: str, suggestion: Optional[str] = None):
        """Record an issue with optional suggestion."""
        self.issues.append(issue)
        if suggestion:
            self.suggestions.append(f"{issue}: {suggestion}")
    
    def check_table_exists(self, table_name: str) -> bool:
        """Check if a table exists and has records."""
        try:
            response = self.client.table(table_name).select(
                "*", count="exact"
            ).limit(1).execute()
            
            count = response.count or len(response.data or [])
            details = f"{count} records"
            
            if count > 0:
                self.add_check(f"Table: {table_name}", True, details)
                return True
            else:
                self.add_check(f"Table: {table_name}", False, "No data")
                self.add_issue(
                    f"Table '{table_name}' exists but has no records",
                    f"Populate the {table_name} table with data"
                )
                return False
        except Exception as e:
            self.add_check(f"Table: {table_name}", False, str(e))
            self.add_issue(
                f"Cannot access table '{table_name}': {str(e)}",
                f"Ensure the {table_name} table exists and you have access"
            )
            return False
    
    def check_annual_report_stories(self) -> Tuple[bool, int]:
        """Check for stories marked as annual_report_eligible."""
        try:
            response = self.client.table("stories").select(
                "*", count="exact"
            ).eq("annual_report_eligible", True).execute()
            
            count = response.count or len(response.data or [])
            details = f"{count} eligible stories"
            
            if count >= 5:
                self.add_check("Annual report eligible stories (≥5)", True, details)
                return True, count
            else:
                self.add_check(
                    "Annual report eligible stories (≥5)",
                    False,
                    f"Only {count} found"
                )
                self.add_issue(
                    f"Only {count} stories marked as annual_report_eligible (need ≥5)",
                    f"Mark at least {5 - count} more stories with annual_report_eligible=true"
                )
                return False, count
        except Exception as e:
            self.add_check("Annual report eligible stories", False, str(e))
            self.add_issue(
                f"Cannot query annual_report_eligible stories: {str(e)}",
                "Ensure the 'annual_report_eligible' column exists in stories table"
            )
            return False, 0
    
    def check_financial_data(self) -> bool:
        """Check financial data for current and previous year."""
        try:
            response = self.client.table("financial_data").select(
                "*", count="exact"
            ).execute()
            
            if not response.data:
                self.add_check("Financial data", False, "No records")
                self.add_issue(
                    "No financial data found",
                    f"Add financial data for years {self.year - 1} and {self.year}"
                )
                return False
            
            years_found = set()
            for record in response.data:
                if "year" in record:
                    years_found.add(record["year"])
            
            required_years = {self.year - 1, self.year}
            missing_years = required_years - years_found
            
            if not missing_years:
                details = f"Years {self.year - 1}, {self.year} ✓"
                self.add_check("Financial data (current + previous year)", True, details)
                return True
            else:
                self.add_check(
                    "Financial data (current + previous year)",
                    False,
                    f"Missing: {missing_years}"
                )
                years_str = ", ".join(map(str, missing_years))
                self.add_issue(
                    f"Missing financial data for year(s): {years_str}",
                    f"Add financial records for year(s) {years_str}"
                )
                return False
        except Exception as e:
            self.add_check("Financial data", False, str(e))
            self.add_issue(
                f"Cannot query financial_data table: {str(e)}",
                "Ensure the financial_data table exists and has a 'year' column"
            )
            return False
    
    def check_staff_statistics(self) -> bool:
        """Check staff statistics for past 3 years."""
        try:
            response = self.client.table("staff_statistics").select(
                "*", count="exact"
            ).execute()
            
            if not response.data:
                self.add_check("Staff statistics", False, "No records")
                required_years = [self.year - 2, self.year - 1, self.year]
                self.add_issue(
                    "No staff statistics found",
                    f"Add staff statistics for years {required_years}"
                )
                return False
            
            years_found = set()
            for record in response.data:
                if "year" in record:
                    years_found.add(record["year"])
            
            required_years = {self.year - 2, self.year - 1, self.year}
            missing_years = required_years - years_found
            
            if not missing_years:
                years_str = f"{self.year - 2}, {self.year - 1}, {self.year}"
                self.add_check(
                    "Staff statistics (past 3 years)",
                    True,
                    f"Years {years_str} ✓"
                )
                return True
            else:
                self.add_check(
                    "Staff statistics (past 3 years)",
                    False,
                    f"Missing: {missing_years}"
                )
                years_str = ", ".join(map(str, missing_years))
                self.add_issue(
                    f"Missing staff statistics for year(s): {years_str}",
                    f"Add staff statistics for year(s) {years_str}"
                )
                return False
        except Exception as e:
            self.add_check("Staff statistics", False, str(e))
            self.add_issue(
                f"Cannot query staff_statistics table: {str(e)}",
                "Ensure the staff_statistics table exists and has a 'year' column"
            )
            return False
    
    def check_innovation_projects(self) -> Tuple[bool, int]:
        """Check for innovation projects with linked immersive stories."""
        try:
            response = self.client.table("projects").select(
                "*", count="exact"
            ).eq("project_type", "innovation").execute()

            count = response.count or len(response.data or [])

            if count == 0:
                self.add_check("Innovation projects", False, "None found")
                self.add_issue(
                    "No innovation projects found",
                    "Add projects with project_type='innovation' to the projects table"
                )
                return False, 0

            # Check how many have linked immersive stories
            stories_linked = 0
            for proj in (response.data or []):
                try:
                    story_resp = self.client.table("immersive_stories").select(
                        "id", count="exact"
                    ).eq("project_id", proj["id"]).eq("status", "published").execute()
                    if story_resp.data:
                        stories_linked += 1
                except Exception:
                    pass

            if stories_linked >= 3:
                self.add_check(
                    "Innovation projects with stories (≥3)",
                    True,
                    f"{count} projects, {stories_linked} with stories"
                )
                return True, count
            else:
                self.add_check(
                    "Innovation projects with stories (≥3)",
                    False,
                    f"{count} projects, only {stories_linked} with stories"
                )
                self.add_issue(
                    f"Only {stories_linked} innovation projects have linked immersive stories (need ≥3)",
                    "Create and publish immersive stories linked to innovation projects"
                )
                return False, count

        except Exception as e:
            self.add_check("Innovation projects", False, str(e))
            self.add_issue(
                f"Cannot query innovation projects: {str(e)}",
                "Ensure the 'projects' table exists with a 'project_type' column"
            )
            return False, 0

    def check_leadership_messages(self) -> Tuple[bool, int]:
        """Check for leadership messages (stories with story_type='leadership_message')."""
        try:
            response = self.client.table("stories").select(
                "*", count="exact"
            ).eq("story_type", "leadership_message").execute()
            
            count = response.count or len(response.data or [])
            
            if count >= 1:
                self.add_check("Leadership messages", True, f"{count} found")
                return True, count
            else:
                self.add_check("Leadership messages", False, "None found")
                self.add_issue(
                    "No leadership messages found",
                    "Create at least one story with story_type='leadership_message'"
                )
                return False, count
        except Exception as e:
            self.add_check("Leadership messages", False, str(e))
            self.add_issue(
                f"Cannot query leadership messages: {str(e)}",
                "Ensure the 'story_type' column exists in stories table"
            )
            return False, 0
    
    def validate(self) -> bool:
        """Run all validation checks."""
        print(f"\n{colorize('=' * 70, Colors.CYAN, bold=True)}")
        print(f"{colorize(f'Database Validation for {self.year} Annual Report', Colors.CYAN, bold=True)}")
        print(f"{colorize('=' * 70, Colors.CYAN, bold=True)}\n")
        
        # Connect to database
        if not self.connect():
            print(f"{colorize('❌ Connection Failed', Colors.RED, bold=True)}\n")
            self.print_results()
            return False
        
        print(f"{colorize('Connected to Supabase', Colors.GREEN)} ✓\n")
        
        # Check required tables
        print(f"{colorize('Checking Required Tables:', Colors.BLUE, bold=True)}")
        print("-" * 70)
        
        tables_ok = True
        required_tables = ["profiles", "stories", "board_members", "partners"]
        
        for table in required_tables:
            if not self.check_table_exists(table):
                tables_ok = False
        
        print()
        
        # Check annual report specific data
        print(f"{colorize('Checking Annual Report Data:', Colors.BLUE, bold=True)}")
        print("-" * 70)
        
        stories_ok, story_count = self.check_annual_report_stories()
        financial_ok = self.check_financial_data()
        staff_ok = self.check_staff_statistics()
        leadership_ok, leadership_count = self.check_leadership_messages()
        innovation_ok, innovation_count = self.check_innovation_projects()
        
        print()
        
        # Summary
        all_passed = (
            tables_ok and stories_ok and financial_ok and
            staff_ok and leadership_ok
        )
        
        self.print_results()
        
        return all_passed
    
    def print_results(self):
        """Print formatted results."""
        print(f"\n{colorize('Validation Results:', Colors.BOLD, bold=True)}")
        print("-" * 70)
        
        for name, passed, details in self.checks:
            icon = colorize("✅", Colors.GREEN, bold=True)
            if not passed:
                icon = colorize("❌", Colors.RED, bold=True)
            
            status_text = name
            if details:
                status_text = f"{name:<45} {colorize(details, Colors.DIM)}"
            
            print(f"  {icon}  {status_text}")
        
        print()
        
        if self.issues:
            print(f"{colorize('Issues Found:', Colors.RED, bold=True)}")
            print("-" * 70)
            for i, issue in enumerate(self.issues, 1):
                print(f"  {colorize(str(i) + '.', Colors.YELLOW, bold=True)} {colorize(issue, Colors.RED)}")
            print()
        
        if self.suggestions:
            print(f"{colorize('Suggested Actions:', Colors.YELLOW, bold=True)}")
            print("-" * 70)
            for i, suggestion in enumerate(self.suggestions, 1):
                parts = suggestion.split(": ", 1)
                if len(parts) == 2:
                    action = colorize(parts[1], Colors.YELLOW)
                    print(f"  {colorize(str(i) + '.', Colors.MAGENTA, bold=True)} {action}")
                else:
                    print(f"  {colorize(str(i) + '.', Colors.MAGENTA, bold=True)} {suggestion}")
            print()
        
        # Final status
        if self.issues:
            status = colorize("READY", Colors.RED, bold=True)
            status = f"{colorize('NOT ', Colors.RED, bold=True)}{status}"
            print(f"{colorize('Status:', Colors.BOLD, bold=True)} {status}")
            print(f"{colorize(f'Found {len(self.issues)} issue(s)', Colors.RED)}\n")
        else:
            status = colorize("READY ✓", Colors.GREEN, bold=True)
            print(f"{colorize('Status:', Colors.BOLD, bold=True)} {status}")
            print(f"{colorize('All checks passed!', Colors.GREEN)}\n")
        
        print(f"{colorize('=' * 70, Colors.CYAN, bold=True)}\n")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Validate Supabase database for annual report generation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python validate_data.py                    # Check current year
  python validate_data.py --year 2024        # Check specific year
        """
    )
    
    current_year = datetime.now().year
    parser.add_argument(
        "--year",
        type=int,
        default=current_year,
        help=f"Year to validate for (default: {current_year})"
    )
    
    args = parser.parse_args()
    
    validator = DataValidator(args.year)
    all_passed = validator.validate()
    
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
