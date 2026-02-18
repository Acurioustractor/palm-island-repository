#!/bin/bash
# PICC Dev Server — persistent, self-managing
# Usage:
#   ./dev-server.sh          Start (or restart) the dev server
#   ./dev-server.sh stop     Stop the server
#   ./dev-server.sh restart  Kill + restart
#   ./dev-server.sh status   Check if running
#   ./dev-server.sh rebuild  Clear cache + restart
#   ./dev-server.sh logs     Tail the log

set -euo pipefail

PORT="${PICC_DEV_PORT:-3004}"
DIR="$(cd "$(dirname "$0")" && pwd)"
PIDFILE="$DIR/.dev-server.pid"
LOGFILE="$DIR/.dev-server.log"

cd "$DIR"

kill_server() {
  # Kill by PID file
  if [ -f "$PIDFILE" ]; then
    local pid
    pid=$(cat "$PIDFILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping dev server (PID $pid)..."
      kill "$pid" 2>/dev/null || true
      sleep 2
      kill -9 "$pid" 2>/dev/null || true
    fi
    rm -f "$PIDFILE"
  fi
  # Kill anything else on the port
  local pids
  pids=$(lsof -ti :"$PORT" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Killing processes on port $PORT: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

start_server() {
  # Check if already running
  if [ -f "$PIDFILE" ]; then
    local pid
    pid=$(cat "$PIDFILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Dev server already running (PID $pid) on http://localhost:$PORT"
      echo "Use './dev-server.sh restart' to restart, or './dev-server.sh rebuild' to clear cache + restart"
      return 0
    fi
    rm -f "$PIDFILE"
  fi

  # Free the port
  local pids
  pids=$(lsof -ti :"$PORT" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Port $PORT in use — freeing it..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi

  echo "Starting dev server on http://localhost:$PORT ..."
  echo "Logs: $LOGFILE"

  # Start in background, capture PID
  nohup npx next dev -p "$PORT" > "$LOGFILE" 2>&1 &
  local server_pid=$!
  echo "$server_pid" > "$PIDFILE"

  # Wait for ready
  echo -n "Waiting for server"
  local attempts=0
  while [ $attempts -lt 30 ]; do
    if curl -s -o /dev/null -w "" "http://localhost:$PORT" 2>/dev/null; then
      echo ""
      echo "Dev server ready on http://localhost:$PORT (PID $server_pid)"
      return 0
    fi
    echo -n "."
    sleep 2
    attempts=$((attempts + 1))
  done

  echo ""
  echo "Server started (PID $server_pid) but may still be compiling."
  echo "Check: tail -f $LOGFILE"
}

case "${1:-start}" in
  start)
    start_server
    ;;
  stop)
    kill_server
    echo "Dev server stopped."
    ;;
  restart)
    kill_server
    start_server
    ;;
  rebuild)
    echo "Clearing .next cache..."
    kill_server
    rm -rf "$DIR/.next"
    start_server
    ;;
  status)
    if [ -f "$PIDFILE" ]; then
      pid=$(cat "$PIDFILE")
      if kill -0 "$pid" 2>/dev/null; then
        echo "Running (PID $pid) on http://localhost:$PORT"
        exit 0
      fi
    fi
    # Check port directly
    pids=$(lsof -ti :"$PORT" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "Something is on port $PORT (PIDs: $pids) but no PID file"
      exit 0
    fi
    echo "Not running"
    exit 1
    ;;
  logs)
    if [ -f "$LOGFILE" ]; then
      tail -f "$LOGFILE"
    else
      echo "No log file found at $LOGFILE"
      exit 1
    fi
    ;;
  *)
    echo "Usage: ./dev-server.sh [start|stop|restart|rebuild|status|logs]"
    exit 1
    ;;
esac
