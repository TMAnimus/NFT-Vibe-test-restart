# 🚀 Quick Start Guide - NFT Trading Game

## First Time Setup (5 minutes)

### 1. Prerequisites Check
Make sure you have:
- ✅ Node.js installed (v16 or higher)
- ✅ MongoDB installed and running
- ✅ Two terminal windows ready

### 2. Run Health Check

**Windows:**
```bash
test-quick.bat
```

**Linux/Mac:**
```bash
chmod +x test-quick.sh
./test-quick.sh
```

This will verify everything is set up correctly.

---

## Starting the Application

### Terminal 1 - Backend Server

```bash
cd server
npm install          # First time only
npm run build        # First time only
npm start
```

**Expected output:**
```
Server running on port 3000
MongoDB connected successfully
Socket.IO server initialized
```

**Backend is ready when you see:** `Server running on port 3000`

---

### Terminal 2 - Frontend Application

```bash
cd client
npm install          # First time only
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

**Frontend is ready when you see:** `Local: http://localhost:5173/`

---

## Access the Application

1. **Open your browser** to: http://localhost:5173
2. **Register a new user**:
   - Username: `testuser`
   - PIN: `1234`
3. **Start playing!**

---

## Quick Test (2 minutes)

Once logged in, try these steps:

1. **Generate an NFT**
   - Click "Generate NFT" button
   - Select "Crypto Potatoes"
   - Click "Generate"
   - ✅ You should see your new NFT

2. **Create a Listing**
   - Click "Create Listing"
   - Select your NFT
   - Choose "Fixed Price Sale"
   - Set price: `100`
   - ✅ NFT appears in marketplace

3. **Create an Auction**
   - Generate another NFT
   - Click "Create Listing"
   - Choose "Auction"
   - Select "Standard Auction"
   - Set starting bid: `50`
   - ✅ Auction appears with countdown timer

**If all 3 work, you're good to go!** 🎉

---

## Troubleshooting

### Backend won't start?

**Check MongoDB:**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

**Check if port 3000 is in use:**
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

### Frontend won't start?

**Clear and reinstall:**
```bash
cd client
rm -rf node_modules
npm install
npm run dev
```

### Tests failing?

**Run the health check:**
```bash
# Windows
test-quick.bat

# Linux/Mac
./test-quick.sh
```

### Still having issues?

1. Check server logs in Terminal 1
2. Check browser console (F12) for errors
3. See [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed troubleshooting

---

## What's Next?

### Explore the Features

- **NFT Generation**: Create NFTs from 15 different collections
- **Marketplace**: Buy and sell NFTs at fixed prices
- **Auctions**: Three types of auctions (Standard, Dutch, Reserve)
- **Real-time Updates**: See changes instantly without refresh
- **Notifications**: Get alerts for marketplace events

### Test Different Scenarios

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for:
- Complete testing scenarios
- Multi-user testing
- Edge cases and error handling
- Performance testing

### API Documentation

Visit http://localhost:3000/api-docs to:
- Explore all API endpoints
- Test endpoints directly
- See request/response examples

---

## Quick Reference

| What | URL |
|------|-----|
| Frontend | http://localhost:5173 |
| API Docs | http://localhost:3000/api-docs |
| Backend API | http://localhost:3000/api |

| Command | Purpose |
|---------|---------|
| `npm start` | Start production server |
| `npm run dev` | Start development server |
| `npm test` | Run automated tests |
| `npm run build` | Build for production |

---

## Need Help?

- 📖 [README.md](README.md) - Full project documentation
- 🧪 [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing guide
- 🎯 [AUCTION_DEMO.md](AUCTION_DEMO.md) - Auction system details
- 📚 [server/docs/api-documentation.md](server/docs/api-documentation.md) - API reference

---

## Success Checklist

- [ ] Health check passes (`test-quick.bat` or `test-quick.sh`)
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Can register and login
- [ ] Can generate NFTs
- [ ] Can create marketplace listings
- [ ] Can create auctions
- [ ] Real-time updates work

**All checked?** You're ready to explore the full NFT Trading Game! 🎮
