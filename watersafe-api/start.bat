@echo off
title WaterSafe API
cd /d "%~dp0"
echo Starting API (port 3005)...
start "WaterSafe API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting Frontend (port 5177)...
start "WaterSafe Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5177
echo Done. Close the two command windows to stop.
