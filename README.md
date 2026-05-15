# NFT Trading Game

## Overview
NFT Trading Game is a satirical multiplayer simulation of an NFT marketplace, built as a parody of the NFT craze. You’ll create absurd NFTs (“Sentient JPEG of a Toaster”, “Pixelated Sock of Destiny”) and trade them in a chaotic, ever-fluctuating market.

This project is developed using TypeScript for type safety and maintainability.

**Note:** References to "vibe coding" or "NFT VibeCode" in documentation are about the process of building the game, _not_ the game’s name.

## Gameplay
See [README.Gameplay.v2.md](README.Gameplay.v2.md) for detailed, up-to-date gameplay mechanics.

## Key Concepts

- **Set:** All NFTs created with the same noun (e.g., Crypto Potatoes, Crypto Pencils, Capybaras).
- **Collection:** The group of NFTs owned by a particular user or NPC.
- **Batch:** A group of NFTs with the same description, managed as a unit in the marketplace.

## NFT Rarity
NFTs have the following rarity options:
- **Color Rarity:** Common, Uncommon, Rare, Very Rare
- **Prop Rarity:** NotPresent, Common, Uncommon, Rare, Very Rare

## Tech Stack
- **Front-end:** React + TypeScript + Tailwind CSS ✅ **IMPLEMENTED**
- **Back-end:** Node.js with Express.js + TypeScript
- **Realtime:** Socket.IO for live updates
- **Database:** MongoDB with Mongoose
- **Authentication:** Username + 4-digit PIN (hashed), JWT for sessions
- **Testing:** Jest (104/104 tests passing)
- **Build Tools:** Vite (frontend), TypeScript compiler (backend)
- **Styling:** Tailwind CSS v3 with custom component classes

## Frontend Features ✅ **MODERN REACT + TAILWIND**
- **Shared Type System**: `client/src/types/index.ts` mirrors server-side enums — `MarketStatus`, `AuctionType`, `Rarity`, `NFT`, `Auction` — used across all components
- **NFT Market Status**: Four states — `Owned`, `Listed`, `Auction`, `Sold` — with coloured badges in the UI
- **Tailwind CSS Styling**: Utility-first CSS with custom component classes (`btn-primary`, `card-auction`, etc.)
- **Responsive Design**: Mobile-first layout with consistent design system
- **Interactive Components**: Real-time auction cards, modal dialogs, and form validation
- **Production Build**: Optimised Vite build with CSS purging

See [README.Frontend.md](README.Frontend.md) for full frontend architecture documentation.

## Real-time Features
- **Live Market Updates**: See new listings and sales instantly
- **Dynamic Pricing**: Watch prices update in real-time based on market activity
- **Instant Notifications**: Receive alerts for marketplace events and price changes
- **Real-time Bidding**: Live auction updates with countdown timers
- **Tick-based System**: Market updates occur on daily and weekly cycles
See [server/docs/socket-events.md](server/docs/socket-events.md) for real-time event documentation.

## Authentication
Players register with a username and a 4-digit PIN (satirical, minimal security). PINs are hashed and stored in MongoDB. JWTs are used for session management.

## Marketplace Features
- **Dual Marketplace Interface**: Modern React components with tabbed navigation
- **Fixed-Price Sales**: Traditional immediate purchase marketplace with instant buying
- **Complete Auction System**: ✅ **FULLY IMPLEMENTED**
  - **🔨 Standard Auctions**: English-style bidding with real-time updates
  - **⚡ Dutch Auctions**: Decreasing price over time with live price display
  - **💎 Reserve Auctions**: Hidden minimum price with status indicators
- **Interactive UI Elements**: 
  - Real-time countdown timers for active auctions
  - Live bid validation and submission forms
  - Responsive auction cards with Tailwind styling
- **NFT Generation Interface**: Modal-based NFT creation from 15 available collections
- **User Activity Tracking**: "My Auctions" and "My Bids" management interface
- **Real-time Notifications**: Toast-style notifications with custom animations

## Marketplace Events
See [README.Events.md](README.Events.md) for current events. For proposed future events, see [README.Future.v2.md](README.Future.v2.md).

## Auction System ✅ FULLY IMPLEMENTED
The comprehensive auction system is **production-ready** with complete frontend and backend implementation:
### Auction Types
- **🔨 Standard Auctions**: English-style bidding where highest bid wins
- **⚡ Dutch Auctions**: Price starts high and decreases over time, first bidder wins
- **💎 Reserve Auctions**: Hidden minimum price that must be met
### Key Features
- **Seller Choice**: Choose between fixed-price sales or auctions when listing
- **Real-time Bidding**: Live bid updates with Socket.IO integration
- **Interactive UI**: Countdown timers, bid validation, and auction status indicators
- **Automatic Processing**: Tick system handles auction expiration and Dutch price decreases
- **Comprehensive Notifications**: Real-time alerts for bids, wins, and auction events
- **Transaction Safety**: Full MongoDB transaction support with rollback capabilities
### Technical Implementation
- **Backend**: Complete auction service with validation, error handling, and Socket.IO events
- **Frontend**: Interactive React components with real-time updates and responsive design
- **Testing**: 104/104 tests passing including auction-specific unit and integration tests
- **Documentation**: Complete API documentation with all endpoints and Socket.IO events
### Documentation
- **[Complete API Documentation](server/docs/api-documentation.md)**: Full REST API reference with auction endpoints ✅
- **[Socket.IO Events](server/docs/socket-events.md)**: Real-time event documentation with auction events ✅
- **[Implementation Demo](AUCTION_DEMO.md)**: Detailed implementation guide and usage examples

## NPC Buyers System 🚧 IN DEVELOPMENT
The NPC system (Milestone 6) is currently being built on the `NPCs` branch. NPCs will simulate real market participants with five distinct trading strategies:

- **Conservative** — stable, long-term holders that reduce volatility
- **Aggressive** — high-risk traders that create price swings and attempt market manipulation
- **Speculative** — trend-followers that amplify hype cycles
- **Collector** — obsessive buyers fixated on a specific colour, prop, or colour+prop combination
- **Opportunist** — event-driven traders that capitalise on market dips

NPCs participate in the existing tick system, use the same marketplace service functions as players, and their activity is visible in the trade feed. Players can observe and exploit NPC behaviour patterns.

See [README.NPCs.md](README.NPCs.md) for full design and implementation detail.  
See [README.Milestone6.md](README.Milestone6.md) for the sub-milestone breakdown.

## Future Features
Features listed in `README.Future.md` and `README.Future.v2.md` are proposals for future versions and are _not currently implemented_.

## Milestones
See [README.Milestones.md](README.Milestones.md) for complete milestone overview and project status.

**Current Status**: ✅ **Production Ready** (Milestones 4 & 5 + Post-M5 auction system & frontend) | 🚧 **Milestone 6 (NPCs) in development**

## Development Setup
See [README.setup_Version3.md](README.setup_Version3.md) for complete installation and development instructions.

### Quick Start
```bash
# Backend (Terminal 1)
cd server && npm install && npm run build && npm start

# Frontend (Terminal 2) 
cd client && npm install && npm run dev
```

**Access**: Frontend at http://localhost:5173, Backend API at http://localhost:3000/api-docs

## Testing

### Quick Health Check
Run the automated health check to verify everything is set up correctly:

**Windows:**
```bash
test-quick.bat
```

**Linux/Mac:**
```bash
chmod +x test-quick.sh
./test-quick.sh
```

### Manual Testing
See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive manual testing scenarios including:
- User registration and login
- NFT generation and management
- Fixed-price marketplace operations
- All three auction types (Standard, Dutch, Reserve)
- Real-time features and notifications
- Edge cases and error handling

### API Testing
Test all API endpoints automatically:

**Linux/Mac:**
```bash
chmod +x test-api.sh
./test-api.sh
```

Or use the Swagger UI at http://localhost:3000/api-docs

### Automated Tests
```bash
# Backend tests (104 tests)
cd server && npm test

# Frontend tests
cd client && npm test

# Run specific test suite
cd server && npm test -- marketplace.test.ts
```