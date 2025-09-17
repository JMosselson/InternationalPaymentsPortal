@echo off
echo =====================================================
echo    International Payments Portal - Reset Database
echo =====================================================
echo.

echo This will completely reset the database and reinitialize it with fresh data.
echo WARNING: All existing data will be lost!
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

echo.
echo Connecting to MongoDB and resetting database...

cd /d "%~dp0InternationalPaymentBackend"

REM Create a temporary reset script
echo const mongoose = require('mongoose'); > temp_reset.js
echo const MONGODB_URI = process.env.MONGODB_URI ^|^| 'mongodb://localhost:27017/InternationalPaymentsDB'; >> temp_reset.js
echo mongoose.connect(MONGODB_URI).then(async () =^> { >> temp_reset.js
echo   console.log('Connected to MongoDB'); >> temp_reset.js
echo   await mongoose.connection.db.dropDatabase(); >> temp_reset.js
echo   console.log('Database reset successfully'); >> temp_reset.js
echo   await mongoose.disconnect(); >> temp_reset.js
echo   process.exit(0); >> temp_reset.js
echo }).catch(err =^> { >> temp_reset.js
echo   console.error('Reset failed:', err.message); >> temp_reset.js
echo   process.exit(1); >> temp_reset.js
echo }); >> temp_reset.js

REM Execute the reset
node temp_reset.js

REM Clean up temporary file
del temp_reset.js

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database reset completed!
    echo.
    echo Reinitializing with fresh data...
    cd /d "%~dp0"
    node scripts\init-db.js
) else (
    echo.
    echo ❌ Database reset failed!
)

echo.
pause