#!/bin/bash

# run.sh - Start both Frontend and Backend for Acad AI
# Usage: ./run.sh

set -e

echo "=========================================="
echo "   Starting Acad AI Application"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store PIDs in a file for teardown
PID_FILE="./.app-pids"
rm -f "$PID_FILE"

# Function to handle cleanup on error
cleanup_on_error() {
    echo ""
    echo -e "${YELLOW}Error occurred. Cleaning up...${NC}"
    if [ -f "$PID_FILE" ]; then
        ./teardown.sh
    fi
    exit 1
}

trap cleanup_on_error ERR

# Check if ports are already in use
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Port $port is already in use by another process${NC}"
        echo "   This might be from a previous $service instance."
        echo "   Run ./teardown.sh first or kill the process manually."
        return 1
    fi
    return 0
}

echo -e "${BLUE}Checking ports...${NC}"
check_port 9002 "Frontend" || exit 1
check_port 8000 "Backend" || exit 1

echo ""
echo -e "${GREEN}✓ Ports are available${NC}"
echo ""

# Start Backend
echo -e "${BLUE}Starting Backend (Python FastAPI)...${NC}"
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start backend in background
echo "Starting backend server on http://localhost:8000"
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "BACKEND_PID=$BACKEND_PID" >> "../$PID_FILE"
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "  Logs: backend.log"

cd ..

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo ""
echo -e "${BLUE}Starting Frontend (Next.js)...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Dependencies not found. Installing...${NC}"
    npm install
fi

# Start frontend in background
echo "Starting frontend server on http://localhost:9002"
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "FRONTEND_PID=$FRONTEND_PID" >> "$PID_FILE"
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "  Logs: frontend.log"

echo ""
echo "=========================================="
echo -e "${GREEN}   ✓ Acad AI is running!${NC}"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:9002"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Process IDs saved to: $PID_FILE"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  Frontend: tail -f frontend.log"
echo "  Backend:  tail -f backend.log"
echo ""
echo -e "${YELLOW}To stop the application:${NC}"
echo "  ./teardown.sh"
echo ""
echo "=========================================="
