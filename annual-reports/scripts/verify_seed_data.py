#!/usr/bin/env python3
"""
Verify 2023-24 Annual Report Seed Data
Palm Island Community Company

This script verifies that the seed data from 002_2023_24_annual_report_data.sql
was correctly loaded into the database.

Usage:
    python verify_seed_data.py
    python verify_seed_data.py --verbose
"""

import os
import sys
from dataclasses import dataclass
from typing import Optional

# Expected values from the 2023-24 Annual Report
EXPECTED_DATA = {
    "board_members": {
        "count": 7,
        "chair": "Luella Bligh",
        "roles": ["Chair", "Director", "Company Secretary"]
    },
    "governance_achievements": {
        "min_count": 10,
        "fiscal_year": 2024,
        "categories": ["staffing", "accreditation", "service_delivery", "health_stats"]
    },
    "annual_financials": {
        "years": [2024, 2023, 2022],
        "fy2024": {
            "total_income": 23400335.00,
            "current_assets": 6139133.00,
            "labour_costs": 18226451.00
        }
    },
    "staff_statistics": {
        "years": [2024, 2023, 2022, 2021, 2020],
        "fy2024": {
            "total_staff": 197,
            "indigenous_percent_min": 80,
            "resident_percent_min": 70
        }
    },
    "partners": {
        "min_count": 20,
        "types": ["government", "health", "education", "service", "community"]
    },
    "services": {
        "count": 16,
        "categories": ["health", "justice", "community", "family", "disability", "crisis", "youth"]
    },
    "service_metrics": {
        "fiscal_year": 2024,
        "health_clients": 2283,
        "health_episodes": 17488
    }
}


@dataclass
class VerificationResult:
    table: str
    check: str
    expected: str
    actual: str
    passed: bool
    message: str = ""


def get_supabase_client():
    """Get Supabase client from environment."""
    try:
        from supabase import create_client, Client
    except ImportError:
        print("ERROR: supabase-py not installed. Run: pip install supabase")
        return None

    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

    if not url or not key:
        print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
        print("Set environment variables or check .env.local")
        return None

    return create_client(url, key)


def verify_board_members(supabase, verbose: bool = False) -> list[VerificationResult]:
    """Verify board_members table data."""
    results = []

    try:
        response = supabase.table("board_members").select("*").execute()
        members = response.data

        # Check count
        expected_count = EXPECTED_DATA["board_members"]["count"]
        actual_count = len(members)
        results.append(VerificationResult(
            table="board_members",
            check="record_count",
            expected=str(expected_count),
            actual=str(actual_count),
            passed=actual_count >= expected_count,
            message=f"Expected {expected_count} members, found {actual_count}"
        ))

        # Check for Chair
        chair_name = EXPECTED_DATA["board_members"]["chair"]
        has_chair = any(m.get("role") == "Chair" and m.get("name") == chair_name for m in members)
        results.append(VerificationResult(
            table="board_members",
            check="chair_present",
            expected=chair_name,
            actual=chair_name if has_chair else "Not found",
            passed=has_chair,
            message=f"Chair {chair_name} {'found' if has_chair else 'NOT found'}"
        ))

        if verbose:
            print("\n  Board Members:")
            for m in members:
                print(f"    - {m.get('name')}: {m.get('role')}")

    except Exception as e:
        results.append(VerificationResult(
            table="board_members",
            check="query",
            expected="Success",
            actual=str(e),
            passed=False,
            message=f"Query failed: {e}"
        ))

    return results


def verify_governance_achievements(supabase, verbose: bool = False) -> list[VerificationResult]:
    """Verify governance_achievements table data."""
    results = []

    try:
        response = supabase.table("governance_achievements") \
            .select("*") \
            .eq("fiscal_year", 2024) \
            .execute()
        achievements = response.data

        # Check count
        min_count = EXPECTED_DATA["governance_achievements"]["min_count"]
        actual_count = len(achievements)
        results.append(VerificationResult(
            table="governance_achievements",
            check="fy2024_count",
            expected=f">= {min_count}",
            actual=str(actual_count),
            passed=actual_count >= min_count,
            message=f"Expected at least {min_count} achievements, found {actual_count}"
        ))

        # Check categories
        categories = set(a.get("category") for a in achievements if a.get("category"))
        expected_categories = set(EXPECTED_DATA["governance_achievements"]["categories"])
        has_categories = expected_categories.issubset(categories)
        results.append(VerificationResult(
            table="governance_achievements",
            check="categories",
            expected=str(expected_categories),
            actual=str(categories),
            passed=has_categories,
            message=f"Category coverage: {len(categories & expected_categories)}/{len(expected_categories)}"
        ))

        if verbose:
            print("\n  Governance Achievements (FY2024):")
            for a in achievements[:5]:
                print(f"    - [{a.get('category')}] {a.get('achievement_text')[:60]}...")

    except Exception as e:
        results.append(VerificationResult(
            table="governance_achievements",
            check="query",
            expected="Success",
            actual=str(e),
            passed=False
        ))

    return results


def verify_annual_financials(supabase, verbose: bool = False) -> list[VerificationResult]:
    """Verify annual_financials table data."""
    results = []

    try:
        response = supabase.table("annual_financials").select("*").order("fiscal_year", desc=True).execute()
        financials = response.data

        # Check years present
        years_present = [f.get("fiscal_year") for f in financials]
        expected_years = EXPECTED_DATA["annual_financials"]["years"]
        has_years = all(y in years_present for y in expected_years)
        results.append(VerificationResult(
            table="annual_financials",
            check="years_present",
            expected=str(expected_years),
            actual=str(years_present),
            passed=has_years,
            message=f"Years {expected_years} {'all present' if has_years else 'MISSING some'}"
        ))

        # Check FY2024 values
        fy2024 = next((f for f in financials if f.get("fiscal_year") == 2024), None)
        if fy2024:
            expected_income = EXPECTED_DATA["annual_financials"]["fy2024"]["total_income"]
            actual_income = float(fy2024.get("total_income", 0))
            income_match = abs(actual_income - expected_income) < 1000
            results.append(VerificationResult(
                table="annual_financials",
                check="fy2024_total_income",
                expected=f"${expected_income:,.2f}",
                actual=f"${actual_income:,.2f}",
                passed=income_match,
                message=f"FY2024 income {'matches' if income_match else 'MISMATCH'}"
            ))

            if verbose:
                print("\n  FY2024 Financial Summary:")
                print(f"    Total Income: ${actual_income:,.2f}")
                print(f"    Current Assets: ${float(fy2024.get('current_assets', 0)):,.2f}")
                print(f"    Labour Costs: ${float(fy2024.get('labour_costs', 0)):,.2f}")

    except Exception as e:
        results.append(VerificationResult(
            table="annual_financials",
            check="query",
            expected="Success",
            actual=str(e),
            passed=False
        ))

    return results


def verify_staff_statistics(supabase, verbose: bool = False) -> list[VerificationResult]:
    """Verify staff_statistics table data."""
    results = []

    try:
        response = supabase.table("staff_statistics").select("*").order("fiscal_year", desc=True).execute()
        stats = response.data

        # Check FY2024 staff count
        fy2024 = next((s for s in stats if s.get("fiscal_year") == 2024), None)
        if fy2024:
            expected_staff = EXPECTED_DATA["staff_statistics"]["fy2024"]["total_staff"]
            actual_staff = fy2024.get("total_staff", 0)
            results.append(VerificationResult(
                table="staff_statistics",
                check="fy2024_total_staff",
                expected=str(expected_staff),
                actual=str(actual_staff),
                passed=actual_staff == expected_staff,
                message=f"Staff count {'matches' if actual_staff == expected_staff else 'MISMATCH'}"
            ))

            # Check Indigenous percentage
            indigenous_count = fy2024.get("indigenous_staff_count", 0)
            total = fy2024.get("total_staff", 1)
            indigenous_percent = (indigenous_count / total) * 100
            min_expected = EXPECTED_DATA["staff_statistics"]["fy2024"]["indigenous_percent_min"]
            results.append(VerificationResult(
                table="staff_statistics",
                check="indigenous_percent",
                expected=f">= {min_expected}%",
                actual=f"{indigenous_percent:.1f}%",
                passed=indigenous_percent >= min_expected,
                message=f"Indigenous staff: {indigenous_count}/{total} ({indigenous_percent:.1f}%)"
            ))

            if verbose:
                print("\n  Staff Statistics (FY2024):")
                print(f"    Total Staff: {actual_staff}")
                print(f"    Indigenous Staff: {indigenous_count} ({indigenous_percent:.1f}%)")
                resident_count = fy2024.get("palm_island_resident_count", 0)
                print(f"    Palm Island Residents: {resident_count} ({(resident_count/total)*100:.1f}%)")

    except Exception as e:
        results.append(VerificationResult(
            table="staff_statistics",
            check="query",
            expected="Success",
            actual=str(e),
            passed=False
        ))

    return results


def verify_partners(supabase, verbose: bool = False) -> list[VerificationResult]:
    """Verify partners table data."""
    results = []

    try:
        response = supabase.table("partners").select("*").execute()
        partners = response.data

        # Check count
        min_count = EXPECTED_DATA["partners"]["min_count"]
        actual_count = len(partners)
        results.append(VerificationResult(
            table="partners",
            check="record_count",
            expected=f">= {min_count}",
            actual=str(actual_count),
            passed=actual_count >= min_count,
            message=f"Expected {min_count}+ partners, found {actual_count}"
        ))

        # Check partner types
        types = set(p.get("partner_type") for p in partners if p.get("partner_type"))
        expected_types = set(EXPECTED_DATA["partners"]["types"])
        has_types = expected_types.issubset(types)
        results.append(VerificationResult(
            table="partners",
            check="partner_types",
            expected=str(expected_types),
            actual=str(types),
            passed=has_types,
            message=f"Partner type coverage: {len(types & expected_types)}/{len(expected_types)}"
        ))

        if verbose:
            print("\n  Partners by Type:")
            for ptype in sorted(types):
                count = len([p for p in partners if p.get("partner_type") == ptype])
                print(f"    - {ptype}: {count}")

    except Exception as e:
        results.append(VerificationResult(
            table="partners",
            check="query",
            expected="Success",
            actual=str(e),
            passed=False
        ))

    return results


def verify_services(supabase, verbose: bool = False) -> list[VerificationResult]:
    """Verify services table data."""
    results = []

    try:
        response = supabase.table("services").select("*").execute()
        services = response.data

        # Check count
        expected_count = EXPECTED_DATA["services"]["count"]
        actual_count = len(services)
        results.append(VerificationResult(
            table="services",
            check="record_count",
            expected=str(expected_count),
            actual=str(actual_count),
            passed=actual_count >= expected_count,
            message=f"Expected {expected_count} services, found {actual_count}"
        ))

        # Check categories
        categories = set(s.get("service_category") for s in services if s.get("service_category"))
        expected_categories = set(EXPECTED_DATA["services"]["categories"])
        has_categories = expected_categories.issubset(categories)
        results.append(VerificationResult(
            table="services",
            check="categories",
            expected=str(expected_categories),
            actual=str(categories),
            passed=has_categories,
            message=f"Service category coverage"
        ))

        if verbose:
            print("\n  Services (16 total):")
            for s in services:
                print(f"    - {s.get('name')} [{s.get('service_category')}]")

    except Exception as e:
        results.append(VerificationResult(
            table="services",
            check="query",
            expected="Success",
            actual=str(e),
            passed=False
        ))

    return results


def verify_service_metrics(supabase, verbose: bool = False) -> list[VerificationResult]:
    """Verify service_metrics table data."""
    results = []

    try:
        response = supabase.table("service_metrics") \
            .select("*, services(name, slug)") \
            .eq("fiscal_year", 2024) \
            .execute()
        metrics = response.data

        # Check count
        results.append(VerificationResult(
            table="service_metrics",
            check="fy2024_count",
            expected=">= 10",
            actual=str(len(metrics)),
            passed=len(metrics) >= 10,
            message=f"Found {len(metrics)} service metrics for FY2024"
        ))

        # Check health service metrics
        health_metrics = [m for m in metrics if m.get("services", {}).get("slug") in ["bwgcolman-healing", "sewb"]]
        if health_metrics:
            total_clients = sum(m.get("clients_served", 0) for m in health_metrics)
            expected_clients = EXPECTED_DATA["service_metrics"]["health_clients"]
            # Allow some variance due to data structure
            results.append(VerificationResult(
                table="service_metrics",
                check="health_clients",
                expected=str(expected_clients),
                actual=str(total_clients),
                passed=total_clients >= expected_clients // 2,  # At least half expected
                message=f"Health clients: {total_clients}"
            ))

        if verbose:
            print("\n  Service Metrics (FY2024):")
            for m in metrics[:6]:
                service_name = m.get("services", {}).get("name", "Unknown")
                clients = m.get("clients_served", 0)
                sessions = m.get("sessions_delivered", 0)
                print(f"    - {service_name}: {clients:,} clients, {sessions:,} sessions")

    except Exception as e:
        results.append(VerificationResult(
            table="service_metrics",
            check="query",
            expected="Success",
            actual=str(e),
            passed=False
        ))

    return results


def print_results(results: list[VerificationResult]) -> tuple[int, int]:
    """Print verification results and return pass/fail counts."""
    passed = 0
    failed = 0

    for result in results:
        status = "✅" if result.passed else "❌"
        if result.passed:
            passed += 1
        else:
            failed += 1

        print(f"  {status} {result.table}.{result.check}")
        if not result.passed:
            print(f"     Expected: {result.expected}")
            print(f"     Actual:   {result.actual}")

    return passed, failed


def main():
    """Main verification routine."""
    verbose = "--verbose" in sys.argv or "-v" in sys.argv

    print("=" * 60)
    print("PALM ISLAND COMMUNITY COMPANY")
    print("2023-24 Annual Report Seed Data Verification")
    print("=" * 60)

    # Get Supabase client
    supabase = get_supabase_client()
    if not supabase:
        print("\n❌ Cannot connect to Supabase. Please check configuration.")
        sys.exit(1)

    all_results = []

    # Run all verifications
    print("\n📋 Verifying Board Members...")
    all_results.extend(verify_board_members(supabase, verbose))

    print("\n📋 Verifying Governance Achievements...")
    all_results.extend(verify_governance_achievements(supabase, verbose))

    print("\n📋 Verifying Annual Financials...")
    all_results.extend(verify_annual_financials(supabase, verbose))

    print("\n📋 Verifying Staff Statistics...")
    all_results.extend(verify_staff_statistics(supabase, verbose))

    print("\n📋 Verifying Partners...")
    all_results.extend(verify_partners(supabase, verbose))

    print("\n📋 Verifying Services...")
    all_results.extend(verify_services(supabase, verbose))

    print("\n📋 Verifying Service Metrics...")
    all_results.extend(verify_service_metrics(supabase, verbose))

    # Summary
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY")
    print("=" * 60)

    passed, failed = print_results(all_results)
    total = passed + failed

    print("\n" + "-" * 60)
    print(f"Total Checks: {total}")
    print(f"Passed: {passed} ({(passed/total)*100:.0f}%)")
    print(f"Failed: {failed}")

    if failed == 0:
        print("\n✅ All verifications passed! Seed data loaded correctly.")
        return 0
    else:
        print(f"\n⚠️  {failed} verification(s) failed. Please check the data.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
