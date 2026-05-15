# Gameplay Mechanics for NFT Trading Game (Version 2)

**Last Updated**: July 6, 2025, 12:33 AM PDT

## Overview
This document outlines the gameplay mechanics for the *NFT Trading Game* (NFT VibeCode), a satirical multiplayer simulation of an NFT marketplace. Players and NPCs trade NFTs in a tick-based system with daily and weekly updates, competing to amass wealth before the market collapses. The game mocks the absurdity of NFT markets with exaggerated price swings, simplistic authentication, and chaotic NPC behavior. Gameplay is implemented with TypeScript for type safety, and key parameters (e.g., budgets, timing) are defined in `server/sets/nft_config.json`.

## Goals
- Provide a strategic, competitive trading experience with satirical humor.
- Simulate a dynamic NFT marketplace with player and NPC interactions.
- Support tick-based updates (daily and weekly) for market and collection changes.
- Ensure configurable mechanics via the game’s config file.
- Deliver a text-based UI for version 1 with clear feedback.

## Game Mechanics

### Player Budget
- **Initial Balance**: Set by `PLAYER_INITIAL_BALANCE` in `nft_config.json` (e.g., $10,000).
- **Refresh**: Players receive a budget refresh defined by `PLAYER_BUDGET_REFRESH` in `nft_config.json` (e.g., $2,000) every second weekly tick (14 days), simulating external income.
- **Constraints**: Players cannot spend beyond their balance. Failed transactions (e.g., outbid by NPCs) are refunded instantly.
- **Bankruptcy**: If a player’s balance reaches $0 and they own no NFTs, they receive a one-time $1,000 bailout to continue playing.
- **Satirical Flavor**: Budget refreshes mock “real job” income in a crypto-obsessed world (e.g., “Your day job wired $2,000 to fuel your NFT addiction!”).

### Trading Actions
- **Buy NFTs**: Players bid on listed NFTs during daily ticks, competing with NPCs. Bidding mechanics are TBD.
- **Sell NFTs**: Players list NFTs for sale with custom prices or suggested values based on `NFT.currentPrice`.
- **Filters**: Players can filter marketplace listings by color rarity, prop rarity, blockchain, or price range.

### Endgame and Leaderboard
- **Endgame Conditions**: The game ends when 100% of NFT sets reach “Dead” status or after a duration defined in `nft_config.json` (e.g., 90 days).
- **Leaderboard Metrics**:
  - **Most Money**: Total cash balance plus the current value of owned NFTs (`Dead` NFTs valued at $1).
  - **Most Trades**: Total number of successful buy and sell transactions.
  - **Best Trade**: Highest profit from a single trade (final sale price minus initial purchase price).
  - **Most Valuable NFT Held**: Highest current price of any single NFT in a player’s portfolio.
- **Ties**: If players have equal money totals, the player with the most trades wins. If still tied, the best trade profit is the tiebreaker.
- **Satirical Flavor**: Leaderboard titles mock NFT hype (e.g., “Supreme Crypto Overlord” for most money).

### Player-NPC Interaction
- **Bidding Competition**: Bidding mechanics are TBD, but players and NPCs compete during daily ticks.
- **Visibility**: Players see NPC activity (e.g., “SceptreFanatic bought a sceptre cat for $500”) but not specific NPC strategies or focus.
- **Impact**:
  - Collector NPCs inflate prices for specific colors, props, or color-prop combos (e.g., a “sceptre” focus increases sceptre NFT prices by up to 20%).
  - Aggressive NPCs cause market volatility, challenging players to time trades.
  - Players can exploit Collector focus by listing matching NFTs at premium prices.
- **Satirical Flavor**: NPC actions are exaggerated (e.g., “CryptoHypeBot panic-bought a glowing potato for $10,000!”).

### Tick-Based System
- **Daily Ticks (24 hours)**:
  - Players and NPCs place bids and list NFTs.
  - Prices update based on buying/selling pressure (e.g., +5-20% for buying, -5-15% for selling, multiplicative).
  - Collection status changes (e.g., no sales for 14 days moves “Normal” to “Declining”).
- **Weekly Ticks (7 days)**:
  - Budgets refresh for players (every second weekly tick) and NPCs (every tick) per `nft_config.json`.
  - Market events trigger (e.g., “cryptoMarketCrash”).
  - Collection status updates (e.g., “Declining” to “Dead” after 30 days without sales).

### Game Progression
- **Early Game (Days 1–14)**: Stable market with frequent “New” collections and moderate NPC activity. New sets debut as defined in `nft_config.json` (e.g., `NEW_SET_DEBUT_DAYS` up to day 40).
- **Mid Game (Days 15–60)**: Increased volatility with more events (2–3 weekly) and Aggressive NPCs driving price spikes. New sets debut until day 40.
- **Late Game (Day 61+)**: High risk of market crashes and collections turning “Dead,” with Opportunist NPCs dominating flash sales.
- **New Sets**: New collections can debut until `NEW_SET_DEBUT_DAYS` (e.g., 40) from `nft_config.json`, adding fresh trading opportunities.

### Collection Lifecycle
- **Statuses**: `New`, `Normal`, `Declining`, `Dead`.
- **Transitions**:
  - `New` to `Normal`: After 7 days or 50% of NFTs sold.
  - `Normal` to `Declining`: No sales for 14 days or 30% average price drop.
  - `Declining` to `Dead`: No sales for 30 days or during a `cryptoMarketCrash` event.
  - Media events (e.g., “Celebrity Endorsement”) can revert to “New”.
- **Price Floors**: $25 for active collections (`New`, `Normal`, `Declining`), $1 for `Dead`.
- **Completion Bonus**: Completing a collection (owning all NFTs in a set) grants a 20% value bonus or market perks.

## User Interface (Version 1)
- **Marketplace**: Text-based descriptions of NFT listings with filters for color rarity, prop rarity, blockchain, and price range. Players list NFTs via commands (e.g., “List NFT #123 for $500”).
- **Event Calendar**: Text-based list of upcoming weekly events and active daily events (e.g., “Viral Meme Token Hype: +35% to rare colors”).
- **Feedback**: Price changes are shown in text (e.g., “Price up 10%!” in green, “Price down 15%!” in red). Event notifications appear as text alerts.
- **Satirical Flavor**: UI text mocks NFT jargon (e.g., “Buy this NFT to flex on the blockchain!”).
- **TypeScript Integration**: Frontend uses TypeScript interfaces for NFT and event data to ensure type-safe rendering.

## Error Handling
- **Failed Transactions**: If a bid fails (e.g., insufficient funds), a text notification is displayed, and funds are not deducted.
- **Duplicate NFTs**: The system validates uniqueness for non-common NFTs during generation, logging errors if duplicates occur.
- **Event Conflicts**: Multiple events stack multiplicatively (e.g., Viral Meme Token Hype (+35%) and Celebrity Endorsement (+30%) result in 1.35 * 1.30 = 1.755x multiplier).

## Environment Variables
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PLAYER_INITIAL_BALANCE` | Starting budget for players | Configured in `nft_config.json` (e.g., `10000`) |
| `PLAYER_BUDGET_REFRESH` | Budget refresh every second weekly tick | Configured in `nft_config.json` (e.g., `2000`) |
| `NPC_INITIAL_BALANCE` | Starting budget for NPCs | Configured in `nft_config.json` (e.g., `10000`) |
| `NPC_BUDGET_REFRESH` | Weekly budget refresh for NPCs | Configured in `nft_config.json` (e.g., `2000`) |
| `NEW_SET_DEBUT_DAYS` | Days until new sets stop debuting | Configured in `nft_config.json` (e.g., `40`) |
| `GAME_DURATION_DAYS` | Total game duration | Configured in `nft_config.json` (e.g., `90`) |

## TypeScript Integration
- **Type Safety**: All NFT, player, and event data use TypeScript interfaces (e.g., `interface NFT { id: string; rarity: Rarity }`) to prevent runtime errors.
- **Enums**: Fixed values like rarity (`Common`, `Uncommon`, `Rare`, `VeryRare`), collection status (`New`, `Normal`, `Declining`, `Dead`), and NPC strategies (`Conservative`, `Collector`) are defined as enums.
- **Validation**: API endpoints validate inputs using TypeScript types, ensuring robust marketplace interactions.

## Testing
- **Unit Tests**:
  - Validate budget mechanics (e.g., refresh every second weekly tick from `nft_config.json`).
  - Test leaderboard calculations (e.g., best trade as sale price minus purchase price).
  - Ensure error handling for failed transactions and duplicates.
- **Integration Tests**:
  - Simulate player-NPC interactions and event effects.
  - Verify new set debuts stop after `NEW_SET_DEBUT_DAYS`.
- **Performance Tests**:
  - Handle multiple players and NPCs with high transaction volumes.
  - Ensure tick processing completes within 1 second.

## Notes
- The game’s satirical tone is reinforced through absurd NPC names, event descriptions, and UI text.
- Config file (`nft_config.json`) centralizes budget and timing parameters for flexibility.
- Player actions are logged in the `Transactions` collection for transparency.

## Future Considerations
- **Graphical UI**: Upgrade from text-based to visual UI in later versions.
- **Dynamic Events**: Introduce player-triggered events (e.g., “Start a Meme Hype”).
- **Social Features**: Add trading alliances or leaderboards for meme contests.

---
See the main [README.md](README.md), [README.Database.md](README.Database.md), [README.NPCs.md](README.NPCs.md), and [README.Players.md](README.Players.md) for project context and related schemas.