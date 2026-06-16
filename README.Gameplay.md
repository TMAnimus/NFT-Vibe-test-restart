# NFT Trading Game - Gameplay Guide (Consolidated Version)

> **Note:**  
> This document consolidates and supersedes all previous gameplay README files:  
> - README.Gameplay.md  
> - README.Gameplay.v2.md  
> - README.Gameplay.v2_Version3.md  
> The most up-to-date and accurate gameplay information is found here.

---

## Overview

NFT Trading Game (NFT VibeCode) is a satirical, multiplayer NFT marketplace simulation. Players and NPCs compete to collect, trade, and manipulate the market with a variety of absurd NFTs. The game operates on a tick-based system with daily and weekly updates, simulating a dynamic and often chaotic NFT market.

---

## Core Mechanics

- **NFT Creation:** Generate NFTs with random attributes and rarity.
- **Marketplace:** List, buy, and sell NFTs. Prices fluctuate based on rarity, batch status, and market events.
- **Events:** Market events (see [README.Events.md](README.Events.md)) can affect prices and collection status.
- **Tick-based Updates:** Daily and weekly updates drive the market, update prices, and trigger events.
- **NPCs:** Compete with NPC buyers using diverse strategies (see [README.NPCs.md](README.NPCs.md)).
- **Satirical Flavor:** The game mocks NFT culture with exaggerated price swings, silly event names, and absurd NPC behavior.

---

## Glossary

- **Set:** All NFTs of the same noun.
- **Collection:** NFTs owned by a user or NPC.
- **Batch:** Group of NFTs with the same description in the market.

---

## NFT Attributes

- **Display Name:** Satirical name (e.g., “Glowing Crypto Potato”)
- **Color Rarity:** Common, Uncommon, Rare, Very Rare
- **Prop Rarity:** NotPresent, Common, Uncommon, Rare, Very Rare
- **First of Set:** Special status for first NFT in a set
- **Blockchain:** Ethereum (default; may expand)
- **Base Price:** By rarity
- **Current Price:** Dynamic; affected by market updates and events
- **Status:** Owned, Listed, Sold
- **Collection Status:** New, Normal, Declining, Dead

---

## Gameplay Flow

### Player Budget

- **Initial Balance:** Set by `PLAYER_INITIAL_BALANCE` in `nft_config.json` (e.g., $10,000).
- **Refresh:** Players receive a budget refresh (`PLAYER_BUDGET_REFRESH`) every second weekly tick (14 days), simulating “real job” income.
- **Constraints:** Players cannot spend beyond their balance. Failed transactions are refunded instantly.
- **Bankruptcy:** If a player’s balance reaches $0 and they own no NFTs, they receive a one-time $1,000 bailout.
- **Satirical Flavor:** Budget refreshes mock “real job” income in a crypto-obsessed world.

### Trading Actions

- **Buy NFTs:** Players bid on listed NFTs during daily ticks, competing with NPCs.
- **Sell NFTs:** Players list NFTs for sale with custom or suggested prices.
- **Filters:** Marketplace listings can be filtered by color rarity, prop rarity, blockchain, or price range.

### Endgame and Leaderboard

- **Endgame Conditions:** The game ends when all NFT sets reach “Dead” status or after a set duration (`GAME_DURATION_DAYS`).
- **Leaderboard Metrics:**
  - Most Money (cash + NFT value; dead NFTs = $1)
  - Most Trades
  - Best Trade (highest profit)
  - Most Valuable NFT Held
- **Tiebreakers:** Most trades, then best trade profit.
- **Satirical Titles:** Leaderboard titles mock NFT hype (e.g., “Supreme Crypto Overlord”).

### Player-NPC Interaction

- **Bidding Competition:** Players and NPCs compete during daily ticks.
- **Visibility:** Players see NPC activity but not their strategies.
- **Impact:** Collector NPCs inflate prices for specific traits; Aggressive NPCs cause volatility.
- **Satirical Flavor:** NPC actions are exaggerated (e.g., “CryptoHypeBot panic-bought a glowing potato for $10,000!”).

### Tick-Based System

- **Daily Ticks (24 hours):** Players and NPCs place bids and list NFTs. Prices update based on activity.
- **Weekly Ticks (7 days):** Budgets refresh, market events trigger, and collection statuses update.

### Game Progression

- **Early Game:** Stable market, frequent new collections, moderate NPC activity.
- **Mid Game:** Increased volatility, more events, aggressive NPCs.
- **Late Game:** High risk of market crashes, collections turning “Dead,” opportunist NPCs dominate.

### Collection Lifecycle

- **Statuses:** New → Normal → Declining → Dead
- **Transitions:** Based on time, sales, and events (see [README.Events.md](README.Events.md)).
- **Price Floors:** $25 for active, $1 for dead.
- **Completion Bonus:** Owning all NFTs in a set grants a value bonus.

---

## Technical Features

- **Real-time updates via Socket.IO**
- **TypeScript for improved coherence**
- **Satirical authentication (4-digit PIN, hashed)**
- **Marketplace events and sentiment shifts**
- **NPC trading strategies**
- **Batch management for common NFTs**
- **Daily/weekly cycles**

---

## Environment Variables & Config

| Variable                | Description                              | Default Value (see `nft_config.json`) |
|-------------------------|------------------------------------------|---------------------------------------|
| PLAYER_INITIAL_BALANCE  | Starting budget for players              | 10000                                 |
| PLAYER_BUDGET_REFRESH   | Budget refresh every 14 days             | 2000                                  |
| NPC_INITIAL_BALANCE     | Starting budget for NPCs                 | 10000                                 |
| NPC_BUDGET_REFRESH      | Weekly budget refresh for NPCs           | 2000                                  |
| NEW_SET_DEBUT_DAYS      | Days until new sets stop debuting        | 40                                    |
| GAME_DURATION_DAYS      | Total game duration                      | 90                                    |

---

## TypeScript Integration

- All NFT, player, and event data use TypeScript interfaces and enums.
- API endpoints validate inputs using TypeScript types.
- See codebase for details.

---

## Testing

- **Unit Tests:** Budget mechanics, leaderboard, error handling.
- **Integration Tests:** Player-NPC interactions, event effects.
- **Performance Tests:** High transaction volumes, tick processing.

---

## Future Features

See [README.Future.md](README.Future.md) for planned features (GUI, player-triggered events, etc.).

---

## Related Docs

- [README.md](README.md) – Project overview
- [README.Database.v2.md](old_docs/README.Database.v2.md) – Database schema
- [README.Events.md](README.Events.md) – Event system
- [README.NPCs.md](README.NPCs.md) – NPC logic
- [README.Players.md](README.Players.md) – Player logic

---
