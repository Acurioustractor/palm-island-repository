# manage_data.py - Code Highlights

This document showcases the key architectural components of the manage_data.py script.

## 1. SupabaseManager Class - Connection & Operations

The core class that manages all database interactions.

```python
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
```

Key features:
- Environment variable validation
- Single client instance
- Clear error messages for missing credentials

## 2. Upsert Pattern for Financial Data

Demonstrates the pattern used for yearly data that may be updated.

```python
def add_financial(self, year: int, **kwargs) -> Dict[str, Any]:
    """Add or update annual financial data."""
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
```

Key features:
- Check before insert/update pattern
- Conditional branch for insert vs update
- User feedback on operation type
- Safe result access

## 3. Interactive Input with Validation

Type-safe user input collection with retry logic.

```python
def prompt_for_input(
    prompt: str,
    input_type: str = "str",
    required: bool = True,
    choices: Optional[List[str]] = None,
) -> Any:
    """Prompt user for input with type validation."""
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
            else:  # str
                if choices and user_input not in choices:
                    print(f"Please choose from: {', '.join(choices)}")
                    continue
                return user_input
        except (ValueError, json.JSONDecodeError) as e:
            print(f"Invalid input: {e}")
            continue
```

Key features:
- Infinite retry loop with validation
- Type coercion for multiple types
- Required field handling
- Choice validation
- User-friendly error messages

## 4. Interactive Financial Data Entry

Complete interactive workflow for complex operations.

```python
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
    # ... more fields ...

    manager.add_financial(year, **kwargs)
```

Key features:
- Sequential field collection
- Conditional kwargs building
- Only passes non-None values
- Clean separation of concerns

## 5. Service Metrics with Enumeration

Shows how to list available options before collection.

```python
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
    # ... rest of collection ...
```

Key features:
- Pre-validation of dependent data
- User guidance through enumeration
- Early exit on missing data
- Clear error handling

## 6. Argument Parser Setup

Comprehensive CLI argument parsing with subcommands.

```python
def setup_parser() -> argparse.ArgumentParser:
    """Set up command-line argument parser."""
    parser = argparse.ArgumentParser(
        description="Interactive CLI for managing Palm Island annual report database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python manage_data.py add-financial --year 2024 --revenue 1000000
  python manage_data.py list annual_financials --year 2024
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # add-financial subcommand
    financial_parser = subparsers.add_parser("add-financial", help="Add/update financial data")
    financial_parser.add_argument("--year", type=int, required=True, help="Fiscal year")
    financial_parser.add_argument("--revenue", type=float, help="Revenue")
    financial_parser.add_argument("--expenses", type=float, help="Expenses")
    financial_parser.add_argument(
        "--interactive", action="store_true", help="Use interactive mode"
    )

    # ... more subcommands ...
    return parser
```

Key features:
- Hierarchical subcommands
- Type validation in argparse
- Extended help text
- Flexible required arguments

## 7. Command Dispatcher Logic

Clean switch logic for command handling.

```python
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
            # ... build kwargs ...
            manager.add_financial(args.year, **kwargs)

    elif args.command == "add-staff":
        # ... similar pattern ...

    # ... more commands ...
    print("\nOperation completed successfully.")
```

Key features:
- Early connection validation
- No-command help display
- Conditional interactive vs CLI mode
- Kwargs filtering (skip None values)

## 8. Flexible Listing with Optional Filters

Generic list function supporting multiple query patterns.

```python
def list_table(
    self,
    table_name: str,
    filters: Optional[Dict[str, Any]] = None,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """List records from a table with optional filtering."""
    query = self.client.table(table_name).select("*").limit(limit)

    if filters:
        for column, value in filters.items():
            query = query.eq(column, value)

    result = query.execute()
    return result.data
```

Key features:
- Optional filtering dictionary
- Dynamic query building
- Reusable across tables
- Configurable limits

## 9. Story Marking Operation

Simple update operation on boolean field.

```python
def mark_story_eligible(self, story_id: int) -> Dict[str, Any]:
    """Mark a story as eligible for annual report."""
    result = (
        self.client.table("stories")
        .update({"annual_report_eligible": True})
        .eq("id", story_id)
        .execute()
    )
    print(f"Marked story {story_id} as annual report eligible")
    return result.data[0] if result.data else None
```

Key features:
- Single field update
- Specific ID targeting
- User feedback
- Safe result access

## 10. Error Handling Pattern

Multi-level error handling throughout the script.

```python
# Environment setup with validation
try:
    manager = SupabaseManager()
except ValueError as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)

# Input validation in loop
try:
    if input_type == "int":
        return int(user_input)
    elif input_type == "date":
        datetime.strptime(user_input, "%Y-%m-%d")
        return user_input
except (ValueError, json.JSONDecodeError) as e:
    print(f"Invalid input: {e}")
    continue

# Database operations with user feedback
result = self.client.table("annual_financials").insert(data).execute()
print(f"Added financial data for year {year}")
```

Key features:
- Multiple error catching levels
- User-friendly error messages
- Graceful degradation
- Informative feedback

## Design Patterns Used

1. **Manager Pattern**: SupabaseManager centralizes all DB operations
2. **Factory Pattern**: prompt_for_input factory for various input types
3. **Upsert Pattern**: Check-then-insert-or-update for yearly data
4. **Builder Pattern**: kwargs building for optional fields
5. **Strategy Pattern**: Interactive vs CLI argument mode
6. **Command Pattern**: Each subcommand is independently handled
7. **Iterator Pattern**: Loop through services/filters

## Code Statistics

- **Main script**: ~700 lines
- **SupabaseManager**: ~150 lines
- **Interactive functions**: ~200 lines
- **Parser setup**: ~100 lines
- **Main dispatcher**: ~300 lines
- **Documentation**: ~1000 lines across 4 files

## Best Practices Demonstrated

1. Type hints throughout
2. Comprehensive docstrings
3. Error handling at multiple levels
4. Single responsibility principle
5. DRY (Don't Repeat Yourself) via shared functions
6. Clear variable naming
7. Minimal code duplication
8. User-centric design with feedback

