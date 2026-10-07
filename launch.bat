@echo off
title Blood on the Clocktower - Server Launcher
cd /d "%~dp0"

echo ===================================================
echo   Starting Blood on the Clocktower Townsquare
echo ===================================================

:: 1. Build frontend assets
echo [1/4] Building frontend assets...
call npm run build
if errorlevel 1 (
	echo.
	echo Build failed. Server was not started.
	pause
	exit /b 1
)

:: 2. Start the Node.js Game Server in a new hidden/separate window
echo [2/4] Booting up local server (Port 8080)...
start "Game Server" cmd /k "cd server & node index.js"

:: 2b. Start the Game Rules server on port 8081
echo [3/4] Booting up game rules server (Port 8081)...
start "Game Rules Server" cmd /k "cd gamerule & node server.js"

:: Give the servers 3 seconds to fully start
timeout /t 10 /nobreak >nul

:: 3. Start the main Cloudflare Tunnel (main site on 8080)
echo [4/4] Connecting to your Cloudflare URL...
echo.
echo Main site: koukirocks.qzz.io (port 8080)
echo Game Rules: gamerule.koukirocks.qzz.io (port 8081)
echo.
echo Press CTRL+C to stop the tunnel when you are done playing.
echo ===================================================

:: -> IF YOU CONFIGURED YOUR TUNNEL VIA THE CLOUDFLARE DASHBOARD:
:: Replace the line below with your token, for example:
:: npx cloudflared tunnel --protocol http2 run --token YOUR_TOKEN_GOES_HERE

:: -> IF YOU CREATED YOUR TUNNEL VIA CLI (e.g., named "botc-game"):
:: Make sure you have previously run: 'npx cloudflared tunnel route dns botc-game yourdomain.com'
:: AND: 'npx cloudflared tunnel route dns botc-game gamerule.koukirocks.qzz.io'
npx cloudflared tunnel run botc-game

pause