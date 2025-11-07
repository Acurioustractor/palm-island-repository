#!/bin/bash

################################################################################
# PULL LATEST CHANGES - Run this to get the latest files in VS Code
################################################################################

echo "🔄 Pulling latest changes from branch: claude/repo-review-011CUuHcsYJgU4VfdKJVrJUV"
echo ""

# Make sure we're on the right branch
git checkout claude/repo-review-011CUuHcsYJgU4VfdKJVrJUV

# Pull latest changes
git pull origin claude/repo-review-011CUuHcsYJgU4VfdKJVrJUV

echo ""
echo "✅ Done! Latest files are now in your workspace."
echo ""
echo "📂 New/Updated files you should see:"
echo "   - START_HERE_ENV_SETUP.md"
echo "   - FILE_MAP.md"
echo "   - web-platform/ENV_SETUP_GUIDE.md"
echo "   - web-platform/scripts/check-env.js"
echo "   - web-platform/.env.local.example"
echo ""
echo "🎯 Next: Open START_HERE_ENV_SETUP.md in VS Code"
