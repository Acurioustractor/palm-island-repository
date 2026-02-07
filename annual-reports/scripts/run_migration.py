#!/usr/bin/env python3
"""Run the annual report migration on Supabase."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

try:
    from supabase import create_client
except ImportError:
    print("Install: pip install supabase")
    exit(1)

# Get credentials
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    print("Missing SUPABASE credentials in .env")
    exit(1)

print(f"Connecting to: {url}")
client = create_client(url, key)

# Read migration SQL
migration_file = Path(__file__).parent / "migrations" / "001_annual_report_fields.sql"
if not migration_file.exists():
    print(f"Migration file not found: {migration_file}")
    exit(1)

migration_sql = migration_file.read_text()

print("\nMigration SQL to run:")
print("-" * 50)
# Show just the ALTER TABLE statements
for line in migration_sql.split('\n'):
    if line.strip().startswith(('ALTER TABLE', 'CREATE INDEX', 'CREATE VIEW', 'COMMENT')):
        print(line[:80] + "..." if len(line) > 80 else line)
print("-" * 50)

print("\n⚠️  Note: Supabase Python client can't run DDL directly.")
print("Please run the migration in Supabase SQL Editor:")
print(f"  File: {migration_file}")
print("\nOr copy from: annual-reports/scripts/migrations/001_annual_report_fields.sql")
