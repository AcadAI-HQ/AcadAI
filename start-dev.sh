#!/bin/bash
# Development startup script for Linux/Mac
# Starts both backend and frontend

echo "Starting Acad AI Development Environment..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping all servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "All servers stopped."
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup INT TERM

# Start backend
echo "Starting backend server..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Acad AI Development Environment Started"
echo "========================================"
echo ""
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Frontend: http://localhost:9002"
echo ""
echo "Press Ctrl+C to stop all servers..."
echo ""

# Wait for processes
wait
