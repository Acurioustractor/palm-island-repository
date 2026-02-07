#!/usr/bin/env python3
"""
Interactive CLI for managing Palm Island annual report database tables.

This script provides an interactive command-line interface for populating
and managing the annual report database. It connects to Supabase and provides
subcommands for adding and listing data across various tables.

Usage:
    python manage_data.py --help
    python manage_data.py add-financial --year 2024 --revenue 1000000
    python manage_data.py list annual_financials --year 2024
    python manage_data.py add-staff --year 2024 --interactive
"""

import argparse
import os
import sys
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

from supabase import create_client, Client
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


class SupabaseManager:
    """Manages connections and operations with Supabase."""

    def __init__(self):
        """Initialize Supabase client using environment variables."""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")

        if not supabase_url or not supabase_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY environment variables are required. "
                "Please set them in your .env file."
            )

        self.client: Client = create_client(supabase_url, supabase_key)

    def add_financial(self, year: int, **kwargs) -> Dict[str, Any]:
        """
        Add or update annual financial data.

        Args:
            year: The fiscal year
            **kwargs: Financial fields (revenue, expenses, surplus, etc.)

        Returns:
            The inserted/updated record
        """
        data = {"year": year, **kwargs}

        # Check if record exists
        existing = self.client.table("annual_financials").select("*").eq("year", year).execute()

        if existing.data:
            # Update existing
            result = (
                self.client.table("annual_financials")
                .update(data)
                .eq("year", year)
                .execute()
            )
            print(f"Updated financial data for year {year}")
        else:
            # Insert new
            result = self.client.table("annual_financials").insert(data).execute()
            print(f"Added financial data for year {year}")

        return result.data[0] if result.data else None

    def add_staff(self, year: int, **kwargs) -> Dict[str, Any]:
        """
        Add or update staff statistics.

        Args:
            year: The fiscal year
            **kwargs: Staff fields (total_staff, full_time, part_time, volunteers, etc.)

        Returns:
            The inserted/updated record
        """
        data = {"year": year, **kwargs}

        existing = self.client.table("staff_statistics").select("*").eq("year", year).execute()

        if existing.data:
            result = (
                self.client.table("staff_statistics")
                .update(data)
                .eq("year", year)
                .execute()
            )
            print(f"Updated staff statistics for year {year}")
        else:
            result = self.client.table("staff_statistics").insert(data).execute()
            print(f"Added staff statistics for year {year}")

        return result.data[0] if result.data else None

    def add_board_member(self, name: str, title: str, **kwargs) -> Dict[str, Any]:
        """
        Add a board member.

        Args:
            name: Board member name
            title: Board member title/position
            **kwargs: Additional fields (bio, start_date, end_date, etc.)

        Returns:
            The inserted record
        """
        data = {"name": name, "title": title, **kwargs}
        result = self.client.table("board_members").insert(data).execute()
        print(f"Added board member: {name} ({title})")
        return result.data[0] if result.data else None

    def add_partner(self, name: str, category: str, **kwargs) -> Dict[str, Any]:
        """
        Add a partner organization.

        Args:
            name: Partner organization name
            category: Category/type of partnership
            **kwargs: Additional fields (contact_email, website, description, etc.)

        Returns:
            The inserted record
        """
        data = {"name": name, "category": category, **kwargs}
        result = self.client.table("partners").insert(data).execute()
        print(f"Added partner: {name} ({category})")
        return result.data[0] if result.data else None

    def add_service_metric(self, year: int, service_id: int, **kwargs) -> Dict[str, Any]:
        """
        Add service metrics for a year.

        Args:
            year: The fiscal year
            service_id: ID of the service
            **kwargs: Metric fields (beneficiaries, sessions, hours, etc.)

        Returns:
            The inserted/updated record
        """
        data = {"year": year, "service_id": service_id, **kwargs}

        existing = (
            self.client.table("service_metrics")
            .select("*")
            .eq("year", year)
            .eq("service_id", service_id)
            .execute()
        )

        if existing.data:
            result = (
                self.client.table("service_metrics")
                .update(data)
                .eq("year", year)
                .eq("service_id", service_id)
                .execute()
            )
            print(f"Updated metrics for service {service_id} in year {year}")
        else:
            result = self.client.table("service_metrics").insert(data).execute()
            print(f"Added metrics for service {service_id} in year {year}")

        return result.data[0] if result.data else None

    def mark_story_eligible(self, story_id: int) -> Dict[str, Any]:
        """
        Mark a story as eligible for annual report.

        Args:
            story_id: ID of the story

        Returns:
            The updated record
        """
        result = (
            self.client.table("stories")
            .update({"annual_report_eligible": True})
            .eq("id", story_id)
            .execute()
        )
        print(f"Marked story {story_id} as annual report eligible")
        return result.data[0] if result.data else None

    def list_table(
        self,
        table_name: str,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        List records from a table with optional filtering.

        Args:
            table_name: Name of the table to query
            filters: Dictionary of column:value filters to apply
            limit: Maximum number of records to return

        Returns:
            List of records
        """
        query = self.client.table(table_name).select("*").limit(limit)

        if filters:
            for column, value in filters.items():
                query = query.eq(column, value)

        result = query.execute()
        return result.data

    def get_services(self) -> List[Dict[str, Any]]:
        """Get list of available services."""
        result = self.client.table("services").select("id, name").execute()
        return result.data


def prompt_for_input(
    prompt: str,
    input_type: str = "str",
    required: bool = True,
    choices: Optional[List[str]] = None,
) -> Any:
    """
    Prompt user for input with type validation.

    Args:
        prompt: The prompt message
        input_type: Type of input ('str', 'int', 'float', 'bool', 'date')
        required: Whether input is required
        choices: List of valid choices for string inputs

    Returns:
        The validated user input
    """
    while True:
        user_input = input(f"{prompt}: ").strip()

        if not user_input:
            if required:
                print("This field is required.")
                continue
            return None

        try:
            if input_type == "int":
                return int(user_input)
            elif input_type == "float":
                return float(user_input)
            elif input_type == "bool":
                return user_input.lower() in ("yes", "y", "true", "1")
            elif input_type == "date":
                # Validate date format YYYY-MM-DD
                datetime.strptime(user_input, "%Y-%m-%d")
                return user_input
            elif input_type == "json":
                return json.loads(user_input)
            else:  # str
                if choices and user_input not in choices:
                    print(f"Please choose from: {', '.join(choices)}")
                    continue
                return user_input
        except (ValueError, json.JSONDecodeError) as e:
            print(f"Invalid input: {e}")
            continue


def interactive_financial_add(manager: SupabaseManager) -> None:
    """Interactive prompt for adding financial data."""
    print("\n--- Add Financial Data ---")
    year = prompt_for_input("Fiscal year", "int")
    revenue = prompt_for_input("Revenue (optional)", "float", required=False)
    expenses = prompt_for_input("Expenses (optional)", "float", required=False)
    surplus = prompt_for_input("Surplus/Deficit (optional)", "float", required=False)
    grants = prompt_for_input("Grants received (optional)", "float", required=False)
    donations = prompt_for_input("Donations (optional)", "float", required=False)
    notes = prompt_for_input("Notes (optional)", "str", required=False)

    kwargs = {}
    if revenue is not None:
        kwargs["revenue"] = revenue
    if expenses is not None:
        kwargs["expenses"] = expenses
    if surplus is not None:
        kwargs["surplus"] = surplus
    if grants is not None:
        kwargs["grants"] = grants
    if donations is not None:
        kwargs["donations"] = donations
    if notes:
        kwargs["notes"] = notes

    manager.add_financial(year, **kwargs)


def interactive_staff_add(manager: SupabaseManager) -> None:
    """Interactive prompt for adding staff statistics."""
    print("\n--- Add Staff Statistics ---")
    year = prompt_for_input("Fiscal year", "int")
    total_staff = prompt_for_input("Total staff (optional)", "int", required=False)
    full_time = prompt_for_input("Full-time staff (optional)", "int", required=False)
    part_time = prompt_for_input("Part-time staff (optional)", "int", required=False)
    volunteers = prompt_for_input("Number of volunteers (optional)", "int", required=False)
    volunteer_hours = prompt_for_input(
        "Total volunteer hours (optional)", "float", required=False
    )
    notes = prompt_for_input("Notes (optional)", "str", required=False)

    kwargs = {}
    if total_staff is not None:
        kwargs["total_staff"] = total_staff
    if full_time is not None:
        kwargs["full_time"] = full_time
    if part_time is not None:
        kwargs["part_time"] = part_time
    if volunteers is not None:
        kwargs["volunteers"] = volunteers
    if volunteer_hours is not None:
        kwargs["volunteer_hours"] = volunteer_hours
    if notes:
        kwargs["notes"] = notes

    manager.add_staff(year, **kwargs)


def interactive_board_member_add(manager: SupabaseManager) -> None:
    """Interactive prompt for adding board member."""
    print("\n--- Add Board Member ---")
    name = prompt_for_input("Name")
    title = prompt_for_input("Title/Position")
    bio = prompt_for_input("Bio (optional)", required=False)
    start_date = prompt_for_input("Start date (YYYY-MM-DD, optional)", "date", required=False)
    end_date = prompt_for_input("End date (YYYY-MM-DD, optional)", "date", required=False)

    kwargs = {}
    if bio:
        kwargs["bio"] = bio
    if start_date:
        kwargs["start_date"] = start_date
    if end_date:
        kwargs["end_date"] = end_date

    manager.add_board_member(name, title, **kwargs)


def interactive_partner_add(manager: SupabaseManager) -> None:
    """Interactive prompt for adding partner."""
    print("\n--- Add Partner Organization ---")
    name = prompt_for_input("Organization name")
    category = prompt_for_input("Category (e.g., 'Health', 'Education', 'Government')")
    contact_email = prompt_for_input("Contact email (optional)", required=False)
    website = prompt_for_input("Website (optional)", required=False)
    description = prompt_for_input("Description (optional)", required=False)

    kwargs = {}
    if contact_email:
        kwargs["contact_email"] = contact_email
    if website:
        kwargs["website"] = website
    if description:
        kwargs["description"] = description

    manager.add_partner(name, category, **kwargs)


def interactive_service_metric_add(manager: SupabaseManager) -> None:
    """Interactive prompt for adding service metrics."""
    print("\n--- Add Service Metrics ---")

    # Get available services
    services = manager.get_services()
    if not services:
        print("Error: No services found in database.")
        return

    print("\nAvailable services:")
    for service in services:
        print(f"  {service['id']}: {service['name']}")

    service_id = prompt_for_input("\nService ID", "int")
    year = prompt_for_input("Fiscal year", "int")
    beneficiaries = prompt_for_input("Beneficiaries (optional)", "int", required=False)
    sessions = prompt_for_input("Number of sessions (optional)", "int", required=False)
    hours = prompt_for_input("Total hours (optional)", "float", required=False)
    units_delivered = prompt_for_input("Units delivered (optional)", "int", required=False)
    notes = prompt_for_input("Notes (optional)", "str", required=False)

    kwargs = {}
    if beneficiaries is not None:
        kwargs["beneficiaries"] = beneficiaries
    if sessions is not None:
        kwargs["sessions"] = sessions
    if hours is not None:
        kwargs["hours"] = hours
    if units_delivered is not None:
        kwargs["units_delivered"] = units_delivered
    if notes:
        kwargs["notes"] = notes

    manager.add_service_metric(year, service_id, **kwargs)


def interactive_mark_story(manager: SupabaseManager) -> None:
    """Interactive prompt for marking story as annual report eligible."""
    print("\n--- Mark Story as Annual Report Eligible ---")
    story_id = prompt_for_input("Story ID", "int")
    manager.mark_story_eligible(story_id)


def interactive_list(manager: SupabaseManager) -> None:
    """Interactive prompt for listing table data."""
    print("\n--- List Table Data ---")

    tables = [
        "annual_financials",
        "staff_statistics",
        "board_members",
        "governance_achievements",
        "partners",
        "services",
        "service_metrics",
        "stories",
    ]

    print("Available tables:")
    for i, table in enumerate(tables, 1):
        print(f"  {i}. {table}")

    choice = prompt_for_input(
        f"Select table (1-{len(tables)})",
        "int",
        choices=[str(i) for i in range(1, len(tables) + 1)],
    )
    table_name = tables[choice - 1]

    # Ask for filters
    apply_filter = prompt_for_input("Apply filters? (yes/no)", "bool", required=False)
    filters = None

    if apply_filter:
        filters = {}
        while True:
            column = prompt_for_input("Filter column (or 'done' to finish)", "str", required=False)
            if not column or column.lower() == "done":
                break
            value = prompt_for_input(f"Value for {column}", "str", required=False)
            if value:
                filters[column] = value

    # List records
    records = manager.list_table(table_name, filters)

    if records:
        print(f"\n{len(records)} records found:")
        print("-" * 80)
        for record in records:
            print(json.dumps(record, indent=2))
            print("-" * 80)
    else:
        print("No records found.")


def setup_parser() -> argparse.ArgumentParser:
    """Set up command-line argument parser."""
    parser = argparse.ArgumentParser(
        description="Interactive CLI for managing Palm Island annual report database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python manage_data.py add-financial --year 2024 --revenue 1000000
  python manage_data.py add-financial --year 2024 --interactive
  python manage_data.py list annual_financials --year 2024
  python manage_data.py list board_members
  python manage_data.py add-staff --year 2024 --interactive
  python manage_data.py add-board-member --name "John Doe" --title "Chair"
  python manage_data.py add-partner --name "WHO" --category "Health"
  python manage_data.py mark-story --story-id 42
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # add-financial
    financial_parser = subparsers.add_parser("add-financial", help="Add/update financial data")
    financial_parser.add_argument("--year", type=int, required=True, help="Fiscal year")
    financial_parser.add_argument("--revenue", type=float, help="Revenue")
    financial_parser.add_argument("--expenses", type=float, help="Expenses")
    financial_parser.add_argument("--surplus", type=float, help="Surplus/Deficit")
    financial_parser.add_argument("--grants", type=float, help="Grants received")
    financial_parser.add_argument("--donations", type=float, help="Donations")
    financial_parser.add_argument("--notes", help="Notes")
    financial_parser.add_argument(
        "--interactive", action="store_true", help="Use interactive mode"
    )

    # add-staff
    staff_parser = subparsers.add_parser("add-staff", help="Add staff statistics")
    staff_parser.add_argument("--year", type=int, required=True, help="Fiscal year")
    staff_parser.add_argument("--total-staff", type=int, help="Total staff")
    staff_parser.add_argument("--full-time", type=int, help="Full-time staff")
    staff_parser.add_argument("--part-time", type=int, help="Part-time staff")
    staff_parser.add_argument("--volunteers", type=int, help="Number of volunteers")
    staff_parser.add_argument("--volunteer-hours", type=float, help="Total volunteer hours")
    staff_parser.add_argument("--notes", help="Notes")
    staff_parser.add_argument(
        "--interactive", action="store_true", help="Use interactive mode"
    )

    # add-board-member
    board_parser = subparsers.add_parser("add-board-member", help="Add board member")
    board_parser.add_argument("--name", required=True, help="Board member name")
    board_parser.add_argument("--title", required=True, help="Board member title")
    board_parser.add_argument("--bio", help="Bio")
    board_parser.add_argument("--start-date", help="Start date (YYYY-MM-DD)")
    board_parser.add_argument("--end-date", help="End date (YYYY-MM-DD)")
    board_parser.add_argument(
        "--interactive", action="store_true", help="Use interactive mode"
    )

    # add-partner
    partner_parser = subparsers.add_parser("add-partner", help="Add partner organization")
    partner_parser.add_argument("--name", required=True, help="Organization name")
    partner_parser.add_argument("--category", required=True, help="Partnership category")
    partner_parser.add_argument("--contact-email", help="Contact email")
    partner_parser.add_argument("--website", help="Website URL")
    partner_parser.add_argument("--description", help="Description")
    partner_parser.add_argument(
        "--interactive", action="store_true", help="Use interactive mode"
    )

    # add-service-metric
    metric_parser = subparsers.add_parser("add-service-metric", help="Add service metrics")
    metric_parser.add_argument("--year", type=int, required=True, help="Fiscal year")
    metric_parser.add_argument("--service-id", type=int, required=True, help="Service ID")
    metric_parser.add_argument("--beneficiaries", type=int, help="Number of beneficiaries")
    metric_parser.add_argument("--sessions", type=int, help="Number of sessions")
    metric_parser.add_argument("--hours", type=float, help="Total hours")
    metric_parser.add_argument("--units-delivered", type=int, help="Units delivered")
    metric_parser.add_argument("--notes", help="Notes")
    metric_parser.add_argument(
        "--interactive", action="store_true", help="Use interactive mode"
    )

    # list
    list_parser = subparsers.add_parser("list", help="List table data")
    list_parser.add_argument("table", help="Table name to list")
    list_parser.add_argument("--year", type=int, help="Filter by year")
    list_parser.add_argument("--service-id", type=int, help="Filter by service ID")
    list_parser.add_argument("--limit", type=int, default=100, help="Max records to return")

    # mark-story
    story_parser = subparsers.add_parser("mark-story", help="Mark story as annual report eligible")
    story_parser.add_argument("--story-id", type=int, required=True, help="Story ID")

    return parser


def main():
    """Main entry point."""
    parser = setup_parser()
    args = parser.parse_args()

    try:
        manager = SupabaseManager()
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    if not args.command:
        parser.print_help()
        sys.exit(0)

    # Handle commands
    if args.command == "add-financial":
        if args.interactive:
            interactive_financial_add(manager)
        else:
            kwargs = {}
            if args.revenue is not None:
                kwargs["revenue"] = args.revenue
            if args.expenses is not None:
                kwargs["expenses"] = args.expenses
            if args.surplus is not None:
                kwargs["surplus"] = args.surplus
            if args.grants is not None:
                kwargs["grants"] = args.grants
            if args.donations is not None:
                kwargs["donations"] = args.donations
            if args.notes:
                kwargs["notes"] = args.notes
            manager.add_financial(args.year, **kwargs)

    elif args.command == "add-staff":
        if args.interactive:
            interactive_staff_add(manager)
        else:
            kwargs = {}
            if args.total_staff is not None:
                kwargs["total_staff"] = args.total_staff
            if args.full_time is not None:
                kwargs["full_time"] = args.full_time
            if args.part_time is not None:
                kwargs["part_time"] = args.part_time
            if args.volunteers is not None:
                kwargs["volunteers"] = args.volunteers
            if args.volunteer_hours is not None:
                kwargs["volunteer_hours"] = args.volunteer_hours
            if args.notes:
                kwargs["notes"] = args.notes
            manager.add_staff(args.year, **kwargs)

    elif args.command == "add-board-member":
        if args.interactive:
            interactive_board_member_add(manager)
        else:
            kwargs = {}
            if args.bio:
                kwargs["bio"] = args.bio
            if args.start_date:
                kwargs["start_date"] = args.start_date
            if args.end_date:
                kwargs["end_date"] = args.end_date
            manager.add_board_member(args.name, args.title, **kwargs)

    elif args.command == "add-partner":
        if args.interactive:
            interactive_partner_add(manager)
        else:
            kwargs = {}
            if args.contact_email:
                kwargs["contact_email"] = args.contact_email
            if args.website:
                kwargs["website"] = args.website
            if args.description:
                kwargs["description"] = args.description
            manager.add_partner(args.name, args.category, **kwargs)

    elif args.command == "add-service-metric":
        if args.interactive:
            interactive_service_metric_add(manager)
        else:
            kwargs = {}
            if args.beneficiaries is not None:
                kwargs["beneficiaries"] = args.beneficiaries
            if args.sessions is not None:
                kwargs["sessions"] = args.sessions
            if args.hours is not None:
                kwargs["hours"] = args.hours
            if args.units_delivered is not None:
                kwargs["units_delivered"] = args.units_delivered
            if args.notes:
                kwargs["notes"] = args.notes
            manager.add_service_metric(args.year, args.service_id, **kwargs)

    elif args.command == "list":
        filters = {}
        if args.year:
            filters["year"] = args.year
        if args.service_id:
            filters["service_id"] = args.service_id

        records = manager.list_table(args.table, filters, args.limit)

        if records:
            print(f"\n{len(records)} records found in '{args.table}':")
            print("-" * 80)
            for record in records:
                print(json.dumps(record, indent=2))
                print("-" * 80)
        else:
            print(f"No records found in '{args.table}'.")

    elif args.command == "mark-story":
        manager.mark_story_eligible(args.story_id)

    print("\nOperation completed successfully.")


if __name__ == "__main__":
    main()
