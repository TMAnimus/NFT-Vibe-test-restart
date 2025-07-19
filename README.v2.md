# NFT Trading Game (NFT VibeCode) - Version 2

**Last Updated**: January 2025

**Milestone Status**: 
- ✅ **Milestone 4 (Marketplace Development)**: COMPLETED - Full marketplace with listing, purchasing, filtering, and comprehensive testing

## Overview
Welcome to **NFT VibeCode**, a gloriously absurd multiplayer parody of the NFT mania! Create hilariously over-the-top NFTs—like "Sentient JPEG of a Toaster" or "Pixelated Sock of Destiny"—and trade them in a chaotic marketplace where prices swing wilder than a crypto bro's ego. Built with a wink and a nudge, this game mocks the absurdity of NFT hype with fake celebrity endorsements, "stolen" NFT scandals, and a market that's as ridiculous as it sounds.

NFT VibeCode is a satirical multiplayer simulation of an NFT marketplace where players and Non-Player Characters (NPCs) trade Non-Fungible Tokens (NFTs) in a tick-based system with daily and weekly updates. The game parodies the absurdity of NFT markets with exaggerated price swings, simplistic authentication (e.g., 4-digit PINs), and chaotic NPC behavior. Players compete to amass wealth before the market collapses, leveraging strategic trading, market events, and collection completion bonuses. Version 2 introduces TypeScript for type safety, a configurable game economy via `server/sets/nft_config.json`, a text-based UI for the initial release, and enhanced mechanics for NPC strategies and new set debuts.

Join the fun, but don't take it too seriously—this is satire, not Sotheby's!

> **⏰ What is a Tick-Based Simulation?**  
> This game is powered by a “tick-tick-tick” simulation: the world advances in regular, automated intervals (“ticks”). Each tick (daily and weekly) triggers market updates, price changes, budget refreshes, and events for all players and NPCs. The tick system is the heartbeat of the game, driving all economic and gameplay activity.

## Project Goals
- Deliver a humorous, engaging trading experience that satirizes NFT market dynamics.
- Simulate a dynamic marketplace with player-NPC competition and tick-based updates.
- Ensure flexibility through a config file for budgets, timing, and set debut parameters.
- Support a text-based UI (version 1) with plans for graphical enhancements.
- Maintain type safety and scalability using TypeScript.

## Key Features
- **Tick-Based Gameplay**: Daily (24-hour) and weekly (7-day) ticks drive market updates, budget refreshes, and events.
- **Player Mechanics**: Players register with a username and 4-digit PIN, manage budgets (set by `PLAYER_INITIAL_BALANCE` and `PLAYER_BUDGET_REFRESH` in `nft_config.json`), and trade NFTs. Budgets refresh every second weekly tick (14 days).
- **NPC System**: NPCs with strategies (Conservative, Aggressive, Speculative, Collector, Opportunist) compete with players, influencing prices and market dynamics. Budgets are set by `NPC_INITIAL_BALANCE` and `NPC_BUDGET_REFRESH` in `nft_config.json`.
- **New Set Debuts**: New NFT sets debut until `NEW_SET_DEBUT_DAYS` (e.g., 40 days), generating most possible combinations (e.g., colors, things, props). Common/no-prop NFTs (allowing duplicates) are managed in batches (e.g., "7 brown Randy Raccoons for $100 each"). Creators reserve a portion (`CREATOR_RESERVE_PERCENTAGE`), and NPCs acquire another (`NPC_ACQUISITION_PERCENTAGE`) at debut.
- **Marketplace**: Complete NFT marketplace with listing, purchasing, and advanced filtering. Players and NPCs can list and purchase NFTs with real-time price updates. Features include batch operations for efficiency, price suggestion algorithms, and comprehensive filtering by rarity, blockchain, and price range.
- **Endgame and Leaderboard**: The game ends when all sets are “Dead” or after `GAME_DURATION_DAYS` (e.g., 90 days). Leaderboard ranks players by total money, number of trades, best trade (sale price minus purchase price), and most valuable NFT held.
- **Satirical Tone**: Absurd NPC names (e.g., “SceptreFanatic”), event descriptions (e.g., “Viral Meme Token Hype”), and UI text (e.g., “Buy this NFT to flex on the blockchain!”) mock NFT culture.

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

The system uses a random generator to create unique NFT combinations, ensuring no duplicates (except that common color/no prop can have duplicates). NFTs are stored in a MongoDB collection with indexes for fast retrieval. Prices are calculated based on attributes and updated daily, with major adjustments during weekly events.

## Prerequisites
- **Node.js**: Version 16 or higher.
- **MongoDB**: Version 5 or higher for storing game data.
- **TypeScript**: Version 4.9 or higher for type-safe development.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nft-vibecode
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the game by editing `server/sets/nft_config.json`. Example:
   ```json
   {
     "PLAYER_INITIAL_BALANCE": 10000,
     "PLAYER_BUDGET_REFRESH": 2000,
     "NPC_INITIAL_BALANCE": 10000,
     "NPC_BUDGET_REFRESH": 2000,
     "NEW_SET_DEBUT_DAYS": 40,
     "GAME_DURATION_DAYS": 90,
     "NEW_SET_SIZE": 100,
     "DUPLICATES_PER_COMMON_COMBO": 10,
     "CREATOR_RESERVE_PERCENTAGE": 0.2,
     "NPC_ACQUISITION_PERCENTAGE": 0.3
   }
   ```
4. Build and start the server:
   ```bash
   npm run build
   npm start
   ```
5. Access the game via a text-based client (e.g., terminal or web interface) at `localhost:3000`.

## Project Structure
- `server/`: Backend logic, API endpoints, and MongoDB integration.
  - `server/src/routes/marketplace.ts`: Complete marketplace API with listing, purchasing, and filtering
  - `server/src/services/marketplaceService.ts`: Business logic for marketplace operations
  - `server/src/routes/marketplace.test.ts`: Comprehensive test coverage for all marketplace features
- `client/`: Frontend interface for the marketplace
  - `client/marketplace.html`: Modern marketplace UI
  - `client/js/marketplace.js`: Interactive marketplace functionality
  - `client/styles/marketplace.css`: Responsive styling
- `server/sets/nft_config.json`: Config file for game parameters (budgets, timing, set debuts).
- `src/`: TypeScript source code for game logic and UI rendering.
- `docs/`: Documentation, including this README and related files.

## Documentation
- [README.Milestone4.md](README.Milestone4.md): Complete marketplace implementation details and status
- [README.Gameplay.md](README.Gameplay.md): Details gameplay mechanics, including budget refreshes, leaderboards, and set debuts.
- [README.Players.md](README.Players.md): Covers player mechanics, authentication, and budget management.
- [README.NPCs.md](README.NPCs.md): Describes NPC strategies, behaviors, and market impact.
- [README.Sets.md](README.Sets.md): Explains new set debut mechanics and batch management for common/no-prop NFTs.
- [README.Database.md](README.Database.md): Defines MongoDB schemas and indexes.

## Development Notes
- **TypeScript**: All components use TypeScript interfaces and enums for type safety (e.g., `interface Player`, `enum Rarity`, `interface NFT`).
- **Configurability**: Game parameters (e.g., budgets, set debut timing) are centralized in `nft_config.json` for easy tuning.
- **Error Handling**: Failed transactions, duplicate NFTs (for non-common NFTs), and event conflicts are handled with clear text feedback in the UI.
- **Testing**: Comprehensive test coverage including unit tests for budget mechanics, leaderboard calculations, set debut logic, and marketplace operations. Integration tests cover player-NPC interactions, event effects, and full marketplace functionality with authentication.
- **Satirical Tone**: Code comments, NPC names, and UI text maintain humor (e.g., “This NFT is totally not a scam!”).
- **Future Plans**:
  - Upgrade to a graphical UI in later versions.
  - Add player-triggered events (e.g., “Start a Meme Hype”).
  - Introduce social features like trading alliances or meme contest leaderboards.

## Contributing
Contributions are welcome! Submit pull requests or issues to `<repository-url>`. Ensure code follows TypeScript conventions and aligns with the game’s satirical tone (e.g., absurd variable names like `cryptoHypeMultiplier`).

## License
MIT License. See [LICENSE](LICENSE) for details.

---
For detailed mechanics, refer to the linked documentation files.