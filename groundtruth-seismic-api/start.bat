@echo off
title GroundTruth Seismic API
cd /d "%~dp0"
echo Starting API (port 3003)...
start "GroundTruth API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting Frontend (port 5175)...
start "GroundTruth Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5175
echo Done. Close the two command windows to stop.
