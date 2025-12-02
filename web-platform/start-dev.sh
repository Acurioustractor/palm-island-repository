#!/bin/bash

# Clean Dev Server Startup Script
# This script ensures clean startup every time - no port conflicts, no multiple servers

cd "/Volumes/OS_FIELD_B/Code/Palm Island Reposistory/web-platform"

echo "=========================================="
echo "🚀 Starting Palm Island Dev Server"
echo "=========================================="
echo ""

# Step 1: Kill any existing servers
echo "🧹 Step 1: Cleaning up existing servers..."
lsof -ti:3000 -ti:3001 | xargs kill -9 2>/dev/null
sleep 1
echo "   ✅ Ports 3000 and 3001 cleared"
echo ""

# Step 2: Verify environment
echo "🔍 Step 2: Checking environment..."
if [ ! -f .env.local ]; then
  echo "   ❌ ERROR: .env.local not found!"
  echo "   Please create .env.local with your Supabase credentials"
  exit 1
fi

ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d"=" -f2)
if [ -z "$ANON_KEY" ]; then
  echo "   ❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY not set in .env.local"
  exit 1
fi

echo "   ✅ Environment configured"
echo ""

# Step 3: Start dev server on port 3000
echo "🔧 Step 3: Starting Next.js dev server on port 3000..."
PORT=3000 npm run dev > /tmp/palm-island-dev.log 2>&1 &
DEV_PID=$!
echo "   Server PID: $DEV_PID"
echo ""

# Step 4: Wait for server to be ready
echo "⏳ Step 4: Waiting for server to be ready..."
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Server is ready!"
    break
  fi
  sleep 1
  WAITED=$((WAITED + 1))
  echo "   ⏳ Waiting... ($WAITED/$MAX_WAIT seconds)"
done

if [ $WAITED -ge $MAX_WAIT ]; then
  echo "   ❌ Server failed to start within $MAX_WAIT seconds"
  echo "   Check logs: tail -f /tmp/palm-island-dev.log"
  kill $DEV_PID 2>/dev/null
  exit 1
fi
echo ""

# Step 5: Test critical routes
echo "🧪 Step 5: Testing critical routes..."
test_route() {
  ROUTE=$1
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$ROUTE" 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "   ✅ $ROUTE (HTTP $STATUS)"
  else
    echo "   ⚠️  $ROUTE (HTTP $STATUS)"
  fi
}

test_route "/picc/media"
test_route "/picc/media/gallery"
test_route "/picc/media/collections"
test_route "/picc/media/smart-folders"
test_route "/picc/media/upload"
echo ""

# Step 6: Display access information
echo "=========================================="
echo "✅ Dev Server Running Successfully!"
echo "=========================================="
echo ""
echo "📍 Access your app at:"
echo "   🏠 Media Library Hub:    http://localhost:3000/picc/media"
echo "   📸 Photo Gallery:        http://localhost:3000/picc/media/gallery"
echo "   📁 Collections:          http://localhost:3000/picc/media/collections"
echo "   ⚡ Smart Folders:        http://localhost:3000/picc/media/smart-folders"
echo "   📤 Upload:               http://localhost:3000/picc/media/upload"
echo ""
echo "📊 Server Info:"
echo "   Port:      3000"
echo "   PID:       $DEV_PID"
echo "   Logs:      /tmp/palm-island-dev.log"
echo ""
echo "🛑 To stop the server:"
echo "   kill $DEV_PID"
echo "   or: ./stop-dev.sh"
echo ""
echo "📝 Watch logs:"
echo "   tail -f /tmp/palm-island-dev.log"
echo ""
echo "=========================================="
echo ""

# Step 7: Optional - Open browser (commented out by default)
# Uncomment the line below to auto-open browser
# open "http://localhost:3000/picc/media"

# Keep script running to show PID
echo "✨ Server is running. Press Ctrl+C to stop (will kill PID $DEV_PID)"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping server...'; kill $DEV_PID 2>/dev/null; echo '✅ Server stopped'; exit 0" INT TERM

# Keep running
tail -f /tmp/palm-island-dev.log
