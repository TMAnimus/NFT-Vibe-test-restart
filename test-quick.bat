@echo off
REM Quick Test Script for NFT Trading Game (Windows)
REM This script runs basic health checks

echo ========================================
echo NFT Trading Game - Quick Test Script
echo ========================================
echo.

set PASSED=0
set FAILED=0

echo 1. Checking Prerequisites...
echo ----------------------------

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [PASS] Node.js installed (!NODE_VERSION!)
    set /a PASSED+=1
) else (
    echo [FAIL] Node.js not found
    set /a FAILED+=1
)

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [PASS] npm installed (!NPM_VERSION!)
    set /a PASSED+=1
) else (
    echo [FAIL] npm not found
    set /a FAILED+=1
)

REM Check MongoDB
where mongod >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] MongoDB installed
    set /a PASSED+=1
) else (
    echo [WARN] MongoDB not found ^(may need to start manually^)
    set /a FAILED+=1
)

echo.
echo 2. Checking Project Structure...
echo --------------------------------

REM Check server directory
if exist "server\" (
    echo [PASS] Server directory exists
    set /a PASSED+=1
) else (
    echo [FAIL] Server directory not found
    set /a FAILED+=1
)

REM Check client directory
if exist "client\" (
    echo [PASS] Client directory exists
    set /a PASSED+=1
) else (
    echo [FAIL] Client directory not found
    set /a FAILED+=1
)

REM Check server package.json
if exist "server\package.json" (
    echo [PASS] Server package.json exists
    set /a PASSED+=1
) else (
    echo [FAIL] Server package.json not found
    set /a FAILED+=1
)

REM Check client package.json
if exist "client\package.json" (
    echo [PASS] Client package.json exists
    set /a PASSED+=1
) else (
    echo [FAIL] Client package.json not found
    set /a FAILED+=1
)

echo.
echo 3. Checking Dependencies...
echo ---------------------------

REM Check server node_modules
if exist "server\node_modules\" (
    echo [PASS] Server dependencies installed
    set /a PASSED+=1
) else (
    echo [WARN] Server dependencies not installed
    echo        Run: cd server ^&^& npm install
    set /a FAILED+=1
)

REM Check client node_modules
if exist "client\node_modules\" (
    echo [PASS] Client dependencies installed
    set /a PASSED+=1
) else (
    echo [WARN] Client dependencies not installed
    echo        Run: cd client ^&^& npm install
    set /a FAILED+=1
)

echo.
echo 4. Checking Build Files...
echo --------------------------

REM Check server build
if exist "server\dist\" (
    echo [PASS] Server build directory exists
    set /a PASSED+=1
) else (
    echo [WARN] Server not built
    echo        Run: cd server ^&^& npm run build
    set /a FAILED+=1
)

REM Check client build capability
if exist "client\vite.config.ts" (
    echo [PASS] Client build configuration exists
    set /a PASSED+=1
) else (
    echo [FAIL] Client build configuration not found
    set /a FAILED+=1
)

echo.
echo 5. Checking Configuration Files...
echo -----------------------------------

REM Check server .env
if exist "server\.env" (
    echo [PASS] Server .env file exists
    set /a PASSED+=1
    
    REM Check for JWT_SECRET
    findstr /C:"JWT_SECRET" server\.env >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [PASS] JWT_SECRET configured
        set /a PASSED+=1
    ) else (
        echo [WARN] JWT_SECRET not found in .env
        set /a FAILED+=1
    )
) else (
    echo [WARN] Server .env not found
    echo        Copy server\.env.example to server\.env
    set /a FAILED+=1
)

echo.
echo 6. Testing Build Process...
echo ---------------------------

echo Building server...
cd server
call npm run build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Server builds successfully
    set /a PASSED+=1
) else (
    echo [FAIL] Server build failed
    set /a FAILED+=1
)
cd ..

echo Building client...
cd client
call npm run build >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Client builds successfully
    set /a PASSED+=1
) else (
    echo [FAIL] Client build failed
    set /a FAILED+=1
)
cd ..

echo.
echo ========================================
echo Test Summary
echo ========================================
echo Passed: %PASSED%
echo Failed: %FAILED%
echo.

if %FAILED% EQU 0 (
    echo [SUCCESS] All checks passed!
    echo.
    echo Ready to start the application:
    echo.
    echo Terminal 1 ^(Backend^):
    echo   cd server ^&^& npm start
    echo.
    echo Terminal 2 ^(Frontend^):
    echo   cd client ^&^& npm run dev
    echo.
    echo Then open: http://localhost:5173
    exit /b 0
) else (
    echo [ERROR] Some checks failed
    echo.
    echo Please fix the issues above before starting the application.
    echo See TESTING_GUIDE.md for detailed instructions.
    exit /b 1
)
