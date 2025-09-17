@echo off
echo =====================================================
echo    International Payments Portal - Startup Script
echo    Secure Payment Processing System
echo =====================================================
echo.

REM Set colors for better visibility
color 0A

REM Kill any existing processes on ports 3000, 5000
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process on port 3000...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing process on port 5000...
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill any remaining Node processes from previous runs
echo Killing existing Node processes...
taskkill /f /im node.exe >nul 2>&1

timeout /t 2 /nobreak >nul

REM Check if MongoDB is running
echo Checking MongoDB status...
netstat -an | find ":27017" | find "LISTENING" >nul
if %errorlevel% neq 0 (
    echo Starting MongoDB...
    REM Try to start MongoDB service first
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        REM If service doesn't exist, try manual start
        echo MongoDB service not found, attempting manual start...
        if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
            start /min "MongoDB" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
        ) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
            start /min "MongoDB" "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
        ) else (
            echo MongoDB not found. Please install MongoDB or start it manually.
            echo Download from: https://www.mongodb.com/try/download/community
            pause
            exit /b 1
        )
    )
    
    REM Wait for MongoDB to start
    echo Waiting for MongoDB to start...
    timeout /t 8 /nobreak >nul
    
    REM Check if MongoDB started successfully
    netstat -an | find ":27017" | find "LISTENING" >nul
    if %errorlevel% neq 0 (
        echo Failed to start MongoDB. Please ensure MongoDB is installed and configured.
        echo You may need to create the data directory: C:\data\db
        pause
        exit /b 1
    )
    echo MongoDB started successfully!
) else (
    echo MongoDB is already running ✓
)

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed ✓

REM Check if backend dependencies are installed
echo Checking backend dependencies...
cd /d "%~dp0InternationalPaymentBackend"
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install backend dependencies.
        pause
        exit /b 1
    )
)
echo Backend dependencies ready ✓

REM Check if frontend dependencies are installed
echo Checking frontend dependencies...
cd /d "%~dp0international-payments-app"
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Failed to install frontend dependencies.
        pause
        exit /b 1
    )
)
echo Frontend dependencies ready ✓

REM Check if .env file exists
echo Checking environment configuration...
cd /d "%~dp0InternationalPaymentBackend"
if not exist ".env" (
    echo Creating .env file...
    echo MONGODB_URI=mongodb://localhost:27017/InternationalPaymentsDB > .env
    echo JWT_SECRET=super-secret-jwt-key-for-international-payments-portal-2025-security >> .env
    echo PORT=5000 >> .env
    echo Environment file created ✓
) else (
    echo Environment file exists ✓
)

REM Check if SSL certificates exist
echo Checking SSL certificates...
if not exist "key.pem" (
    echo Generating SSL certificates...
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=InternationalPayments/CN=localhost" >nul 2>&1
    if %errorlevel% neq 0 (
        echo Warning: Failed to generate SSL certificates. OpenSSL may not be installed.
        echo The server will attempt to run without SSL.
    ) else (
        echo SSL certificates generated ✓
    )
) else (
    echo SSL certificates exist ✓
)

REM Initialize database if needed
echo Checking database initialization...
cd /d "%~dp0"
if exist "scripts\init-db.js" (
    echo Initializing database with default data...
    cd /d "%~dp0InternationalPaymentBackend"
    node ..\scripts\init-db.js
    echo Database initialization completed ✓
) else (
    echo Database initialization script not found. Database will be initialized on first use.
)

echo.
echo =====================================================
echo Starting International Payments Portal...
echo =====================================================
echo Backend API: https://localhost:5000
echo Frontend App: https://localhost:3000
echo.
echo Note: You may see browser security warnings for
echo self-signed certificates. This is normal for development.
echo.

REM Start backend server
echo Starting backend server...
cd /d "%~dp0InternationalPaymentBackend"
start /min "International Payments API" cmd /c "node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting frontend application...
cd /d "%~dp0international-payments-app"
start /min "International Payments Frontend" cmd /c "npm start"

echo.
echo Servers are starting up...
echo.
echo The application will open in your browser automatically.
echo If not, navigate to: https://localhost:3000
echo.
echo Default Employee Login:
echo Username: admin
echo Account: 1234567890
echo Password: Admin@123
echo.
echo Press any key to view server logs or close this window
pause

REM Optional: Show server status
echo.
echo Checking server status...
timeout /t 2 /nobreak >nul
netstat -an | find ":5000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✓ Backend server is running on port 5000
) else (
    echo ✗ Backend server may not have started properly
)

netstat -an | find ":3000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ✓ Frontend server is running on port 3000
) else (
    echo ✗ Frontend server may not have started properly
)

echo.
echo Startup complete! Press any key to exit.
pause