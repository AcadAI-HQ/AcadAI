#!/bin/bash

# teardown.sh - Stop both Frontend and Backend for Acad AI
# Usage: ./teardown.sh

echo "=========================================="
echo "   Stopping Acad AI Application"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PID_FILE="./.app-pids"

# Function to kill process and its children
kill_process_tree() {
    local pid=$1
    local name=$2

    if [ -z "$pid" ]; then
        return
    fi

    # Check if process exists
    if ! ps -p $pid > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $name process (PID: $pid) not found${NC}"
        return
    fi

    # Get all child processes
    local children=$(pgrep -P $pid)

    # Kill children first
    if [ ! -z "$children" ]; then
        echo "Stopping $name child processes..."
        for child in $children; do
            kill $child 2>/dev/null || true
        done
    fi

    # Kill main process
    echo "Stopping $name (PID: $pid)..."
    kill $pid 2>/dev/null || true

    # Wait a moment
    sleep 1

    # Force kill if still running
    if ps -p $pid > /dev/null 2>&1; then
        echo "Force stopping $name..."
        kill -9 $pid 2>/dev/null || true
    fi

    echo -e "${GREEN}✓ $name stopped${NC}"
}

# Read PIDs from file if exists
if [ -f "$PID_FILE" ]; then
    echo "Reading process IDs from $PID_FILE..."
    source "$PID_FILE"

    # Stop Backend
    if [ ! -z "$BACKEND_PID" ]; then
        kill_process_tree $BACKEND_PID "Backend"
    fi

    # Stop Frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        kill_process_tree $FRONTEND_PID "Frontend"
    fi

    # Remove PID file
    rm -f "$PID_FILE"
    echo -e "${GREEN}✓ Removed PID file${NC}"
else
    echo -e "${YELLOW}No PID file found. Attempting to find and kill processes...${NC}"
    echo ""

    # Try to find and kill processes by port

    # Kill Frontend (port 9002)
    FRONTEND_PIDS=$(lsof -ti:9002 2>/dev/null)
    if [ ! -z "$FRONTEND_PIDS" ]; then
        echo "Found Frontend processes on port 9002"
        for pid in $FRONTEND_PIDS; do
            kill_process_tree $pid "Frontend (port 9002)"
        done
    else
        echo "No Frontend process found on port 9002"
    fi

    # Kill Backend (port 8000)
    BACKEND_PIDS=$(lsof -ti:8000 2>/dev/null)
    if [ ! -z "$BACKEND_PIDS" ]; then
        echo "Found Backend processes on port 8000"
        for pid in $BACKEND_PIDS; do
            kill_process_tree $pid "Backend (port 8000)"
        done
    else
        echo "No Backend process found on port 8000"
    fi
fi

# Also kill any remaining Node/Python processes that might be hanging
echo ""
echo "Cleaning up any remaining processes..."

# Kill remaining Next.js dev server processes
NEXTJS_PIDS=$(pgrep -f "next dev" 2>/dev/null)
if [ ! -z "$NEXTJS_PIDS" ]; then
    echo "Found remaining Next.js processes"
    for pid in $NEXTJS_PIDS; do
        kill $pid 2>/dev/null || true
    done
fi

# Kill remaining uvicorn processes
UVICORN_PIDS=$(pgrep -f "uvicorn app.main:app" 2>/dev/null)
if [ ! -z "$UVICORN_PIDS" ]; then
    echo "Found remaining Uvicorn processes"
    for pid in $UVICORN_PIDS; do
        kill $pid 2>/dev/null || true
    done
fi

sleep 1

echo ""
echo "=========================================="
echo -e "${GREEN}   ✓ Acad AI stopped successfully${NC}"
echo "=========================================="
echo ""

# Check if ports are now free
echo "Verifying ports are free..."
if lsof -Pi :9002 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}⚠️  Port 9002 is still in use${NC}"
else
    echo -e "${GREEN}✓ Port 9002 is free${NC}"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}⚠️  Port 8000 is still in use${NC}"
else
    echo -e "${GREEN}✓ Port 8000 is free${NC}"
fi

echo ""
