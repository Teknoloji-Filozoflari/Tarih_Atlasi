@echo off
setlocal
cd /d "%~dp0"
docker load --input tarih-atlasi-image.tar.gz
if errorlevel 1 exit /b 1
docker compose up -d --wait
if errorlevel 1 exit /b 1
start "" http://127.0.0.1:8081
