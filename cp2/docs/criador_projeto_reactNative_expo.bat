@echo off
title Criador de Projeto Expo - por Paulo
echo ================================
echo Criador de Projeto React Native (Expo)
echo ================================
set /p projectName=Digite o nome do projeto: 

echo.
echo Criando projeto %projectName% com template "blank"...
echo.

npx create-expo-app %projectName% --template blank

if %errorlevel% neq 0 (
    echo Houve um erro ao criar o projeto. Verifique o nome ou o Expo CLI.
    pause
    exit /b
)

cd %projectName%

echo.
echo Abrindo o projeto no WebStorm...
echo.

REM Altere o caminho abaixo se sua versão do WebStorm for diferente
start "" "C:\Program Files\JetBrains\WebStorm 2023.3\bin\webstorm64.exe" .

exit
