# Quick Test Script for NFT Trading Game (PowerShell)
# This script runs basic health checks

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NFT Trading Game - Quick Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$PASSED = 0
$FAILED = 0

function Test-Result {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "[PASS] " -ForegroundColor Green -NoNewline
        Write-Host $Message
        $script:PASSED++
    } else {
        Write-Host "[FAIL] " -ForegroundColor Red -NoNewline
        Write-Host $Message
        $script:FAILED++
    }
}

Write-Host "1. Checking Prerequisites..." -ForegroundColor Yellow
Write-Host "----------------------------"

# Check Node.js
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Test-Result $true "Node.js installed ($nodeVersion)"
    } else {
        Test-Result $false "Node.js not found"
    }
} catch {
    Test-Result $false "Node.js not found"
}

# Check npm
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Test-Result $true "npm installed ($npmVersion)"
    } else {
        Test-Result $false "npm not found"
    }
} catch {
    Test-Result $false "npm not found"
}

# Check MongoDB
try {
    $mongod = Get-Command mongod -ErrorAction SilentlyContinue
    if ($mongod) {
        Test-Result $true "MongoDB installed"
    } else {
        Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline
        Write-Host "MongoDB not found (may need to start manually)"
    }
} catch {
    Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline
    Write-Host "MongoDB not found (may need to start manually)"
}

Write-Host ""
Write-Host "2. Checking Project Structure..." -ForegroundColor Yellow
Write-Host "--------------------------------"

# Check directories
Test-Result (Test-Path "server") "Server directory exists"
Test-Result (Test-Path "client") "Client directory exists"
Test-Result (Test-Path "server\package.json") "Server package.json exists"
Test-Result (Test-Path "client\package.json") "Client package.json exists"

Write-Host ""
Write-Host "3. Checking Dependencies..." -ForegroundColor Yellow
Write-Host "---------------------------"

Test-Result (Test-Path "server\node_modules") "Server dependencies installed"
Test-Result (Test-Path "client\node_modules") "Client dependencies installed"

Write-Host ""
Write-Host "4. Checking Build Files..." -ForegroundColor Yellow
Write-Host "--------------------------"

Test-Result (Test-Path "server\dist") "Server build directory exists"
Test-Result (Test-Path "client\vite.config.ts") "Client build configuration exists"

Write-Host ""
Write-Host "5. Checking Configuration Files..." -ForegroundColor Yellow
Write-Host "-----------------------------------"

$envExists = Test-Path "server\.env"
Test-Result $envExists "Server .env file exists"

if ($envExists) {
    $jwtSecret = Get-Content "server\.env" | Select-String "JWT_SECRET"
    if ($jwtSecret) {
        Test-Result $true "JWT_SECRET configured"
    } else {
        Write-Host "[WARN] " -ForegroundColor Yellow -NoNewline
        Write-Host "JWT_SECRET not found in .env"
    }
}

Write-Host ""
Write-Host "6. Testing Build Process..." -ForegroundColor Yellow
Write-Host "---------------------------"

Write-Host "Building server..." -ForegroundColor Gray
Push-Location server
$serverBuild = npm run build 2>&1 | Out-Null
$serverBuildSuccess = $LASTEXITCODE -eq 0
Pop-Location
Test-Result $serverBuildSuccess "Server builds successfully"

Write-Host "Building client..." -ForegroundColor Gray
Push-Location client
$clientBuild = npm run build 2>&1 | Out-Null
$clientBuildSuccess = $LASTEXITCODE -eq 0
Pop-Location
Test-Result $clientBuildSuccess "Client builds successfully"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: " -NoNewline
Write-Host $PASSED -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host $FAILED -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "[SUCCESS] All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to start the application:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
    Write-Host "  cd server && npm start"
    Write-Host ""
    Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
    Write-Host "  cd client && npm run dev"
    Write-Host ""
    Write-Host "Then open: http://localhost:5173" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "[ERROR] Some checks failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before starting the application."
    Write-Host "See TESTING_GUIDE.md for detailed instructions."
    exit 1
}
