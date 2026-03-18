@echo off
title NeighborhoodScore API
cd /d "%~dp0"
echo Starting API (port 3009)...
start "NeighborhoodScore API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting Frontend (port 5181)...
start "NeighborhoodScore Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5181
echo Done. Close the two command windows to stop.
