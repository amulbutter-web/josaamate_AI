@echo off
echo ===================================================
echo   Starting JOSAA MATE AI Platform
echo   "Your Rank. Your Choices. Your Future."
echo ===================================================
start "JOSAA MATE AI - Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 2 /nobreak >nul
start "JOSAA MATE AI - Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo Services launched!
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo ===================================================
