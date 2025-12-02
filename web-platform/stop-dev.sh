#!/bin/bash

# Stop all dev servers

echo "🛑 Stopping all dev servers..."

# Kill processes on ports 3000 and 3001
lsof -ti:3000 -ti:3001 | xargs kill -9 2>/dev/null

sleep 1

# Check if stopped
if lsof -ti:3000 -ti:3001 > /dev/null 2>&1; then
  echo "❌ Failed to stop some servers"
  echo "   Run: lsof -i:3000 -i:3001"
  exit 1
else
  echo "✅ All dev servers stopped"
  echo "   Ports 3000 and 3001 are now free"
fi
