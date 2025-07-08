# NFT Trading Game (NFT VibeCode) - Version 2

**Last Updated**: July 6, 2025, 12:41 AM PDT

## Overview
NFT VibeCode is a satirical multiplayer simulation of an NFT marketplace where players and Non-Player Characters (NPCs) trade Non-Fungible Tokens (NFTs) in a tick-based system with daily and weekly updates. The game parodies the absurdity of NFT markets with exaggerated price swings, simplistic authentication (e.g., 4-digit PINs), and chaotic NPC behavior. Players compete to amass wealth before the market collapses, leveraging strategic trading, market events, and collection completion bonuses. Version 2 introduces TypeScript for type safety, a configurable game economy via `server/sets/nft_config.json`, a text-based UI for the initial release, and enhanced mechanics for NPC strategies and new set debuts.

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
- **Marketplace**: Players and NPCs bid on NFTs, with prices fluctuating based on supply, demand, and events. Common/no-prop NFTs are listed as batches to simplify trading.
- **Endgame and Leaderboard**: The game ends when all sets are “Dead” or after `GAME_DURATION_DAYS` (e.g., 90 days). Leaderboard ranks players by total money, number of trades, best trade (sale price minus purchase price), and most valuable NFT held.
- **Satirical Tone**: Absurd NPC names (e.g., “SceptreFanatic”), event descriptions (e.g., “Viral Meme Token Hype”), and UI text (e.g., “Buy this NFT to flex on the blockchain!”) mock NFT culture.

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
- `server/sets/nft_config.json`: Config file for game parameters (budgets, timing, set debuts).
- `src/`: TypeScript source code for game logic and UI rendering.
- `docs/`: Documentation, including this README and related files.

## Documentation
- [README.Gameplay.md](README.Gameplay.md): Details gameplay mechanics, including budget refreshes, leaderboards, and set debuts.
- [README.Players.md](README.Players.md): Covers player mechanics, authentication, and budget management.
- [README.NPCs.md](README.NPCs.md): Describes NPC strategies, behaviors, and market impact.
- [README.Sets.md](README.Sets.md): Explains new set debut mechanics and batch management for common/no-prop NFTs.
- [README.Database.md](README.Database.md): Defines MongoDB schemas and indexes.

## Development Notes
- **TypeScript**: All components use TypeScript interfaces and enums for type safety (e.g., `interface Player`, `enum Rarity`, `interface NFT`).
- **Configurability**: Game parameters (e.g., budgets, set debut timing) are centralized in `nft_config.json` for easy tuning.
- **Error Handling**: Failed transactions, duplicate NFTs (for non-common NFTs), and event conflicts are handled with clear text feedback in the UI.
- **Testing**: Unit tests validate budget mechanics, leaderboard calculations, and set debut logic. Integration tests cover player-NPC interactions and event effects.
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