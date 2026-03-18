@echo off
title FoodSafe API
cd /d "%~dp0"
echo Starting FoodSafe API (port 3001)...
start "FoodSafe API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting FoodSafe Frontend (port 5173)...
start "FoodSafe Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
echo Opening browser...
start http://localhost:5173
echo Done. Close the two command windows to stop.
