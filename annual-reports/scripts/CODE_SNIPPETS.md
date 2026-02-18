# Code Snippets & Reference

Quick code references for common tasks with validate_data.py.

## Running the Script

### Python
```python
import subprocess
import sys

# Run validation
result = subprocess.run(
    [sys.executable, "validate_data.py", "--year", "2024"],
    cwd="/path/to/scripts"
)

if result.returncode == 0:
    print("Database is ready!")
else:
    print("Database has issues, fix and try again")
```

### Bash
```bash
#!/bin/bash

# Simple check
python validate_data.py --year 2024

# Use exit code
if python validate_data.py --year 2024; then
    echo "Ready to generate report"
    python assemble_content.py --year 2024
else
    echo "Fix database first"
    exit 1
fi
```

### Shell Script with Logging
```bash
#!/bin/bash

YEAR=${1:-$(date +%Y)}
LOG_FILE="validation_${YEAR}.log"

echo "Validating database for ${YEAR}..." | tee -a "$LOG_FILE"
python validate_data.py --year "$YEAR" | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "Validation passed!" >> "$LOG_FILE"
    exit 0
else
    echo "Validation failed - see output above" >> "$LOG_FILE"
    exit 1
fi
```

## GitHub Actions Integration

```yaml
name: Validate Annual Report Database

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          cd annual-reports/scripts
          pip install supabase python-dotenv
      
      - name: Validate database
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: |
          cd annual-reports/scripts
          python validate_data.py --year 2024
      
      - name: Notify if failed
        if: failure()
        run: echo "Database validation failed"
```

## GitLab CI Integration

```yaml
validate_database:
  stage: pre-build
  script:
    - cd annual-reports/scripts
    - pip install supabase python-dotenv
    - python validate_data.py --year 2024
  variables:
    NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY: $SUPABASE_KEY
  only:
    - main
    - develop
```

## Cron Job for Daily Validation

```bash
# In crontab -e
# Run validation daily at 6 AM
0 6 * * * cd /path/to/scripts && python validate_data.py --year $(date +\%Y) >> /var/log/report_validation.log 2>&1

# Run validation and alert if failed
0 6 * * * cd /path/to/scripts && python validate_data.py --year $(date +\%Y) || mail -s "Database validation failed" admin@example.com
```

## Pre-commit Hook

```bash
#!/bin/bash
# Save as .git/hooks/pre-commit and chmod +x

# Only run on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    exit 0
fi

# Run validation
cd annual-reports/scripts
python validate_data.py --year $(date +%Y)

if [ $? -ne 0 ]; then
    echo "Database validation failed. Fix issues before committing."
    exit 1
fi
```

## Python Integration

### Import and Use Directly
```python
# In your Python script
import sys
sys.path.insert(0, '/path/to/scripts')

from validate_data import DataValidator

# Create validator for specific year
validator = DataValidator(2024)

# Run validation
if validator.validate():
    print("Database ready for report generation!")
    # Proceed with report generation
else:
    print("Database has issues:")
    for issue in validator.issues:
        print(f"  - {issue}")
```

### Custom Wrapper
```python
#!/usr/bin/env python3

from validate_data import DataValidator

def validate_and_report(year):
    """Validate database and send report."""
    validator = DataValidator(year)
    is_ready = validator.validate()
    
    # Send email with results
    send_email(
        subject=f"Annual Report Database Status - {year}",
        body=format_email(validator),
        recipients=['admin@example.com']
    )
    
    return is_ready

def format_email(validator):
    """Format validation results for email."""
    email_body = []
    
    for name, passed, details in validator.checks:
        status = "PASS" if passed else "FAIL"
        email_body.append(f"{status}: {name} - {details}")
    
    if validator.issues:
        email_body.append("\nIssues to fix:")
        for issue in validator.issues:
            email_body.append(f"  - {issue}")
    
    return "\n".join(email_body)

if __name__ == "__main__":
    validate_and_report(2024)
```

## Docker Integration

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy script
COPY validate_data.py .

# Set environment variables from build args
ARG SUPABASE_URL
ARG SUPABASE_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY

# Run validation
CMD ["python", "validate_data.py", "--year", "2024"]
```

```bash
# Build and run
docker build \
  --build-arg SUPABASE_URL="https://..." \
  --build-arg SUPABASE_KEY="..." \
  -t annual-report-validator .

docker run annual-report-validator
```

## Makefile Integration

```makefile
.PHONY: validate-db validate-db-2023 validate-db-2024

YEAR ?= $(shell date +%Y)
SCRIPTS_DIR := annual-reports/scripts

validate-db:
	cd $(SCRIPTS_DIR) && python validate_data.py --year $(YEAR)

validate-db-2023:
	cd $(SCRIPTS_DIR) && python validate_data.py --year 2023

validate-db-2024:
	cd $(SCRIPTS_DIR) && python validate_data.py --year 2024

validate-db-all: validate-db-2023 validate-db-2024
	@echo "All validations complete"

# Pre-generate target
pre-generate: validate-db
	cd $(SCRIPTS_DIR) && python assemble_content.py --year $(YEAR)
	cd $(SCRIPTS_DIR) && python generate_pdf.py --year $(YEAR)

# Usage: make validate-db or make validate-db YEAR=2023
```

## NPM/Node Integration

```javascript
// scripts/validate-db.js
const { spawn } = require('child_process');
const path = require('path');

function validateDatabase(year = new Date().getFullYear()) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../annual-reports/scripts');
        
        const process = spawn('python', [
            'validate_data.py',
            '--year',
            year.toString()
        ], {
            cwd: scriptPath,
            stdio: 'inherit'
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve(true);
            } else {
                reject(new Error('Database validation failed'));
            }
        });
    });
}

// In package.json
"scripts": {
    "validate:db": "node scripts/validate-db.js",
    "generate:report": "npm run validate:db && python annual-reports/scripts/assemble_content.py"
}
```

## Error Handling Examples

### Catch and Handle Errors
```python
import sys
import subprocess

try:
    result = subprocess.run(
        [sys.executable, "validate_data.py", "--year", "2024"],
        capture_output=True,
        text=True,
        timeout=30
    )
    
    print("Output:")
    print(result.stdout)
    
    if result.returncode != 0:
        print("Errors:")
        print(result.stderr)
        sys.exit(1)
        
except subprocess.TimeoutExpired:
    print("Validation timed out")
    sys.exit(1)
except FileNotFoundError:
    print("validate_data.py not found")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error: {e}")
    sys.exit(1)
```

### Retry Logic
```python
import time

def validate_with_retry(year, max_retries=3, delay=5):
    """Validate with retry logic."""
    for attempt in range(max_retries):
        try:
            result = subprocess.run(
                [sys.executable, "validate_data.py", "--year", str(year)],
                timeout=30,
                check=False
            )
            
            if result.returncode == 0:
                return True
            
            print(f"Validation attempt {attempt + 1} failed")
            
            if attempt < max_retries - 1:
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
        
        except Exception as e:
            print(f"Error on attempt {attempt + 1}: {e}")
    
    return False

# Usage
if validate_with_retry(2024):
    print("Database ready!")
else:
    print("Failed after retries")
```

## Testing the Script

### Unit Test Example
```python
import unittest
from validate_data import DataValidator, Colors, colorize

class TestValidateData(unittest.TestCase):
    def test_colorize(self):
        """Test color formatting."""
        result = colorize("test", Colors.GREEN)
        self.assertIn(Colors.GREEN, result)
        self.assertIn("test", result)
    
    def test_validator_init(self):
        """Test validator initialization."""
        validator = DataValidator(2024)
        self.assertEqual(validator.year, 2024)
        self.assertIsNone(validator.client)
    
    def test_add_check(self):
        """Test adding checks."""
        validator = DataValidator(2024)
        validator.add_check("Test check", True, "Details")
        self.assertEqual(len(validator.checks), 1)
    
    def test_add_issue(self):
        """Test adding issues."""
        validator = DataValidator(2024)
        validator.add_issue("Test issue", "Test suggestion")
        self.assertEqual(len(validator.issues), 1)
        self.assertEqual(len(validator.suggestions), 1)

if __name__ == '__main__':
    unittest.main()
```

## Monitoring & Alerting

### Send Alert Email
```python
import smtplib
from email.mime.text import MIMEText

def send_validation_alert(validator, to_email):
    """Send email alert if validation fails."""
    
    if not validator.issues:
        return  # No issues, no alert needed
    
    msg = MIMEText(format_issues(validator.issues))
    msg['Subject'] = f'Database Validation Failed - {len(validator.issues)} issues'
    msg['From'] = 'reports@example.com'
    msg['To'] = to_email
    
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login('username', 'password')
        server.send_message(msg)

def format_issues(issues):
    """Format issues for email."""
    return "\n".join([f"- {issue}" for issue in issues])

# Usage
validator = DataValidator(2024)
validator.validate()
send_validation_alert(validator, 'admin@example.com')
```

### Slack Integration
```python
import requests

def send_slack_notification(validator, webhook_url):
    """Send validation results to Slack."""
    
    if validator.issues:
        color = "danger"
        message = f"{len(validator.issues)} issues found"
    else:
        color = "good"
        message = "All checks passed"
    
    payload = {
        "attachments": [
            {
                "color": color,
                "title": "Annual Report Database Validation",
                "text": message,
                "fields": [
                    {
                        "title": "Year",
                        "value": str(validator.year),
                        "short": True
                    },
                    {
                        "title": "Issues",
                        "value": str(len(validator.issues)),
                        "short": True
                    }
                ]
            }
        ]
    }
    
    requests.post(webhook_url, json=payload)

# Usage
send_slack_notification(validator, os.getenv('SLACK_WEBHOOK_URL'))
```

