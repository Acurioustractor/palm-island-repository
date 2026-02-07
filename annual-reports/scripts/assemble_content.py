#!/usr/bin/env python3
"""
PICC Annual Report - Content Assembly Script

Pulls approved stories from Supabase database and assembles them
into a structured JSON file ready for PDF generation.

Usage:
    python assemble_content.py --year 2025 --output ../output/report-2025-assembled.json

Requirements:
    pip install supabase python-dotenv --break-system-packages

Schema Requirements:
    Run migrations/001_annual_report_tables.sql first to add all required tables.

Updated: January 2026
- Now queries board_members, governance_achievements, annual_financials,
  staff_statistics, partners, and services tables instead of using hardcoded values.
"""

import os
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import supabase, provide helpful message if not installed
try:
    from supabase import create_client, Client
except ImportError:
    print("Supabase not installed. Run: pip install supabase --break-system-packages")
    exit(1)


def get_supabase_client() -> Client:
    """Initialize Supabase client from environment variables."""
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")

    if not url or not key:
        raise ValueError(
            "Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
        )

    return create_client(url, key)


def fetch_approved_stories(client: Client, year: int) -> list[dict]:
    """
    Fetch all approved stories for the annual report year.

    Uses the annual_report_stories view if available, otherwise queries directly.
    """

    # Try the view first (more efficient)
    try:
        response = client.table("annual_report_stories").select("*").eq(
            "annual_report_year", year
        ).order("featured_priority", desc=True).execute()

        if response.data:
            return response.data
    except Exception:
        pass  # View doesn't exist, fall back to direct query

    # Direct query with joins
    response = client.table("stories").select(
        """
        *,
        storyteller:profiles!storyteller_id(
            id,
            full_name,
            preferred_name,
            community_role,
            is_elder
        ),
        media:story_media(
            id,
            media_type,
            file_path,
            caption,
            display_order,
            photographer,
            credit
        ),
        service_links:service_story_links(
            service_name,
            demonstrates_effectiveness
        )
        """
    ).eq("annual_report_eligible", True
    ).eq("annual_report_year", year
    ).eq("status", "published"
    ).order("featured_priority", desc=True
    ).order("created_at", desc=True
    ).execute()

    return response.data or []


def fetch_published_stories_for_year(client: Client, year: int) -> list[dict]:
    """
    Alternative: Fetch all published stories from the reporting period.

    Use this if annual_report_eligible hasn't been set yet.
    Fetches stories published between July 1 (year-1) and June 30 (year).
    """

    start_date = f"{year - 1}-07-01"
    end_date = f"{year}-06-30"

    response = client.table("stories").select(
        """
        *,
        storyteller:profiles!storyteller_id(
            id,
            full_name,
            preferred_name,
            community_role,
            is_elder
        ),
        media:story_media(
            id,
            media_type,
            file_path,
            caption,
            display_order,
            photographer,
            credit
        ),
        service_links:service_story_links(
            service_name
        )
        """
    ).eq("status", "published"
    ).gte("created_at", start_date
    ).lte("created_at", end_date
    ).order("is_featured", desc=True
    ).order("views", desc=True
    ).execute()

    return response.data or []


def fetch_leadership_content(client: Client, year: int) -> dict:
    """
    Fetch CEO and Chair messages for the year.

    Looks for stories with story_type = 'leadership_message' and
    leadership_role = 'ceo' or 'chair'.
    """

    # Try to fetch from stories with leadership type
    try:
        response = client.table("stories").select(
            """
            *,
            storyteller:profiles!storyteller_id(
                full_name,
                preferred_name,
                community_role
            )
            """
        ).eq("story_type", "leadership_message"
        ).eq("status", "published"
        ).eq("annual_report_year", year
        ).execute()

        if response.data:
            # Use leadership_role field if available, otherwise fall back to title matching
            ceo_msg = next(
                (s for s in response.data if s.get("leadership_role") == "ceo" or "CEO" in s.get("title", "")),
                None
            )
            chair_msg = next(
                (s for s in response.data if s.get("leadership_role") == "chair" or "Chair" in s.get("title", "")),
                None
            )

            return {
                "ceo": {
                    "name": ceo_msg["storyteller"]["full_name"] if ceo_msg and ceo_msg.get("storyteller") else "Rachel Atkinson",
                    "photo": "assets/photos/rachel-atkinson.jpg",
                    "message_lead": ceo_msg.get("summary", "") if ceo_msg else "",
                    "message_body": ceo_msg.get("content", "") if ceo_msg else ""
                },
                "chair": {
                    "name": chair_msg["storyteller"]["full_name"] if chair_msg and chair_msg.get("storyteller") else "Luella Bligh",
                    "photo": "assets/photos/luella-bligh.jpg",
                    "message_lead": chair_msg.get("summary", "") if chair_msg else "",
                    "message_body": chair_msg.get("content", "") if chair_msg else ""
                }
            }
    except Exception as e:
        print(f"    Warning: Could not fetch leadership content: {e}")

    # Return placeholder structure if no leadership messages found
    return {
        "ceo": {
            "name": "Rachel Atkinson",
            "photo": "assets/photos/rachel-atkinson.jpg",
            "message_lead": "[CEO message lead - to be added]",
            "message_body": "[CEO message body - to be added]"
        },
        "chair": {
            "name": "Luella Bligh",
            "photo": "assets/photos/luella-bligh.jpg",
            "message_lead": "[Chair message lead - to be added]",
            "message_body": "[Chair message body - to be added]"
        }
    }


def fetch_governance_data(client: Client, year: int) -> dict:
    """
    Fetch board members and governance achievements from database.

    Queries:
    - board_members table (or current_board_members view)
    - governance_achievements table for the specified year
    """

    board_members = []
    achievements = []

    # Fetch current board members
    try:
        # Try the view first
        try:
            response = client.table("current_board_members").select("*").order("display_order").execute()
            if response.data:
                board_members = [{"name": m["name"], "role": m["role"]} for m in response.data]
        except Exception:
            # Fall back to table with filter
            response = client.table("board_members").select("*").is_("end_date", "null").order("display_order").execute()
            if response.data:
                board_members = [{"name": m["name"], "role": m["role"]} for m in response.data]
    except Exception as e:
        print(f"    Warning: Could not fetch board members: {e}")

    # Fetch governance achievements for the year
    try:
        response = client.table("governance_achievements").select("*").eq(
            "fiscal_year", year
        ).order("display_order").execute()

        if response.data:
            achievements = [a["achievement_text"] for a in response.data]
    except Exception as e:
        print(f"    Warning: Could not fetch governance achievements: {e}")

    # Use defaults if database is empty
    if not board_members:
        print("    Using default board members (database table empty)")
        board_members = [
            {"name": "Luella Bligh", "role": "Chair"},
            {"name": "Rhonda Phillips", "role": "Director"},
            {"name": "Allan Palm Island", "role": "Director"},
            {"name": "Matthew Lindsay", "role": "Company Secretary"},
            {"name": "Harriet Hulthen", "role": "Director"},
            {"name": "Raymond W. Palmer Snr", "role": "Director"},
            {"name": "Cassie Lang", "role": "Director"},
        ]

    if not achievements:
        print("    Using default achievements (database table empty)")
        achievements = [
            "PICC continues to have an average of over 80 per cent of its staff members identifying as Aboriginal, Torres Strait Islander or both.",
            "The proportion of staff members living on Palm Island is still above 70 per cent.",
            "PICC passed the Human Services Quality Framework audit with flying colours.",
        ]

    return {
        "board_members": board_members,
        "achievements": achievements
    }


def fetch_services_list(client: Client) -> list[dict]:
    """
    Fetch list of all active PICC services from database.

    Returns list of service objects with name, slug, and category.
    """

    try:
        response = client.table("services").select(
            "id, name, short_name, slug, service_category"
        ).eq("is_active", True
        ).eq("show_in_annual_report", True
        ).order("display_order").execute()

        if response.data:
            return response.data
    except Exception as e:
        print(f"    Warning: Could not fetch services: {e}")

    # Fallback to hardcoded list if table doesn't exist or is empty
    print("    Using default services list (database table empty)")
    return [
        {"name": "Bwgcolman Healing Service", "service_category": "health"},
        {"name": "Community Justice Group", "service_category": "justice"},
        {"name": "Digital Service Centre", "service_category": "community"},
        {"name": "Diversionary Service", "service_category": "justice"},
        {"name": "Early Childhood Services (CFC)", "service_category": "family"},
        {"name": "Family Care Service", "service_category": "family"},
        {"name": "Family Participation Program", "service_category": "family"},
        {"name": "Family Wellbeing Centre", "service_category": "family"},
        {"name": "NDIS Service", "service_category": "disability"},
        {"name": "Safe Haven", "service_category": "crisis"},
        {"name": "Safe House", "service_category": "crisis"},
        {"name": "Social and Emotional Wellbeing Service", "service_category": "health"},
        {"name": "Specialist Domestic and Family Violence Service", "service_category": "crisis"},
        {"name": "Women's Healing Service", "service_category": "health"},
        {"name": "Women's Service", "service_category": "family"},
        {"name": "Youth Service", "service_category": "youth"},
    ]


def fetch_partners(client: Client) -> list[dict]:
    """
    Fetch list of partner organisations from database.

    Returns list of partner objects with name and type.
    """

    try:
        # Try the view first
        try:
            response = client.table("active_partners").select("*").execute()
            if response.data:
                return response.data
        except Exception:
            pass

        # Fall back to table query
        response = client.table("partners").select(
            "id, name, short_name, partner_type, logo_url, website_url"
        ).eq("show_in_annual_report", True
        ).order("display_order").execute()

        if response.data:
            return response.data
    except Exception as e:
        print(f"    Warning: Could not fetch partners: {e}")

    # Fallback to hardcoded list if table doesn't exist or is empty
    print("    Using default partners list (database table empty)")
    return [
        {"name": "BSocial Media", "partner_type": "service"},
        {"name": "Bwgcolman Community School", "partner_type": "education"},
        {"name": "CheckUp Australia", "partner_type": "health"},
        {"name": "Chit Chat Speech Pathology", "partner_type": "health"},
        {"name": "Commonwealth Department of Health and Aged Care", "partner_type": "government"},
        {"name": "Commonwealth Department of Social Services", "partner_type": "government"},
        {"name": "Fred Hollows Foundation", "partner_type": "health"},
        {"name": "Heart of Australia", "partner_type": "health"},
        {"name": "James Cook University", "partner_type": "education"},
        {"name": "Joyce Palmer Health Service", "partner_type": "health"},
        {"name": "National Indigenous Australians Agency", "partner_type": "government"},
        {"name": "Palm Island Aboriginal Shire Council", "partner_type": "government"},
        {"name": "Queensland Health", "partner_type": "government"},
        {"name": "TAFE Queensland", "partner_type": "education"},
        {"name": "Telstra", "partner_type": "service"},
        {"name": "Townsville Hospital and Health Service", "partner_type": "health"},
        {"name": "North Queensland Primary Health Network", "partner_type": "health"},
    ]


def fetch_financial_data(client: Client, year: int) -> dict:
    """
    Fetch financial data from annual_financials table.

    Returns structured financial data for balance sheet, income statement,
    and expenditure breakdown chart.
    """

    current_year_data = None
    previous_year_data = None

    try:
        # Fetch current year
        response = client.table("annual_financials").select("*").eq("fiscal_year", year).single().execute()
        if response.data:
            current_year_data = response.data

        # Fetch previous year for comparison
        response = client.table("annual_financials").select("*").eq("fiscal_year", year - 1).single().execute()
        if response.data:
            previous_year_data = response.data

    except Exception as e:
        print(f"    Warning: Could not fetch financial data: {e}")

    # Helper to get value or default
    def get_val(data, key, default=0):
        if data and key in data and data[key] is not None:
            return float(data[key])
        return default

    # Calculate totals
    if current_year_data:
        c = current_year_data
        c_total_assets = get_val(c, 'current_assets') + get_val(c, 'non_current_assets')
        c_total_liabilities = get_val(c, 'current_liabilities') + get_val(c, 'non_current_liabilities')
        c_net_assets = c_total_assets - c_total_liabilities
        c_total_expenditure = (
            get_val(c, 'labour_costs') +
            get_val(c, 'administration_expenses') +
            get_val(c, 'property_energy_expenses') +
            get_val(c, 'motor_vehicle_expenses') +
            get_val(c, 'travel_training_expenses') +
            get_val(c, 'client_related_costs')
        )
        c_net_surplus = get_val(c, 'total_income') - c_total_expenditure
    else:
        c_total_assets = c_total_liabilities = c_net_assets = c_total_expenditure = c_net_surplus = 0

    if previous_year_data:
        p = previous_year_data
        p_total_assets = get_val(p, 'current_assets') + get_val(p, 'non_current_assets')
        p_total_liabilities = get_val(p, 'current_liabilities') + get_val(p, 'non_current_liabilities')
        p_net_assets = p_total_assets - p_total_liabilities
        p_total_expenditure = (
            get_val(p, 'labour_costs') +
            get_val(p, 'administration_expenses') +
            get_val(p, 'property_energy_expenses') +
            get_val(p, 'motor_vehicle_expenses') +
            get_val(p, 'travel_training_expenses') +
            get_val(p, 'client_related_costs')
        )
        p_net_surplus = get_val(p, 'total_income') - p_total_expenditure
    else:
        p_total_assets = p_total_liabilities = p_net_assets = p_total_expenditure = p_net_surplus = 0

    # Calculate expenditure percentages for pie chart
    if c_total_expenditure > 0:
        labour_pct = round(get_val(current_year_data, 'labour_costs') / c_total_expenditure * 100)
        admin_pct = round(get_val(current_year_data, 'administration_expenses') / c_total_expenditure * 100)
        property_pct = round(get_val(current_year_data, 'property_energy_expenses') / c_total_expenditure * 100)
        vehicle_pct = round(get_val(current_year_data, 'motor_vehicle_expenses') / c_total_expenditure * 100)
        travel_pct = round(get_val(current_year_data, 'travel_training_expenses') / c_total_expenditure * 100)
        client_pct = round(get_val(current_year_data, 'client_related_costs') / c_total_expenditure * 100)
    else:
        # Default percentages if no data
        labour_pct, admin_pct, property_pct = 60, 21, 4
        vehicle_pct, travel_pct, client_pct = 2, 8, 5

    # Calculate offsets for pie chart (cumulative)
    offsets = [0]
    for pct in [labour_pct, admin_pct, property_pct, vehicle_pct, travel_pct]:
        offsets.append(offsets[-1] + round(pct * 5.01))  # 5.01 ≈ 502/100 for SVG stroke-dashoffset

    return {
        "balance_sheet": [
            {"label": "Current Assets", "current": get_val(current_year_data, 'current_assets'), "previous": get_val(previous_year_data, 'current_assets'), "class": ""},
            {"label": "Non Current Assets", "current": get_val(current_year_data, 'non_current_assets'), "previous": get_val(previous_year_data, 'non_current_assets'), "class": ""},
            {"label": "TOTAL Assets", "current": c_total_assets, "previous": p_total_assets, "class": "total"},
            {"label": "Current Liabilities", "current": get_val(current_year_data, 'current_liabilities'), "previous": get_val(previous_year_data, 'current_liabilities'), "class": ""},
            {"label": "Non Current Liabilities", "current": get_val(current_year_data, 'non_current_liabilities'), "previous": get_val(previous_year_data, 'non_current_liabilities'), "class": ""},
            {"label": "TOTAL Liabilities", "current": c_total_liabilities, "previous": p_total_liabilities, "class": "total"},
            {"label": "NET ASSETS", "current": c_net_assets, "previous": p_net_assets, "class": "total"},
        ],
        "income_expenditure": [
            {"label": "INCOME", "current": get_val(current_year_data, 'total_income'), "previous": get_val(previous_year_data, 'total_income'), "class": ""},
            {"label": "Total Labour Costs", "current": get_val(current_year_data, 'labour_costs'), "previous": get_val(previous_year_data, 'labour_costs'), "class": ""},
            {"label": "Administration Expenses", "current": get_val(current_year_data, 'administration_expenses'), "previous": get_val(previous_year_data, 'administration_expenses'), "class": ""},
            {"label": "Property & Energy Expenses", "current": get_val(current_year_data, 'property_energy_expenses'), "previous": get_val(previous_year_data, 'property_energy_expenses'), "class": ""},
            {"label": "Motor Vehicle Expenses", "current": get_val(current_year_data, 'motor_vehicle_expenses'), "previous": get_val(previous_year_data, 'motor_vehicle_expenses'), "class": ""},
            {"label": "Travel & Training Expenses", "current": get_val(current_year_data, 'travel_training_expenses'), "previous": get_val(previous_year_data, 'travel_training_expenses'), "class": ""},
            {"label": "Client Related Costs", "current": get_val(current_year_data, 'client_related_costs'), "previous": get_val(previous_year_data, 'client_related_costs'), "class": ""},
            {"label": "Total Expenditure", "current": c_total_expenditure, "previous": p_total_expenditure, "class": "total"},
            {"label": "NET SURPLUS (DEFICIT)", "current": c_net_surplus, "previous": p_net_surplus, "class": "total"},
        ],
        "expenditure_breakdown": [
            {"label": "Total Labour Costs", "percent": labour_pct, "color": "#4a7fb5", "offset": offsets[0]},
            {"label": "Administration Expenses", "percent": admin_pct, "color": "#b8a9d4", "offset": offsets[1]},
            {"label": "Property & Energy Expenses", "percent": property_pct, "color": "#a8d5ba", "offset": offsets[2]},
            {"label": "Motor Vehicle Expenses", "percent": vehicle_pct, "color": "#f59e0b", "offset": offsets[3]},
            {"label": "Travel & Training Expenses", "percent": travel_pct, "color": "#7fb5b5", "offset": offsets[4]},
            {"label": "Client Related Costs", "percent": client_pct, "color": "#ff6b6b", "offset": offsets[5]},
        ],
        "audited": current_year_data.get("audited", False) if current_year_data else False,
        "auditor_name": current_year_data.get("auditor_name", "") if current_year_data else "",
    }


def fetch_staff_statistics(client: Client, year: int) -> dict:
    """
    Fetch staff statistics for the past 3 years from staff_statistics table.

    Returns data for display in staff count chart.
    """

    years = [year, year - 1, year - 2]
    labels = [f"30 June {y}" for y in years]
    counts = []
    indigenous_percents = []
    resident_percents = []

    try:
        # Try the view first for computed percentages
        try:
            response = client.table("staff_statistics_complete").select("*").in_("fiscal_year", years).order("fiscal_year", desc=True).execute()
            if response.data:
                # Create lookup by year
                data_by_year = {d["fiscal_year"]: d for d in response.data}
                for y in years:
                    if y in data_by_year:
                        d = data_by_year[y]
                        counts.append(d.get("total_staff", 0))
                        indigenous_percents.append(d.get("indigenous_staff_percent", 0))
                        resident_percents.append(d.get("palm_island_resident_percent", 0))
                    else:
                        counts.append(0)
                        indigenous_percents.append(0)
                        resident_percents.append(0)

                return {
                    "years": labels,
                    "counts": counts,
                    "indigenous_percent": indigenous_percents[0] if indigenous_percents else 0,
                    "resident_percent": resident_percents[0] if resident_percents else 0,
                }
        except Exception:
            pass

        # Fall back to direct table query
        response = client.table("staff_statistics").select("*").in_("fiscal_year", years).order("fiscal_year", desc=True).execute()

        if response.data:
            data_by_year = {d["fiscal_year"]: d for d in response.data}
            for y in years:
                if y in data_by_year:
                    d = data_by_year[y]
                    counts.append(d.get("total_staff", 0))
                    # Calculate percentages manually
                    total = d.get("total_staff", 0) or 1
                    indigenous_percents.append(round((d.get("indigenous_staff_count", 0) / total) * 100, 1))
                    resident_percents.append(round((d.get("palm_island_resident_count", 0) / total) * 100, 1))
                else:
                    counts.append(0)
                    indigenous_percents.append(0)
                    resident_percents.append(0)

            return {
                "years": labels,
                "counts": counts,
                "indigenous_percent": indigenous_percents[0] if indigenous_percents else 0,
                "resident_percent": resident_percents[0] if resident_percents else 0,
            }

    except Exception as e:
        print(f"    Warning: Could not fetch staff statistics: {e}")

    # Return zeros if no data
    print("    Using placeholder staff data (database table empty)")
    return {
        "years": labels,
        "counts": [0, 0, 0],
        "indigenous_percent": 80,  # Known approximate
        "resident_percent": 70,    # Known approximate
    }


def fetch_service_metrics(client: Client, year: int) -> list[dict]:
    """
    Fetch service metrics for data cards from service_metrics table.

    Returns list of data card objects with headline stats.
    """

    data_cards = []

    try:
        response = client.table("service_metrics").select(
            """
            *,
            service:services(name, short_name, service_category)
            """
        ).eq("fiscal_year", year).execute()

        if response.data:
            for m in response.data:
                if m.get("headline_stat_value") and m.get("headline_stat_label"):
                    service = m.get("service", {}) or {}
                    data_cards.append({
                        "value": m["headline_stat_value"],
                        "label": m["headline_stat_label"],
                        "service": service.get("name", ""),
                        "category": service.get("service_category", ""),
                    })

    except Exception as e:
        print(f"    Warning: Could not fetch service metrics: {e}")

    return data_cards


def fetch_highlights(client: Client, year: int) -> list[dict]:
    """
    Fetch report highlights from report_highlights table.

    Returns list of highlight objects for the report.
    """

    try:
        # First get the report ID
        report_response = client.table("annual_reports").select("id").eq(
            "report_year", year
        ).limit(1).execute()

        if not report_response.data:
            return []

        report_id = report_response.data[0]["id"]

        response = client.table("report_highlights").select(
            "id, title, subtitle, description, impact_achieved, highlight_type, is_featured, display_order, display_style, metrics"
        ).eq("report_id", report_id).order("display_order").execute()

        if response.data:
            return response.data

    except Exception as e:
        print(f"    Warning: Could not fetch highlights: {e}")

    return []


def resolve_photo_url(path: str, supabase_url: str = "") -> str:
    """
    Convert a Supabase storage path to a full public URL.

    If the path is already a full URL, return as-is.
    If it's a relative path, prepend the Supabase storage URL.
    """
    if not path:
        return ""
    if path.startswith("http://") or path.startswith("https://"):
        return path
    # Assume it's a Supabase storage path
    if not supabase_url:
        supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    if supabase_url:
        return f"{supabase_url}/storage/v1/object/public/{path}"
    return path


def transform_story(story: dict) -> dict:
    """Transform database story record to template format."""

    # Extract storyteller info
    storyteller = story.get("storyteller", {})
    if isinstance(storyteller, list) and storyteller:
        storyteller = storyteller[0]

    # Extract service names from service_links
    services = []
    service_links = story.get("service_links", []) or []
    for link in service_links:
        if isinstance(link, dict) and link.get("service_name"):
            services.append(link["service_name"])

    # Also include related_service if set
    if story.get("related_service"):
        service_name = story["related_service"].replace("_", " ").title()
        if service_name not in services:
            services.append(service_name)

    # Extract photos from media
    photos = []
    featured_image = None
    media = story.get("media", []) or []

    # Sort by display_order
    media_sorted = sorted(media, key=lambda m: m.get("display_order", 0) if isinstance(m, dict) else 0)

    for m in media_sorted:
        if isinstance(m, dict) and m.get("media_type") == "photo" and m.get("file_path"):
            if not featured_image:
                featured_image = m["file_path"]
            else:
                photos.append(m["file_path"])

    # Build quote - check both first-class fields and metadata
    quote = None

    # First try the dedicated quote fields (new schema)
    if story.get("quote_text"):
        quote = {
            "text": story["quote_text"],
            "attribution": story.get("quote_attribution", "Community Member")
        }
    # Fall back to metadata (old schema)
    elif story.get("metadata") and isinstance(story["metadata"], dict):
        quote_text = story["metadata"].get("quote_text")
        quote_attr = story["metadata"].get("quote_attribution")
        if quote_text:
            quote = {"text": quote_text, "attribution": quote_attr or "Community Member"}

    return {
        "id": story.get("id", ""),
        "title": story.get("title", "Untitled Story"),
        "subtitle": story.get("summary") or story.get("outcome_achieved", ""),
        "body": story.get("content", ""),
        "category": (story.get("story_type") or "story").replace("_", " ").title(),
        "featured_image": resolve_photo_url(featured_image or ""),
        "gallery": [resolve_photo_url(p) for p in photos[:3]],
        "quote": quote,
        "services": services,
        "section": story.get("report_section") or story.get("annual_report_section", "services"),
        "priority": story.get("featured_priority", 1),
        "storyteller_name": storyteller.get("full_name", "") if isinstance(storyteller, dict) else "",
        "is_elder_story": storyteller.get("is_elder", False) if isinstance(storyteller, dict) else False,
    }


def assemble_report(year: int, output_path: Optional[Path] = None, use_date_range: bool = False) -> dict:
    """
    Main assembly function - pulls all data and structures it for the template.

    Args:
        year: The report year (e.g., 2025 for FY 2024-2025)
        output_path: Where to save the assembled JSON
        use_date_range: If True, fetch all published stories from the FY period
                       instead of only those marked annual_report_eligible
    """

    print(f"Assembling PICC Annual Report content for {year}...")

    client = get_supabase_client()

    # Fetch stories
    print("  Fetching stories...")
    if use_date_range:
        raw_stories = fetch_published_stories_for_year(client, year)
        print(f"    (Using date range: Jul {year-1} - Jun {year})")
    else:
        raw_stories = fetch_approved_stories(client, year)
        print(f"    (Using annual_report_eligible flag)")

    stories = [transform_story(s) for s in raw_stories]
    print(f"    Found {len(stories)} stories")

    # Fetch other content
    print("  Fetching leadership content...")
    leadership = fetch_leadership_content(client, year)

    print("  Fetching governance data...")
    governance = fetch_governance_data(client, year)

    print("  Fetching services...")
    services = fetch_services_list(client)

    print("  Fetching partners...")
    partners = fetch_partners(client)

    print("  Fetching financial data...")
    financials = fetch_financial_data(client, year)

    print("  Fetching staff statistics...")
    staff_data = fetch_staff_statistics(client, year)

    print("  Fetching service metrics...")
    data_cards = fetch_service_metrics(client, year)

    print("  Fetching highlights...")
    highlights = fetch_highlights(client, year)

    # Assemble complete report data
    report_data = {
        # Metadata
        "title": f"Annual Report {year-1}-{year}",
        "year": year,
        "year_range": f"{year-1} - {year}",
        "generated_at": datetime.now().isoformat(),

        # Leadership
        "ceo": leadership["ceo"],
        "chair": leadership["chair"],

        # Standard content
        "acknowledgement_text": (
            "The Palm Island Community Company acknowledges the Traditional Owners of Palm Island, "
            "the Manbarra people. We also acknowledge the many First Nations persons who were forcibly "
            "removed to Palm Island, and we recognise these persons and their descendants as the "
            "historical Bwgcolman people. We recognise the continued connection of the Manbarra and "
            "Bwgcolman peoples to the land and waters of this beautiful island. We pay respect to "
            "Manbarra and Bwgcolman Elders, their ancestors, all First Nations peoples, and our "
            "ancestors who walk in the Dreamtime."
        ),

        "governance_achievements": governance["achievements"],
        "board_members": governance["board_members"],

        # Services - extract just names for simple list, or pass full objects
        "services": [s["name"] if isinstance(s, dict) else s for s in services],
        "services_detailed": services,  # Full objects with categories

        "staff_data": staff_data,

        # Stories
        "stories": stories,

        # Data cards from service metrics
        "data_cards": data_cards,

        # Financials from database
        "financials": financials,

        # Partners - extract just names for simple list, or pass full objects
        "partners": [p["name"] if isinstance(p, dict) else p for p in partners],
        "partners_detailed": partners,  # Full objects with types
        "partners_photo": "assets/photos/team.jpg",

        # Contact
        "contact": {
            "address_line1": "61-73 Sturt Street",
            "address_line2": "Townsville QLD 4810",
            "address_line3": "PO Box 1415",
            "country": "Australia",
            "phone": "07 4421 4300",
            "website": "www.picc.com.au",
            "acn": "640 793 728",
        },

        "mission_statement": (
            "The Palm Island Community Company is deeply committed to the principles of community "
            "control and self-determination. We uphold the spirit of community control by consistently "
            "adhering to these principles, ensuring that our actions reflect our dedication to "
            "empowering Palm Islanders."
        ),

        "cover_image": "assets/photos/palm-island-beach.jpg",

        # Highlights from database
        "highlights": highlights,
    }

    # Save to file if output path provided
    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w') as f:
            json.dump(report_data, f, indent=2, default=str)

        print(f"\n✅ Content assembled and saved to: {output_path}")
        print(f"   Total stories: {len(stories)}")
        print(f"   Board members: {len(governance['board_members'])}")
        print(f"   Partners: {len(partners)}")
        print(f"   Data cards: {len(data_cards)}")
        print(f"   Financial data: {'From database' if financials.get('audited') else 'Placeholder/unaudited'}")
        print(f"\n📝 Next steps:")
        print(f"   1. Review and edit: {output_path}")
        print(f"   2. Add leadership messages if empty")
        print(f"   3. Update financial data in Supabase if needed")
        print(f"   4. Run: python generate_pdf.py --input {output_path}")

    return report_data


def main():
    parser = argparse.ArgumentParser(description="Assemble PICC Annual Report content")
    parser.add_argument("--year", type=int, default=datetime.now().year,
                        help="Report year (default: current year)")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="Output JSON file path")
    parser.add_argument("--all-published", action="store_true",
                        help="Include all published stories from the FY period, not just those marked for annual report")

    args = parser.parse_args()

    if not args.output:
        args.output = f"../output/report-{args.year}-assembled.json"

    assemble_report(args.year, Path(args.output), use_date_range=args.all_published)


if __name__ == "__main__":
    main()
