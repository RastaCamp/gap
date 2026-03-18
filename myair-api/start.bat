@echo off
title MyAir API
cd /d "%~dp0"
echo Starting MyAir API (port 3002)...
start "MyAir API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting MyAir Frontend (port 5174)...
start "MyAir Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5174
echo Done. Close the two command windows to stop.
