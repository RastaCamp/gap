@echo off
title GridStatus API
cd /d "%~dp0"
echo Starting API (port 3006)...
start "GridStatus API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting Frontend (port 5178)...
start "GridStatus Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5178
echo Done. Close the two command windows to stop.
