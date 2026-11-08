@echo off
title DACN2 FastAPI AI Backend
echo ===================================================
echo     DANG KHOI DONG FASTAPI AI BACKEND (PORT 8000)
echo ===================================================
cd /d "%~dp0"
echo Thu muc hien tai: %CD%
echo Khoi chay Uvicorn...
"..\.venv\Scripts\uvicorn.exe" app.main:app --host 0.0.0.0 --port 8000 --reload
pause