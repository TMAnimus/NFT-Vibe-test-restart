#!/bin/bash
# API Testing Script for NFT Trading Game
# Tests all major API endpoints

echo "🧪 NFT Trading Game - API Test Script"
echo "======================================"
echo ""

# Configuration
API_BASE="http://localhost:3000/api"
TEST_USER="testuser_$(date +%s)"
TEST_PIN="1234"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
PASSED=0
FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        echo -e "   Response: $3"
        ((FAILED++))
    fi
}

# Function to check if server is running
check_server() {
    echo "Checking if server is running..."
    if curl -s "$API_BASE/../health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Server is running"
        return 0
    else
        echo -e "${RED}✗${NC} Server is not running"
        echo ""
        echo "Please start the server first:"
        echo "  cd server && npm start"
        exit 1
    fi
}

echo "Step 1: Checking Server Status"
echo "-------------------------------"
check_server
echo ""

echo "Step 2: Testing Authentication"
echo "-------------------------------"

# Test Registration
echo "Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USER\",\"pin\":\"$TEST_PIN\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token\|username"; then
    test_result 0 "User registration"
else
    test_result 1 "User registration" "$REGISTER_RESPONSE"
fi

# Test Login
echo "Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USER\",\"pin\":\"$TEST_PIN\"}")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    test_result 0 "User login (token received)"
else
    test_result 1 "User login" "$LOGIN_RESPONSE"
    echo "Cannot continue without token. Exiting."
    exit 1
fi

# Test Invalid Login
echo "Testing invalid login..."
INVALID_LOGIN=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USER\",\"pin\":\"9999\"}")

if echo "$INVALID_LOGIN" | grep -q "Invalid\|error"; then
    test_result 0 "Invalid login rejected"
else
    test_result 1 "Invalid login should be rejected" "$INVALID_LOGIN"
fi

echo ""
echo "Step 3: Testing User Profile"
echo "-----------------------------"

# Test Get Profile
echo "Testing get user profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$API_BASE/user/profile" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "username\|balance"; then
    test_result 0 "Get user profile"
else
    test_result 1 "Get user profile" "$PROFILE_RESPONSE"
fi

echo ""
echo "Step 4: Testing NFT Generation"
echo "-------------------------------"

# Test Generate NFT
echo "Testing NFT generation..."
NFT_RESPONSE=$(curl -s -X POST "$API_BASE/nft/generate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"collectionName":"Crypto Potatoes"}')

if echo "$NFT_RESPONSE" | grep -q "_id\|color\|thing"; then
    NFT_ID=$(echo "$NFT_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
    test_result 0 "NFT generation (ID: ${NFT_ID:0:8}...)"
else
    test_result 1 "NFT generation" "$NFT_RESPONSE"
fi

# Test Get My NFTs
echo "Testing get my NFTs..."
MY_NFTS=$(curl -s -X GET "$API_BASE/nft/my-nfts" \
    -H "Authorization: Bearer $TOKEN")

if echo "$MY_NFTS" | grep -q "_id"; then
    test_result 0 "Get my NFTs"
else
    test_result 1 "Get my NFTs" "$MY_NFTS"
fi

echo ""
echo "Step 5: Testing Marketplace"
echo "----------------------------"

# Test List NFT
if [ -n "$NFT_ID" ]; then
    echo "Testing list NFT for sale..."
    LIST_RESPONSE=$(curl -s -X POST "$API_BASE/marketplace/list" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"nftId\":\"$NFT_ID\",\"price\":100}")
    
    if echo "$LIST_RESPONSE" | grep -q "Listed\|success"; then
        test_result 0 "List NFT for sale"
    else
        test_result 1 "List NFT for sale" "$LIST_RESPONSE"
    fi
fi

# Test Get Listed NFTs
echo "Testing get marketplace listings..."
LISTED_RESPONSE=$(curl -s -X GET "$API_BASE/marketplace/listed" \
    -H "Authorization: Bearer $TOKEN")

if echo "$LISTED_RESPONSE" | grep -q "\[\]" || echo "$LISTED_RESPONSE" | grep -q "_id"; then
    test_result 0 "Get marketplace listings"
else
    test_result 1 "Get marketplace listings" "$LISTED_RESPONSE"
fi

# Test Price Suggestion
if [ -n "$NFT_ID" ]; then
    echo "Testing price suggestion..."
    PRICE_RESPONSE=$(curl -s -X POST "$API_BASE/marketplace/suggest-price" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"nftId\":\"$NFT_ID\"}")
    
    if echo "$PRICE_RESPONSE" | grep -q "suggestedPrice\|price"; then
        test_result 0 "Price suggestion"
    else
        test_result 1 "Price suggestion" "$PRICE_RESPONSE"
    fi
fi

echo ""
echo "Step 6: Testing Auction System"
echo "-------------------------------"

# Generate another NFT for auction
echo "Generating NFT for auction..."
AUCTION_NFT=$(curl -s -X POST "$API_BASE/nft/generate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"collectionName":"Cynical Capybaras"}')

AUCTION_NFT_ID=$(echo "$AUCTION_NFT" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -n "$AUCTION_NFT_ID" ]; then
    # Test Create Auction
    echo "Testing create auction..."
    CREATE_AUCTION=$(curl -s -X POST "$API_BASE/auctions/create" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"nftId\":\"$AUCTION_NFT_ID\",\"auctionType\":\"standard\",\"startingBid\":50,\"duration\":300}")
    
    if echo "$CREATE_AUCTION" | grep -q "_id\|auctionId"; then
        AUCTION_ID=$(echo "$CREATE_AUCTION" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
        test_result 0 "Create auction (ID: ${AUCTION_ID:0:8}...)"
    else
        test_result 1 "Create auction" "$CREATE_AUCTION"
    fi
fi

# Test Get Active Auctions
echo "Testing get active auctions..."
ACTIVE_AUCTIONS=$(curl -s -X GET "$API_BASE/auctions/active" \
    -H "Authorization: Bearer $TOKEN")

if echo "$ACTIVE_AUCTIONS" | grep -q "\[\]" || echo "$ACTIVE_AUCTIONS" | grep -q "_id"; then
    test_result 0 "Get active auctions"
else
    test_result 1 "Get active auctions" "$ACTIVE_AUCTIONS"
fi

# Test Get My Auctions
echo "Testing get my auctions..."
MY_AUCTIONS=$(curl -s -X GET "$API_BASE/auctions/my-auctions" \
    -H "Authorization: Bearer $TOKEN")

if echo "$MY_AUCTIONS" | grep -q "\[\]" || echo "$MY_AUCTIONS" | grep -q "_id"; then
    test_result 0 "Get my auctions"
else
    test_result 1 "Get my auctions" "$MY_AUCTIONS"
fi

echo ""
echo "Step 7: Testing Notifications"
echo "------------------------------"

# Test Get Notifications
echo "Testing get notifications..."
NOTIFICATIONS=$(curl -s -X GET "$API_BASE/notifications" \
    -H "Authorization: Bearer $TOKEN")

if echo "$NOTIFICATIONS" | grep -q "\[\]" || echo "$NOTIFICATIONS" | grep -q "_id"; then
    test_result 0 "Get notifications"
else
    test_result 1 "Get notifications" "$NOTIFICATIONS"
fi

# Test Get Notification Preferences
echo "Testing get notification preferences..."
PREFS=$(curl -s -X GET "$API_BASE/notifications/preferences" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PREFS" | grep -q "enabled\|types" || echo "$PREFS" | grep -q "\[\]"; then
    test_result 0 "Get notification preferences"
else
    test_result 1 "Get notification preferences" "$PREFS"
fi

echo ""
echo "Step 8: Testing Tick System"
echo "----------------------------"

# Test Get Tick Status
echo "Testing get tick status..."
TICK_STATUS=$(curl -s -X GET "$API_BASE/tick/status" \
    -H "Authorization: Bearer $TOKEN")

if echo "$TICK_STATUS" | grep -q "running\|status"; then
    test_result 0 "Get tick status"
else
    test_result 1 "Get tick status" "$TICK_STATUS"
fi

echo ""
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All API tests passed!${NC}"
    echo ""
    echo "Test user created: $TEST_USER"
    echo "You can login with PIN: $TEST_PIN"
    exit 0
else
    echo -e "${RED}✗ Some API tests failed${NC}"
    echo ""
    echo "Check the server logs for more details."
    exit 1
fi
