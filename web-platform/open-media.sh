#!/bin/bash

# Quick launcher - opens media library in browser

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Dev server is not running on port 3000"
  echo "   Start it with: ./start-dev.sh"
  exit 1
fi

echo "✅ Server is running"
echo "🌐 Opening media library in browser..."
echo ""
echo "Opening routes:"
echo "   📍 Media Hub: http://localhost:3000/picc/media"

# Open in default browser
open "http://localhost:3000/picc/media"

echo ""
echo "✨ Browser opened!"
echo "   If it doesn't open automatically, visit:"
echo "   http://localhost:3000/picc/media"
