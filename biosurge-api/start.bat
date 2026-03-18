@echo off
title BioSurge API
cd /d "%~dp0"
echo Starting API (port 3008)...
start "BioSurge API" cmd /k "bun run dev"
timeout /t 2 /nobreak >nul
echo Starting Frontend (port 5180)...
start "BioSurge Frontend" cmd /k "cd frontend && bun install && bun run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5180
echo Done. Close the two command windows to stop.
