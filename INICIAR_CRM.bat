@echo off
chcp 65001 >nul
title GPA ANGOLA CRM v8.0 PRO
echo ===================================================
echo     INICIANDO GPA ANGOLA CRM v8.0 PRO
echo ===================================================
echo.
cd /d "%~dp0"
echo A libertar portas e processos antigos...
taskkill /F /IM node.exe >nul 2>&1

if not exist "public\videos" mkdir "public\videos"
copy /y "videos\*" "public\videos\" >nul 2>&1

echo.
echo A agendar a abertura automatica do navegador...
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

echo.
echo A iniciar o servidor CRM (Node + Vite)...
echo.
npm run dev
pause
