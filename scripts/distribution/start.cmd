@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 veya 26 gereklidir. Alternatif: Releases Docker paketini kullanin.
  exit /b 1
)
node -e "if (![24,26].includes(Number(process.versions.node.split('.')[0]))) process.exit(1)"
if errorlevel 1 exit /b 1
node scripts\verify.mjs
if errorlevel 1 exit /b 1
node scripts\server.mjs
