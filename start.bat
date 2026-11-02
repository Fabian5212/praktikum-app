@echo off
rem Startet die App lokal unter http://localhost:3000 (braucht Node.js)
cd /d "%~dp0"
start "" http://localhost:3000
npx --yes serve . -l 3000
