@echo off
chcp 65001 >nul
title GPA ANGOLA CRM v8.0 PRO
echo ===================================================
echo     GPA ANGOLA CRM v8.0 PRO - INICIANDO
echo ===================================================
echo.
cd /d "%~dp0"
echo A libertar portas e processos antigos...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo A preparar ficheiros de video, pastas de documentos e assets...

if not exist "public\videos" mkdir "public\videos"
copy /y "videos\*" "public\videos\" >nul 2>&1

if not exist "src\assets\videos" mkdir "src\assets\videos"
copy /y "videos\*" "src\assets\videos\" >nul 2>&1

if exist "scripts\sync_documentos_folders.js" node "scripts\sync_documentos_folders.js" >nul 2>&1

echo.
echo A agendar a abertura automatica do navegador...
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

echo.
echo A iniciar o servidor CRM (Node + Vite)...
echo.
npm run dev
pause
