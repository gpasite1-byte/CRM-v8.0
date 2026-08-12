@echo off
title GPA ANGOLA CRM v8.0 PRO
echo ===================================================
echo     INICIANDO GPA ANGOLA CRM v8.0 PRO
echo ===================================================
echo.
cd /d "%~dp0"
if not exist "public\videos" mkdir "public\videos"
copy /y "videos\*" "public\videos\" >nul 2>&1
echo Iniciar o servidor Express + Vite na porta 3000...
echo.
echo Abrindo o navegador em http://localhost:3000 ...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
npm run dev
pause
