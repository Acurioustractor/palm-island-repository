#!/bin/bash
# Usage Examples for manage_data.py
# This file documents common usage patterns for the database management script.

# =============================================================================
# HELP AND DISCOVERY
# =============================================================================

# View main help
python manage_data.py --help

# View command-specific help
python manage_data.py add-financial --help
python manage_data.py add-staff --help
python manage_data.py list --help


# =============================================================================
# ADDING FINANCIAL DATA
# =============================================================================

# Interactive mode - follow prompts
python manage_data.py add-financial --year 2024 --interactive

# Command-line mode with all fields
python manage_data.py add-financial \
  --year 2024 \
  --revenue 2500000 \
  --expenses 2000000 \
  --surplus 500000 \
  --grants 500000 \
  --donations 250000 \
  --notes "Strong financial year with increased grants"

# Partial financial data (update specific fields)
python manage_data.py add-financial \
  --year 2024 \
  --revenue 2500000 \
  --expenses 2000000


# =============================================================================
# ADDING STAFF STATISTICS
# =============================================================================

# Interactive mode
python manage_data.py add-staff --year 2024 --interactive

# Full staff data entry
python manage_data.py add-staff \
  --year 2024 \
  --total-staff 28 \
  --full-time 20 \
  --part-time 8 \
  --volunteers 150 \
  --volunteer-hours 5250 \
  --notes "Highest volunteer engagement on record"

# Just total staff
python manage_data.py add-staff \
  --year 2024 \
  --total-staff 28


# =============================================================================
# MANAGING BOARD MEMBERS
# =============================================================================

# Add single board member with minimal info
python manage_data.py add-board-member \
  --name "Dr. Sarah Mitchell" \
  --title "Board Chair"

# Add board member with full details
python manage_data.py add-board-member \
  --name "Dr. Sarah Mitchell" \
  --title "Board Chair" \
  --bio "Dr. Mitchell holds a PhD in Public Health and has 15 years of experience in tropical medicine and island healthcare systems." \
  --start-date 2023-01-15 \
  --end-date 2026-01-15

# Interactive board member entry
python manage_data.py add-board-member \
  --name "John Davidson" \
  --title "Treasurer" \
  --interactive


# =============================================================================
# MANAGING PARTNERS
# =============================================================================

# Add partner with essential info
python manage_data.py add-partner \
  --name "World Health Organization" \
  --category "Health"

# Add partner with complete information
python manage_data.py add-partner \
  --name "International Medical Corps" \
  --category "Health" \
  --contact-email partnerships@imc.org \
  --website https://www.internationalmedicalcorps.org \
  --description "Provides emergency medical services and disaster relief training"

# Add government partner
python manage_data.py add-partner \
  --name "Ministry of Health - Island Nation" \
  --category "Government" \
  --contact-email health@govt.island \
  --description "Primary government health authority"

# Add educational partner
python manage_data.py add-partner \
  --name "Island University Medical School" \
  --category "Education" \
  --website https://university.island/med \
  --description "Training ground for medical students"

# Interactive mode
python manage_data.py add-partner \
  --name "Médecins Sans Frontières" \
  --category "Health" \
  --interactive


# =============================================================================
# MANAGING SERVICE METRICS
# =============================================================================

# First, check available services
python manage_data.py list services

# Add metrics for service in interactive mode
python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 1 \
  --interactive

# Add complete service metrics
python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 1 \
  --beneficiaries 850 \
  --sessions 52 \
  --hours 416 \
  --units-delivered 1700 \
  --notes "Preventive health education program"

# Multiple services for same year
python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 1 \
  --beneficiaries 850 \
  --sessions 52 \
  --hours 416

python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 2 \
  --beneficiaries 450 \
  --sessions 26 \
  --hours 208

python manage_data.py add-service-metric \
  --year 2024 \
  --service-id 3 \
  --beneficiaries 200 \
  --sessions 12 \
  --hours 96


# =============================================================================
# LISTING DATA
# =============================================================================

# List all records in a table
python manage_data.py list annual_financials
python manage_data.py list board_members
python manage_data.py list partners
python manage_data.py list services

# List with year filter
python manage_data.py list annual_financials --year 2024
python manage_data.py list staff_statistics --year 2023

# List service metrics for specific service in specific year
python manage_data.py list service_metrics --year 2024 --service-id 1

# List with custom limit
python manage_data.py list partners --limit 50
python manage_data.py list board_members --limit 25

# View multiple years side by side
python manage_data.py list annual_financials --year 2023
python manage_data.py list annual_financials --year 2024


# =============================================================================
# MARKING STORIES
# =============================================================================

# Mark single story
python manage_data.py mark-story --story-id 42

# Mark multiple stories (run multiple commands)
python manage_data.py mark-story --story-id 42
python manage_data.py mark-story --story-id 15
python manage_data.py mark-story --story-id 28


# =============================================================================
# VERIFICATION WORKFLOW
# =============================================================================

# After adding data, verify with list commands:

# 1. Check financial data was added
python manage_data.py list annual_financials --year 2024

# 2. Check staff statistics
python manage_data.py list staff_statistics --year 2024

# 3. Verify all board members
python manage_data.py list board_members

# 4. Check all partners
python manage_data.py list partners

# 5. Verify service metrics
python manage_data.py list service_metrics --year 2024


# =============================================================================
# BULK DATA LOADING SCENARIO (2024 Annual Report)
# =============================================================================

# Step 1: Add financial data
python manage_data.py add-financial \
  --year 2024 \
  --revenue 2500000 \
  --expenses 2000000 \
  --surplus 500000 \
  --grants 600000 \
  --donations 300000

# Step 2: Add staff statistics
python manage_data.py add-staff \
  --year 2024 \
  --total-staff 28 \
  --full-time 20 \
  --part-time 8 \
  --volunteers 150 \
  --volunteer-hours 5250

# Step 3: List available services to get IDs
python manage_data.py list services

# Step 4: Add service metrics for each service
python manage_data.py add-service-metric \
  --year 2024 --service-id 1 --beneficiaries 850 --sessions 52 --hours 416
python manage_data.py add-service-metric \
  --year 2024 --service-id 2 --beneficiaries 450 --sessions 26 --hours 208
python manage_data.py add-service-metric \
  --year 2024 --service-id 3 --beneficiaries 200 --sessions 12 --hours 96

# Step 5: View all collected data
echo "=== 2024 Financial Summary ==="
python manage_data.py list annual_financials --year 2024

echo "=== 2024 Staff Summary ==="
python manage_data.py list staff_statistics --year 2024

echo "=== 2024 Service Metrics ==="
python manage_data.py list service_metrics --year 2024

echo "=== All Board Members ==="
python manage_data.py list board_members

echo "=== All Partners ==="
python manage_data.py list partners


# =============================================================================
# COMMON WORKFLOWS
# =============================================================================

# WORKFLOW 1: Interactive data entry session
# Run commands with --interactive flag and follow prompts
python manage_data.py add-financial --year 2024 --interactive
python manage_data.py add-staff --year 2024 --interactive
python manage_data.py add-service-metric --year 2024 --service-id 1 --interactive

# WORKFLOW 2: Automated data loading from scripts
# Run from a parent script with all parameters
python manage_data.py add-financial --year 2024 --revenue 2500000 --expenses 2000000
python manage_data.py add-staff --year 2024 --total-staff 28 --full-time 20

# WORKFLOW 3: Data verification and audit
python manage_data.py list annual_financials --year 2024
python manage_data.py list staff_statistics --year 2024
python manage_data.py list service_metrics --year 2024

# WORKFLOW 4: Incremental data updates
# Update financial data with new expense figures
python manage_data.py add-financial --year 2024 --expenses 2050000
# Verify the update
python manage_data.py list annual_financials --year 2024


# =============================================================================
# NOTES
# =============================================================================

# - All scripts assume you're in the scripts directory or have .env in parent
# - Environment variables SUPABASE_URL and SUPABASE_KEY must be set
# - Dates must be in YYYY-MM-DD format
# - Use --interactive flag for guided data entry with validation
# - Use list command to verify data after adding
# - Fields marked optional can be skipped with empty Enter

