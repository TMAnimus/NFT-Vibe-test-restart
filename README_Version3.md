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
- **Front-end:** HTML, CSS, JavaScript (future: React + Tailwind CSS)
- **Back-end:** Node.js with Express.js
- **Realtime:** Socket.IO
- **Database:** MongoDB
- **Authentication:** Username + 4-digit PIN (hashed), JWT for sessions
- **Testing:** Jest
- **Language:** TypeScript (v2 and onwards)

## Real-time Features
- **Live Market Updates**: See new listings and sales instantly
- **Dynamic Pricing**: Watch prices update in real-time based on market activity
- **Instant Notifications**: Receive alerts for marketplace events and price changes
- **Tick-based System**: Market updates occur on daily and weekly cycles
See [server/docs/socket-events.md](server/docs/socket-events.md) for real-time event documentation.

## Authentication
Players register with a username and a 4-digit PIN (satirical, minimal security). PINs are hashed and stored in MongoDB. JWTs are used for session management.

## Marketplace Features
- **Fixed-Price Sales**: Traditional immediate purchase marketplace
- **Auction System**: Competitive bidding with multiple auction types ✅ **IMPLEMENTED**
  - Standard Auctions (English-style bidding)
  - Dutch Auctions (decreasing price over time)
  - Reserve Auctions (hidden minimum price)
- **Real-time Bidding**: Live auction updates via Socket.IO
- **Seller Choice**: Choose between fixed-price or auction when listing NFTs

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

## Future Features
Features listed in `README.Future.md` and `README.Future.v2.md` are proposals for future versions and are _not currently implemented_.

## Milestones
Milestone documentation (e.g., `README.Milestone6.md`) is for reference/legacy only.

## Setup
See [README.setup.md](README.setup.md) for installation and development instructions.