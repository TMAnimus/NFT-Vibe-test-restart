#!/bin/bash
# Quick Test Script for NFT Trading Game
# This script runs basic health checks

echo "🎮 NFT Trading Game - Quick Test Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

echo "1. Checking Prerequisites..."
echo "----------------------------"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_result 0 "Node.js installed ($NODE_VERSION)"
else
    print_result 1 "Node.js not found"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_result 0 "npm installed ($NPM_VERSION)"
else
    print_result 1 "npm not found"
fi

# Check MongoDB
if command_exists mongod; then
    print_result 0 "MongoDB installed"
else
    print_result 1 "MongoDB not found (may need to start manually)"
fi

echo ""
echo "2. Checking Project Structure..."
echo "--------------------------------"

# Check server directory
if [ -d "server" ]; then
    print_result 0 "Server directory exists"
else
    print_result 1 "Server directory not found"
fi

# Check client directory
if [ -d "client" ]; then
    print_result 0 "Client directory exists"
else
    print_result 1 "Client directory not found"
fi

# Check server package.json
if [ -f "server/package.json" ]; then
    print_result 0 "Server package.json exists"
else
    print_result 1 "Server package.json not found"
fi

# Check client package.json
if [ -f "client/package.json" ]; then
    print_result 0 "Client package.json exists"
else
    print_result 1 "Client package.json not found"
fi

echo ""
echo "3. Checking Dependencies..."
echo "---------------------------"

# Check server node_modules
if [ -d "server/node_modules" ]; then
    print_result 0 "Server dependencies installed"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Server dependencies not installed"
    echo "   Run: cd server && npm install"
    ((FAILED++))
fi

# Check client node_modules
if [ -d "client/node_modules" ]; then
    print_result 0 "Client dependencies installed"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Client dependencies not installed"
    echo "   Run: cd client && npm install"
    ((FAILED++))
fi

echo ""
echo "4. Checking Build Files..."
echo "--------------------------"

# Check server build
if [ -d "server/dist" ]; then
    print_result 0 "Server build directory exists"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Server not built"
    echo "   Run: cd server && npm run build"
    ((FAILED++))
fi

# Check client build capability
if [ -f "client/vite.config.ts" ]; then
    print_result 0 "Client build configuration exists"
else
    print_result 1 "Client build configuration not found"
fi

echo ""
echo "5. Checking Configuration Files..."
echo "-----------------------------------"

# Check server .env
if [ -f "server/.env" ]; then
    print_result 0 "Server .env file exists"
else
    echo -e "${YELLOW}⚠ WARNING${NC}: Server .env not found"
    echo "   Copy server/.env.example to server/.env"
    ((FAILED++))
fi

# Check for JWT_SECRET in .env
if [ -f "server/.env" ]; then
    if grep -q "JWT_SECRET" server/.env; then
        print_result 0 "JWT_SECRET configured"
    else
        echo -e "${YELLOW}⚠ WARNING${NC}: JWT_SECRET not found in .env"
        ((FAILED++))
    fi
fi

echo ""
echo "6. Testing Build Process..."
echo "---------------------------"

# Test server build
echo "Building server..."
cd server
if npm run build > /dev/null 2>&1; then
    print_result 0 "Server builds successfully"
else
    print_result 1 "Server build failed"
fi
cd ..

# Test client build
echo "Building client..."
cd client
if npm run build > /dev/null 2>&1; then
    print_result 0 "Client builds successfully"
else
    print_result 1 "Client build failed"
fi
cd ..

echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "🚀 Ready to start the application:"
    echo ""
    echo "Terminal 1 (Backend):"
    echo "  cd server && npm start"
    echo ""
    echo "Terminal 2 (Frontend):"
    echo "  cd client && npm run dev"
    echo ""
    echo "Then open: http://localhost:5173"
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please fix the issues above before starting the application."
    echo "See TESTING_GUIDE.md for detailed instructions."
    exit 1
fi
