@echo off
cd src\backend
call .\venv\Scripts\activate
set FLASK_APP=app.py
set FLASK_ENV=development
start cmd /k "flask run"
cd ..\..
npm run dev
