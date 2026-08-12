@echo off
cd /d "%~dp0"
if not exist "public\videos" mkdir "public\videos"
copy /y "videos\*" "public\videos\" >nul 2>&1
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"
npm run dev
