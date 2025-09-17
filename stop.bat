@echo off
echo =====================================================
echo    Stop International Payments Portal
echo =====================================================
echo.

echo Stopping all International Payments Portal processes...

REM Kill processes on specific ports
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Stopping frontend server (port 3000)...
    taskkill /f /pid %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Stopping backend server (port 5000)...
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill Node.js processes
echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ✅ All servers stopped successfully!
echo.
pause