@echo off
chcp 65001 >nul
title ENVIAR PARA O GITHUB - GPA ANGOLA CRM v8.0 PRO
echo ===================================================
echo   ENVIANDO VERSAO ATUAL PARA O GITHUB / VERCEL
echo ===================================================
echo.
cd /d "%~dp0"

if not exist "public\videos" mkdir "public\videos"
copy /y "videos\*" "public\videos\" >nul 2>&1

if not exist "src\assets\videos" mkdir "src\assets\videos"
copy /y "videos\*" "src\assets\videos\" >nul 2>&1

echo.
echo Adicionando alterações ao git...
git add .

echo Criando commit da versão atual...
git commit -m "GPA Angola CRM v8.0 PRO - Atualizacao e otimizacao de ficheiros"

echo Enviando a versão para o GitHub (Vercel)...
git push origin main

echo.
echo ===================================================
echo ENVIADO COM SUCESSO! O VERCEL VAI ATUALIZAR AGORA!
echo ===================================================
pause

