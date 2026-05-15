# NFT Trading Game - Testing Guide

## Quick Start Testing

### Prerequisites
- MongoDB running locally on port 27017
- Node.js installed
- Two terminal windows

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run build
npm start
```
Backend should start on: http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```
Frontend should start on: http://localhost:5173

### 2. Access Points
- **Frontend UI**: http://localhost:5173
- **API Documentation**: http://localhost:3000/api-docs
- **Backend API**: http://localhost:3000/api

---

## Manual Testing Scenarios

### Scenario 1: User Registration & Login (5 minutes)

#### Test Registration
1. Open http://localhost:5173
2. Click "Register" or navigate to registration page
3. Enter username: `testuser1`
4. Enter 4-digit PIN: `1234`
5. Click "Register"
6. **Expected**: Success message, redirected to login or dashboard

#### Test Login
1. Enter username: `testuser1`
2. Enter PIN: `1234`
3. Click "Login"
4. **Expected**: Successfully logged in, see dashboard/marketplace

#### Test Invalid Login
1. Try logging in with wrong PIN: `9999`
2. **Expected**: Error message "Invalid credentials"

---

### Scenario 2: NFT Generation (5 minutes)

#### Generate Your First NFT
1. Log in as `testuser1`
2. Look for "Generate NFT" or "Create NFT" button
3. Click to open generation modal
4. Select a collection (e.g., "Crypto Potatoes")
5. Click "Generate NFT"
6. **Expected**: 
   - Success notification
   - New NFT appears in your collection
   - NFT has random color and properties
   - Rarity levels displayed

#### Generate Multiple NFTs
1. Generate 3-5 more NFTs from different collections:
   - Apathetic Axolotls
   - Cynical Capybaras
   - Crypto Toast
2. **Expected**: Each NFT has unique attributes and rarities

#### Verify NFT Details
Check that each NFT shows:
- Collection name
- Color with rarity (Common/Uncommon/Rare/Very Rare)
- Properties with individual rarities
- "**FIRST OF SET**" indicator (if applicable)
- Current price/status

---

### Scenario 3: Fixed-Price Marketplace (10 minutes)

#### List an NFT for Sale
1. Go to "My NFTs" or your collection
2. Select an NFT you want to sell
3. Click "Create Listing" or "List for Sale"
4. Choose "Fixed Price Sale"
5. Enter price: `100`
6. Click "List for Sale"
7. **Expected**: 
   - NFT now shows as "Listed" status
   - Appears in marketplace

#### Browse Marketplace
1. Navigate to "Marketplace" tab
2. **Expected**: See all listed NFTs from all users
3. Try filtering by:
   - Collection name
   - Rarity level
   - Price range

#### Buy an NFT (Need 2nd User)
1. Open a new incognito/private browser window
2. Register as `testuser2` with PIN `5678`
3. Generate a few NFTs to get starting balance
4. Navigate to marketplace
5. Find an NFT listed by `testuser1`
6. Click "Buy" button
7. **Expected**:
   - Purchase successful
   - Balance deducted
   - NFT transferred to your collection
   - Seller receives payment

---

### Scenario 4: Auction System (15 minutes)

#### Create a Standard Auction
1. Log in as `testuser1`
2. Click "Create Listing"
3. Select an NFT to auction
4. Choose "Auction" listing type
5. Select "🔨 Standard Auction"
6. Set starting bid: `50`
7. Set duration: 5 minutes
8. Click "Start Auction"
9. **Expected**:
   - Auction appears in "Auctions" tab
   - Countdown timer starts
   - Shows starting bid

#### Place Bids
1. Switch to `testuser2` (incognito window)
2. Navigate to "Auctions" tab
3. Find the auction created by `testuser1`
4. Enter bid amount: `60` (must be higher than starting bid)
5. Click "Place Bid"
6. **Expected**:
   - Bid accepted
   - Current bid updates to `60`
   - Real-time update visible

#### Outbid Yourself
1. As `testuser1`, try to bid on your own auction
2. **Expected**: Error message "Cannot bid on your own auction"

#### Competitive Bidding
1. As `testuser1`, create another user `testuser3`
2. Have `testuser2` bid `70`
3. Have `testuser3` bid `80`
4. **Expected**:
   - Each bid updates in real-time
   - Current bid shows highest amount
   - Previous bidders can see they've been outbid

#### Auction Completion
1. Wait for auction timer to expire (or set short duration)
2. **Expected**:
   - Auction status changes to "Ended"
   - Winner is displayed
   - NFT transferred to winner
   - Payment transferred to seller

---

### Scenario 5: Dutch Auction (10 minutes)

#### Create Dutch Auction
1. Log in as `testuser1`
2. Create new listing
3. Select "⚡ Dutch Auction"
4. Set starting price: `200`
5. Set duration: 3 minutes
6. Click "Start Auction"
7. **Expected**:
   - Price starts at `200`
   - Price decreases over time
   - Real-time price updates visible

#### Watch Price Decrease
1. Observe the auction for 30-60 seconds
2. **Expected**: Price gradually decreases

#### Buy at Current Price
1. As `testuser2`, view the Dutch auction
2. When price reaches acceptable level (e.g., `150`)
3. Click "Buy Now" or "Accept Price"
4. **Expected**:
   - Auction ends immediately
   - NFT transferred at current price
   - No other bids possible

---

### Scenario 6: Reserve Auction (10 minutes)

#### Create Reserve Auction
1. Log in as `testuser1`
2. Create new listing
3. Select "💎 Reserve Auction"
4. Set starting bid: `30`
5. Set reserve price: `100` (hidden from bidders)
6. Set duration: 5 minutes
7. Click "Start Auction"

#### Bid Below Reserve
1. As `testuser2`, bid `40`
2. As `testuser3`, bid `50`
3. **Expected**:
   - Bids are accepted
   - No indication of reserve price
   - Auction continues

#### Meet Reserve Price
1. As `testuser2`, bid `110` (above reserve)
2. **Expected**:
   - Bid accepted
   - Reserve met indicator may appear
   - Auction can now complete successfully

#### Auction Ends Below Reserve
1. Create another reserve auction
2. Let it expire with highest bid below reserve
3. **Expected**:
   - Auction ends
   - NFT NOT sold (reserve not met)
   - NFT returns to seller

---

### Scenario 7: Real-time Features (10 minutes)

#### Test Live Marketplace Updates
1. Have `testuser1` logged in on one browser
2. Have `testuser2` logged in on another browser
3. As `testuser1`, list an NFT for sale
4. **Expected**: `testuser2` sees the new listing appear immediately

#### Test Live Auction Updates
1. Have both users viewing the same auction
2. As `testuser2`, place a bid
3. **Expected**: `testuser1` sees the bid update in real-time without refresh

#### Test Notifications
1. As `testuser1`, create an auction
2. As `testuser2`, place a bid
3. **Expected**: 
   - `testuser1` receives notification of new bid
   - Toast notification appears
   - Notification preferences can be configured

---

### Scenario 8: User Activity Tracking (5 minutes)

#### View My Auctions
1. Log in as `testuser1`
2. Click "My Auctions" or similar button
3. **Expected**: See two tabs:
   - "My Auctions" (auctions you created)
   - "My Bids" (auctions you bid on)

#### Check Auction Status
1. In "My Auctions" tab, verify:
   - Active auctions show countdown
   - Ended auctions show winner
   - Current bid amounts displayed
   - Auction type indicators (🔨⚡💎)

#### Check Bid Status
1. In "My Bids" tab, verify:
   - Shows all auctions you've bid on
   - Status: Won/Lost/Active
   - Your bid amount
   - Time remaining for active auctions

---

### Scenario 9: Edge Cases & Error Handling (10 minutes)

#### Test Insufficient Funds
1. As `testuser2`, try to buy an expensive NFT
2. **Expected**: Error message "Insufficient funds"

#### Test Invalid Bid Amounts
1. Try bidding less than current bid
2. **Expected**: Error message "Bid must be higher than current bid"
3. Try bidding negative amount
4. **Expected**: Validation error

#### Test Expired Auctions
1. Try bidding on an expired auction
2. **Expected**: Error message "Auction has ended"

#### Test Duplicate Listings
1. Try listing an NFT that's already listed
2. **Expected**: Error message "NFT is already listed"

#### Test Network Disconnection
1. Disconnect internet briefly
2. Try to perform an action
3. **Expected**: Appropriate error message
4. Reconnect and verify data integrity

---

## Automated Testing

### Run Backend Tests
```bash
cd server
npm test
```

**Expected Output:**
- 104 tests passing
- Test suites: 11 total
- Coverage reports generated

### Run Frontend Tests
```bash
cd client
npm test
```

**Expected Output:**
- All component tests passing
- React component rendering verified

### Run Specific Test Suites
```bash
# Test only marketplace
cd server
npm test -- marketplace.test.ts

# Test only auctions
npm test -- auctionService.test.ts

# Test real-time features
npm test -- realtime.integration.test.ts
```

---

## API Testing with Swagger

### Access API Documentation
1. Start backend server
2. Open http://localhost:3000/api-docs
3. Explore all available endpoints

### Test API Endpoints Directly
1. Click on any endpoint (e.g., POST /api/auth/register)
2. Click "Try it out"
3. Enter request body:
```json
{
  "username": "apitest",
  "pin": "1111"
}
```
4. Click "Execute"
5. **Expected**: See response with status code and data

### Test Authentication Flow
1. Register a user via API
2. Login to get JWT token
3. Copy the token
4. Click "Authorize" button at top
5. Enter: `Bearer <your-token>`
6. Now test protected endpoints (marketplace, NFT generation)

---

## Performance Testing

### Load Testing Checklist
- [ ] Generate 50+ NFTs
- [ ] Create 20+ marketplace listings
- [ ] Create 10+ simultaneous auctions
- [ ] Have 5+ users bidding concurrently
- [ ] Monitor response times
- [ ] Check for memory leaks
- [ ] Verify real-time updates still work

### Expected Performance
- API response time: < 200ms for most endpoints
- Real-time updates: < 100ms latency
- Page load time: < 2 seconds
- Auction timer accuracy: ±1 second

---

## Browser Compatibility Testing

### Test in Multiple Browsers
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

### Test Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Features to Verify
- [ ] All buttons clickable
- [ ] Forms submit correctly
- [ ] Modals display properly
- [ ] Real-time updates work
- [ ] Notifications appear correctly

---

## Troubleshooting Common Issues

### Backend Won't Start
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# Check if port 3000 is in use
netstat -ano | findstr :3000

# Clear and rebuild
cd server
rm -rf node_modules dist
npm install
npm run build
npm start
```

### Frontend Won't Start
```bash
# Clear and rebuild
cd client
rm -rf node_modules dist
npm install
npm run dev
```

### Tests Failing
```bash
# Clear Jest cache
cd server
npx jest --clearCache
npm test
```

### Real-time Updates Not Working
1. Check browser console for Socket.IO errors
2. Verify backend Socket.IO is running
3. Check CORS settings in server
4. Try hard refresh (Ctrl+Shift+R)

---

## Test Data Cleanup

### Reset Database
```bash
# Connect to MongoDB
mongosh

# Switch to database
use nft-game

# Drop all collections
db.dropDatabase()

# Restart servers
```

### Clear Browser Data
1. Open DevTools (F12)
2. Application tab
3. Clear Storage
4. Clear all data
5. Refresh page

---

## Success Criteria

### ✅ All Tests Pass When:
- [ ] Users can register and login
- [ ] NFTs can be generated with proper attributes
- [ ] Fixed-price marketplace works (list, buy, sell)
- [ ] All 3 auction types function correctly
- [ ] Real-time updates appear without refresh
- [ ] Notifications display properly
- [ ] Transactions are safe (no double-spending)
- [ ] Error messages are clear and helpful
- [ ] UI is responsive and intuitive
- [ ] 104/104 automated tests pass
- [ ] No console errors in browser
- [ ] No server errors in terminal

---

## Quick 5-Minute Smoke Test

If you only have 5 minutes, test these critical paths:

1. **Register** → Login ✅
2. **Generate NFT** → See it in collection ✅
3. **List NFT** → Appears in marketplace ✅
4. **Create Auction** → Timer starts ✅
5. **Place Bid** → Updates in real-time ✅

If all 5 work, the core functionality is operational! 🎉

---

## Need Help?

- Check server logs in Terminal 1
- Check browser console (F12) for frontend errors
- Review API documentation at http://localhost:3000/api-docs
- Check [README.md](README.md) for setup instructions
- Review [AUCTION_DEMO.md](AUCTION_DEMO.md) for auction details
