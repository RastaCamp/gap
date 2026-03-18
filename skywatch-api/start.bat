@echo off
title SkyWatch API
cd /d "%~dp0"
echo Starting API (port 3004)...
start "SkyWatch API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting Frontend (port 5176)...
start "SkyWatch Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5176
echo Done. Close the two command windows to stop.
