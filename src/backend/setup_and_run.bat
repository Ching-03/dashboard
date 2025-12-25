@echo off
echo ========================================
echo Flask Backend Setup and Run
echo ========================================
echo.

echo [1/3] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found! Install Python first.
    pause
    exit /b 1
)
echo.

echo [2/3] Installing dependencies...
python -m pip install --upgrade pip
python -m pip install flask flask-cors mysql-connector-python python-dotenv
echo.

echo [3/3] Starting Flask backend...
echo Backend will run on http://localhost:5000
echo Press Ctrl+C to stop
echo.
python app.py
