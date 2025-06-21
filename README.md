# NFT Trading Game with a Satirical Twist

## Overview
Welcome to the *NFT Trading Game*, a gloriously absurd multiplayer parody of the NFT mania! Create hilariously over-the-top NFTs—like "Sentient JPEG of a Toaster" or "Pixelated Sock of Destiny"—and trade them in a chaotic marketplace where prices swing wilder than a crypto bro's ego. Built with a wink and a nudge, this game mocks the absurdity of NFT hype with fake celebrity endorsements, "stolen" NFT scandals, and a market that's as ridiculous as it sounds. Join the fun, but don't take it too seriously—this is satire, not Sotheby's!

## Gameplay
The game simulates a realistic (yet absurd) NFT marketplace where players can:
- Generate and collect unique NFTs with varying rarities
- Trade NFTs in a dynamic marketplace with daily and weekly updates
- Experience market events that affect prices
- Compete for "First of Set" NFTs
- Watch as the market inevitably crashes (because of course it will)

For detailed gameplay mechanics, see [README.Gameplay.md](README.Gameplay.md).

## Requirements

The game should:

- Support multiple players trading NFTs in a tick-based system
- Allow players to register and manage their NFTs with an intentionally simplistic 4-digit PIN (because who needs security in a parody?)
- Generate unique NFTs with satirical attributes and rarity levels
- Provide a marketplace for listing, browsing, and purchasing NFTs
- Update the marketplace daily to reflect new listings and sales
- Include satirical mechanics like weekly market events (e.g., "Leon Muskrat tweets about your NFT") or absurd valuations
- Simulate realistic market dynamics with daily price fluctuations and weekly events

## Tech Stack (may be changed)

- **Front-end**: HTML, CSS, JavaScript  
- **Back-end**: Node.js with Express.js  
- **Real-time communication**: Socket.IO  
- **Database**: MongoDB  
- **Authentication**: JSON Web Tokens (JWT) (Note: for managing sessions, not for security)
- **Testing**: Jest (for unit tests)

## Authentication
Users register with a username and a 4-digit PIN, stored securely in MongoDB with hashed PINs. JWTs are issued upon login for session management. The 4-digit PIN is a satirical nod to overly simplistic crypto wallets—security isn't the point in this tongue-in-cheek game, but we still hash the PINs to keep things minimally responsible.

## NFT System
NFTs are generated with the following attributes:
- **Display Name**: A satirical string (e.g., "Glowing Crypto Potato")
- **Color Rarity**: Common, Rare, or VeryRare
- **Prop Rarity**: NotPresent, Common, Rare, or VeryRare
- **First of Set**: Special status for the first NFT in a collection
- **Blockchain**: The blockchain the NFT is minted on (defaults to Ethereum)
- **Base Price**: Starting price based on rarity
- **Current Price**: Dynamic price affected by daily updates and weekly events
- **Status**: Owned, Listed, or Sold
- **Collection Status**: New, Normal, Declining, or Dead

The system uses a random generator to create unique NFT combinations, ensuring no duplicates (except that common color/no prop can have duplicates). (Note: may change this to a system where the NFTs for a given set are generated at the beginning.) NFTs are stored in a MongoDB collection with indexes for fast retrieval. Prices are calculated based on attributes and updated daily, with major adjustments during weekly events.

## Market Events 
The game includes various market events that affect NFT prices and market dynamics:
- **Daily Events**:
  - Price fluctuations
  - Collection status updates
  - NPC trading decisions
- **Weekly Events**:
  - Environmental Backlash: Reduces prices due to "environmental concerns"
  - Media Events: Boosts prices based on "celebrity" interest
  - Market Crashes: Simulates the inevitable NFT market collapse
  - Special Sales: Limited-time events with unique pricing
  - Collection status changes
- (More details in README.Events.md)

## Milestones

1. **Project Setup (Completed)**  
   - [x] Create project repository and folder structure  
   - [x] Install dependencies (libraries from Tech Stack)  
   - [x] Build a basic front-end page to verify server connection  

2. **User Authentication**  
   - Implement registration and login with username and 4-digit PIN authentication  
   - Set up JWT for session management  
   - Create user profiles to store player data (username, balance, NFTs)  

3. **NFT Creation System**  
   - Design NFT schema with attributes and rarity system  
   - Build a system for generating unique NFTs with random combinations  
   - Implement price calculation based on rarity and events  
   - Add unit tests to validate NFT generation and pricing  

4. **Marketplace Development**  
   - Create listing and purchase functionality  
   - Implement advanced filtering and search  
   - Add daily price updates and weekly market events  

5. **Real-time Multiplayer Features**  
   - Integrate Socket.IO for daily marketplace updates  
   - Implement notifications for listings and sales  
   - Add user-specific event handling  

6. **Market Simulation**  
   - Implement tick-based market system
   - Add daily price fluctuations
   - Create weekly market events
   - Implement NPC trading strategies

## Setup
See [README.setup.md](README.setup.md) for installation and setup instructions.

## Contributing
Want to add a "Quantum Blockchain Hamster" NFT or code a market crash triggered by a viral meme? We welcome contributions! Follow these steps:
1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add epic feature"`
4. Submit a pull request with a clear description

**All AI agents and contributors must follow the [AI Contribution Rules](AI_RULES.md).**

Check GitHub Issues for open tasks or propose new ideas. Please ensure code follows the project's satirical vibe!

## Project Structure

```
NFT_test_3/
├── client/
│   └── index.html (front-end placeholder)
├── server/
│   ├── src/
│   ├── tsconfig.json
│   ├── package.json
│   └── (other server files)
├── README.md
└── ...
```

## Running the Server

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the API docs at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)