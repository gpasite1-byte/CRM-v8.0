@echo off
chcp 65001 >nul
title PUBLICAR NO GITHUB
echo ====================================================================
echo   RESOLVENDO PROBLEMA DO GITHUB E ENVIANDO PROJETO
echo ====================================================================
echo.
echo 1. Adicionando as alteracoes...
git add .

echo.
echo 2. Salvando as alteracoes localmente...
git commit -m "Atualizacao do CRM"

echo.
echo 3. Garantindo que a branch principal e a 'main'...
git branch -M main

echo.
echo 4. Configurando a URL exata do seu repositorio...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/gpasite1-byte/CRM-v8.0.git

echo.
echo 5. Enviando o codigo (isso pode demorar uns segundos)...
git push -u origin main --force

echo.
echo ====================================================================
echo   CONCLUIDO! VERIFIQUE SE O SEU CODIGO APARECE NO GITHUB.
echo ====================================================================
pause
