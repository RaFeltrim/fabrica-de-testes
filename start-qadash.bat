@echo off
REM QADash - Quick Start Script
REM Starts both backend and frontend services

echo ========================================
echo    QADash - Test Automation Dashboard
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Checking backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)

echo.
echo [2/4] Checking database...
if not exist "database\qadash.db" (
    echo Creating database...
    call npm run migrate
)

echo.
echo [3/4] Starting backend server...
start "QADash Backend" cmd /k "cd /d %cd% && npm run dev"
timeout /t 3 /nobreak >nul

cd ..

echo.
echo [4/4] Starting frontend dashboard...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

start "QADash Frontend" cmd /k "cd /d %cd% && npm run dev"

echo.
echo ========================================
echo    QADash is starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Two terminal windows will open:
echo   1. Backend Server (port 3001)
echo   2. Frontend Dashboard (port 5173)
echo.
echo Wait a few seconds, then open:
echo http://localhost:5173
echo.
echo To stop the servers, close both terminal windows.
echo ========================================
echo.

timeout /t 5 /nobreak >nul
start http://localhost:5173

pause
