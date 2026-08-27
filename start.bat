@echo off
REM ===========================================================================
REM  Canorous public website - start
REM
REM  Double-click this file to run the site locally.
REM
REM    start.bat            development server with hot reload (port 3000)
REM    start.bat build      build the static export into .\out
REM    start.bat preview    build, then serve the REAL export (port 5000)
REM    start.bat deploy     build and push to Firebase Hosting
REM    start.bat check      verify the machine is ready, start nothing
REM
REM  This is a static site: no database, no API, nothing to install beyond
REM  Node.js. Safe to run repeatedly.
REM ===========================================================================

setlocal EnableDelayedExpansion
cd /d "%~dp0"

REM Pin the Windows versions of these tools. Git Bash, MSYS and Cygwin all put
REM their own versions earlier on PATH, and those take completely different
REM arguments - `timeout /t 2` is rejected outright by the Unix one. Running
REM this script from such a terminal would otherwise fail in confusing ways.
set "FINDSTR=%SystemRoot%\System32\findstr.exe"
set "NETSTAT=%SystemRoot%\System32\netstat.exe"
set "TASKKILL=%SystemRoot%\System32\taskkill.exe"

REM Waiting via ping, not timeout.exe: timeout refuses to run when stdin is
REM redirected ("Input redirection is not supported"), which is the case whenever
REM this is launched from anything but an interactive console. -n N waits about
REM N-1 seconds.
set "WAIT=%SystemRoot%\System32\ping.exe"

set MODE=%~1
if "%MODE%"=="" set MODE=dev

title Canorous public site - %MODE%

echo.
echo  ========================================================
echo    CANOROUS TECHNOLOGY - Public Website
echo    mode: %MODE%
echo  ========================================================
echo.

REM ---------------------------------------------------------------- Node ----
echo  [1/4] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 goto :installnode

for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do set NODEMAJOR=%%v
if !NODEMAJOR! LSS 20 (
    echo        Node !NODEMAJOR! is too old - version 20 or newer is required.
    goto :installnode
)
for /f %%v in ('node -p "process.version"') do echo        Node %%v - OK
goto :freeports

:installnode
echo        Installing Node 22 LTS via winget...
where winget >nul 2>&1
if errorlevel 1 (
    echo.
    echo   ERROR: winget is not available on this machine.
    echo   Install Node.js 22 LTS from https://nodejs.org then run this again.
    echo.
    pause
    exit /b 1
)
winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
if errorlevel 1 (
    echo   ERROR: Node.js installation failed.
    pause
    exit /b 1
)
echo.
echo   Node.js is installed, but this window still has the old PATH.
echo   Please CLOSE this window and run start.bat again.
echo.
pause
exit /b 0

REM ------------------------------------------------------------ free ports --
:freeports
echo  [2/4] Freeing ports 3000 and 5000...
set KILLED=
REM netstat lists a separate row per address family, so the same process shows
REM up twice. Track what has been handled to avoid killing and reporting it
REM twice over.
set "SEEN= "
for %%p in (3000 5000) do (
    for /f "tokens=5" %%a in ('!NETSTAT! -ano ^| !FINDSTR! /c:":%%p " ^| !FINDSTR! /c:"LISTENING"') do (
        echo !SEEN! | !FINDSTR! /c:" %%a " >nul || (
            echo        stopping process %%a on port %%p
            !TASKKILL! /F /PID %%a >nul 2>&1
            set "SEEN=!SEEN!%%a "
            set KILLED=1
        )
    )
)
if not defined KILLED (
    echo        Nothing was running - OK
) else (
    REM NOTE: the employee portal's apps/web also uses port 3000. If you were
    REM running the portal monorepo's dev server, this will have stopped it.
    !WAIT! -n 3 127.0.0.1 >nul
)

REM ---------------------------------------------------------- node_modules --
echo  [3/4] Checking dependencies...
if exist "node_modules\.package-lock.json" (
    echo        Already installed - OK
) else (
    echo        Installing - this takes a couple of minutes on first run...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo   ERROR: npm install failed. See the messages above.
        pause
        exit /b 1
    )
)

REM -------------------------------------------------------------------- env --
echo  [4/4] Checking configuration...
if exist ".env.local" (
    echo        .env.local found - OK
) else (
    REM Values are baked in at BUILD time, not read at runtime - a static site
    REM has no runtime environment. The defaults in next.config.ts point at
    REM localhost, which is correct for development.
    echo        No .env.local - using development defaults
    echo        ^(set NEXT_PUBLIC_API_URL before building for production^)
)

if /i "%MODE%"=="check" (
    echo.
    echo  ========================================================
    echo    CHECK PASSED - everything is ready.
    echo    Run start.bat with no arguments to launch the site.
    echo  ========================================================
    echo.
    exit /b 0
)

REM ------------------------------------------------------------------ run ----
echo.

if /i "%MODE%"=="build" goto :build
if /i "%MODE%"=="preview" goto :preview
if /i "%MODE%"=="deploy" goto :deploy
goto :dev

:build
echo  Building the static export...
echo.
call npm run build
if errorlevel 1 (
    echo.
    echo   BUILD FAILED - see the messages above.
    pause
    exit /b 1
)
echo.
echo  ========================================================
echo    Built into .\out
echo    Plain HTML, CSS and JS - no server needed to host it.
echo.
echo    Run "start.bat preview" to check it before deploying.
echo  ========================================================
echo.
pause
exit /b 0

:preview
echo  Building, then serving the real static export...
echo.
call npm run build
if errorlevel 1 (
    echo.
    echo   BUILD FAILED - see the messages above.
    pause
    exit /b 1
)
echo.
echo  ========================================================
echo    Preview  ^>  http://localhost:5000
echo.
echo    This serves the exported files exactly as Firebase will.
echo    Worth checking before every deploy - some problems only
echo    appear once the site is flat files with no dev server.
echo.
echo    Press Ctrl+C to stop.
echo  ========================================================
echo.
start "" cmd /c "!WAIT! -n 5 127.0.0.1 >nul & start http://localhost:5000"
call npm run preview
goto :stopped

:deploy
echo  Building and deploying to Firebase Hosting...
echo.
where firebase >nul 2>&1
if errorlevel 1 (
    echo   Firebase CLI is not installed. Install it with:
    echo.
    echo       npm install -g firebase-tools
    echo       firebase login
    echo.
    pause
    exit /b 1
)
call npm run deploy
if errorlevel 1 (
    echo.
    echo   DEPLOY FAILED - see the messages above.
    echo   Check that the project id in .firebaserc matches your Firebase project.
    pause
    exit /b 1
)
echo.
echo  Deployed.
pause
exit /b 0

:dev
echo  ========================================================
echo    Public website  ^>  http://localhost:3000
echo.
echo    Hot reload is on - save a file and the page updates.
echo.
echo    Other modes:
echo      start.bat build     static export into .\out
echo      start.bat preview   serve the real export ^(port 5000^)
echo      start.bat deploy    push to Firebase Hosting
echo.
echo    Press Ctrl+C to stop.
echo  ========================================================
echo.
start "" cmd /c "!WAIT! -n 7 127.0.0.1 >nul & start http://localhost:3000"
title Canorous public site - running
call npm run dev

:stopped
echo.
echo  Server stopped.
pause
endlocal
