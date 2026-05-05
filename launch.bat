@echo off
title Blood on the Clocktower - Server Launcher
cd /d "%~dp0"

echo ===================================================
echo   Starting Blood on the Clocktower Townsquare
echo ===================================================

:: 1. Build frontend assets
echo [1/3] Building frontend assets...
::call npm run build
::if errorlevel 1 (
::	echo.
::	echo Build failed. Server was not started.
::	pause
::	exit /b 1
::)

:: 2. Start the Node.js Game Server in a new hidden/separate window
echo [2/3] Booting up local server (Port 8080)...
start "Game Server" cmd /k "cd server & node index.js"

:: Give the server 3 seconds to fully start
timeout /t 10 /nobreak >nul

:: 3. Start the Cloudflare Tunnel
echo [3/3] Connecting to your Cloudflare URL (http2 mode)...
echo.
echo Press CTRL+C to stop the tunnel when you are done playing.
echo ===================================================

:: -> IF YOU CONFIGURED YOUR TUNNEL VIA THE CLOUDFLARE DASHBOARD:
:: Replace the line below with your token, for example:
:: npx cloudflared tunnel --protocol http2 run --token YOUR_TOKEN_GOES_HERE

:: -> IF YOU CREATED YOUR TUNNEL VIA CLI (e.g., named "botc-game"):
:: Make sure you have previously run: 'npx cloudflared tunnel route dns botc-game yourdomain.com'
npx cloudflared tunnel --protocol http2 run botc-game

pause