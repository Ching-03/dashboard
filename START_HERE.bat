@echo off
echo ========================================
echo Dashboard Full Stack Startup
echo ========================================
echo.
echo This will:
echo 1. Install Python dependencies
echo 2. Start Flask backend (port 5000)
echo 3. Start React frontend (port 5173)
echo.
pause

cd src\backend
start cmd /k "setup_and_run.bat"

cd ..\..
timeout /t 3 /nobreak > nul

echo.
echo Starting frontend...
npm run vite
