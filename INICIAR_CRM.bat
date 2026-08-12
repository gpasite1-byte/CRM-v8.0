@echo off
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
echo A iniciar o servidor CRM (Node + Vite)...
echo.
echo A aguardar 6 segundos para o servidor arrancar...
timeout /t 6 /nobreak >nul
echo.
echo A abrir o navegador em http://localhost:3000 ...
start http://localhost:3000
echo.
npm run dev
pause
