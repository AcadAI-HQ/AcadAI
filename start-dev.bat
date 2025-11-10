@echo off
REM Development startup script for Windows
REM Starts both backend and frontend in separate windows

echo Starting Acad AI Development Environment...
echo.

REM Start backend
echo Starting backend server...
start "Acad AI Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend
echo Starting frontend server...
start "Acad AI Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Acad AI Development Environment Started
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Frontend: http://localhost:9002
echo.
echo Press any key to stop all servers...
pause > nul

REM Kill all node and python processes (be careful!)
taskkill /FI "WINDOWTITLE eq Acad AI Backend*" /T /F
taskkill /FI "WINDOWTITLE eq Acad AI Frontend*" /T /F

echo All servers stopped.
