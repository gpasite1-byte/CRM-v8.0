@echo off
chcp 65001 >nul
title SINCRONIZAR GITHUB - GPA ANGOLA CRM V8.0 PRO
echo ====================================================================
echo    GPA ANGOLA CRM v8.0 PRO - SINCRONIZADOR DE REPOSITÓRIO GITHUB
echo ====================================================================
echo.
echo 1. A inicializar e adicionar ficheiros ao Git local...
git init
git add .
git commit -m "GPA Angola CRM v8.0 PRO - Sincronizacao Global 13 Views, Temporal Engine 10 Anos, Video Hero & Excel Distributor"
git branch -M main

echo.
echo ====================================================================
echo   PASSO PARA PUBLICAR NO GITHUB:
echo   Caso ja tenha criado um repositorio no GitHub (github.com/new),
echo   cole aqui a URL do seu repositorio (ex: https://github.com/SEU-USUARIO/gpa-crm.git)
echo ====================================================================
echo.
set /p REPO_URL="Cole a URL do seu repositorio no GitHub (ou pressione ENTER se desejar apenas salvar localmente): "

if not "%REPO_URL%"=="" (
    echo.
    echo A associar repositorio remoto (%REPO_URL%)...
    git remote remove origin >nul 2>&1
    git remote add origin %REPO_URL%
    echo A enviar codigo para a branch main no GitHub...
    git push -u origin main --force
    echo.
    echo ====================================================================
    echo   [SUCESSO] O seu projeto GPA CRM foi enviado para o GitHub!
    echo ====================================================================
) else (
    echo.
    echo [OK] Commit local concluido com sucesso!
)

echo.
pause
