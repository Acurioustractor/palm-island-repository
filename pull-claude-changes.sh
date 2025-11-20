#!/bin/bash
# Easy script to pull Claude's changes - just run ./pull-claude-changes.sh

echo "🔄 Pulling Claude's latest changes..."

# Get the current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Fetch all changes
git fetch origin

# Force pull from remote (overwrites local with remote)
git reset --hard origin/$CURRENT_BRANCH

echo "✅ Done! Your local folder now matches what Claude pushed."
echo ""
echo "📁 Files updated in this pull:"
git diff --name-only HEAD@{1} HEAD 2>/dev/null || echo "First pull - all files are new"
