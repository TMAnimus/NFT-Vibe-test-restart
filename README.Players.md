# Player System for NFT Trading Game

**Last Updated**: July 5, 2025, 11:26 PM PDT

## Overview
This document details the player system for the *NFT Trading Game* (NFT VibeCode), a satirical multiplayer simulation of an NFT marketplace. Players create accounts, manage budgets, and trade NFTs in a tick-based system with daily and weekly updates, competing against other players and NPCs. The system uses a deliberately simplistic 4-digit PIN for authentication, poking fun at crypto wallet security, and is implemented with TypeScript for type safety.

## Goals
- Enable players to register, manage budgets, and trade NFTs in a dynamic marketplace.
- Provide a satirical yet engaging player experience with strategic trading opportunities.
- Support competition with NPCs and other players through bidding and market events.
- Ensure budget mechanics (initial balance and refresh) are configurable via the game’s config file.
- Align player actions with the game’s tick-based system and satirical tone.

## Player Model
Players are stored in the MongoDB `Players` collection, with attributes for authentication, budget, and game state.

**Schema** (TypeScript):
```typescript
interface Player {
  id: string; // Unique identifier (UUID)
  username: string; // Player's chosen username
  pinHash: string; // Hashed 4-digit PIN (satirical, minimal security)
  wallet: {
    balance: number; // Current budget (from nft_config.json PLAYER_INITIAL_BALANCE)
    totalSpent: number; // Total spent on NFTs
    totalEarned: number; // Total earned from sales
    lastRefresh: Date; // Weekly budget refresh timestamp
  };
  ownedNFTs: string[]; // Array of NFT IDs
  transactionHistory: string[]; // Array of Transaction IDs
  createdAt: Date; // Account creation timestamp
}
```

**Indexes**:
- `username` (unique): Fast lookup for login.
- `id`: Primary key for queries.

**Notes**:
- The 4-digit PIN is hashed (e.g., using bcrypt) for basic security, despite the satirical minimal security theme.
- Budget balance and refresh amounts are defined in `server/sets/nft_config.json` (`PLAYER_INITIAL_BALANCE` and `PLAYER_BUDGET_REFRESH`), aligning with NPC budget settings.

## Player Mechanics
### Account Setup
- Players register with a username and a 4-digit PIN, stored securely with hashed PINs in MongoDB.
- Authentication uses JSON Web Tokens (JWT) for session management, issued upon login.
- Satirical flavor: The simplistic PIN mocks flimsy crypto wallet security (e.g., “Your NFTs are safe… probably!”).

### Budget Management
- **Initial Balance**: Set by `PLAYER_INITIAL_BALANCE` in `nft_config.json` (e.g., $10,000).
- **Weekly Refresh**: Players receive a budget refresh defined by `PLAYER_BUDGET_REFRESH` in `nft_config.json` (e.g., $2,000) every 7-day tick, simulating external income.
- **Constraints**: Players cannot spend beyond their balance. Failed transactions (e.g., outbid by NPCs) are refunded instantly.
- **Bankruptcy**: If a player’s balance reaches $0 and they own no NFTs, they receive a one-time $1,000 bailout to continue playing.

### Trading Actions
- **Buy NFTs**: Players bid on listed NFTs during daily ticks, competing with NPCs. Highest bid wins.
- **Sell NFTs**: Players list NFTs for sale with custom prices or suggested values based on `NFT.currentPrice`.
- **Filters**: Players can filter marketplace listings by color rarity, prop rarity, blockchain, or price range.
- **Transaction History**: All trades are logged in the `Transactions` collection, accessible via the player’s UI.

## Player-NPC Interaction
- **Bidding Competition**: Players and NPCs bid simultaneously during daily ticks. NPCs’ randomized response times (0-500ms) create unpredictable competition.
- **Visibility**: Players see NPC activity (e.g., “SceptreFanatic bought a sceptre cat for $500”) but not NPC strategies or focus.
- **Impact**:
  - Collector NPCs drive up prices for specific attributes (e.g., “sceptre” NFTs), creating opportunities for players to sell at premiums.
  - Aggressive NPCs cause market volatility, challenging players to time trades.
  - Players can exploit Opportunist NPCs’ buying during market dips.

## Tick-Based Behavior
- **Daily Ticks (24 hours)**:
  - Players can place bids, list NFTs, or cancel listings.
  - Price updates reflect player and NPC activity (e.g., heavy player buying increases prices by up to 20%).
- **Weekly Ticks (7 days)**:
  - Budgets refresh (amount from `nft_config.json`).
  - Players react to market events (e.g., buy during “cryptoMarketCrash” for $1 floor NFTs).
  - Collection status updates affect player strategies.

## Market Influence
- **Price Fluctuations**: Player trades contribute to `NFT.currentPrice` changes:
  - Buy pressure: +5-20% per tick (multiplicative).
  - Sell pressure: -5-15% per tick.
- **Collection Status**: Player buying can delay a collection’s transition to “Declining” or “Dead”; selling accelerates it.
- **Event Responses**: Players can capitalize on events (e.g., sell during “Viral Meme Token Hype” for boosted prices).

## Environment Variables
| Variable | Description | Default Value |
|----------|之旅-------------|---------------|
| `PLAYER_INITIAL_BALANCE` | Starting budget for players | Configured in `nft_config.json` (e.g., `10000`) |
| `PLAYER_BUDGET_REFRESH` | Weekly budget refresh amount | Configured in `nft_config.json` (e.g., `2000`) |

## TypeScript Integration
- **Type Safety**: The `Player` interface ensures consistent data handling for budgets and transactions.
- **Validation**: API endpoints validate player inputs (e.g., bids, listings) against `wallet.balance` (from `nft_config.json`) and market conditions.
- **JWT Handling**: TypeScript types ensure secure session management (e.g., `interface JWTPayload { userId: string }`).

## Testing
- **Unit Tests**:
  - Validate player registration and PIN hashing.
  - Test budget mechanics (e.g., initial balance and refresh from `nft_config.json`).
  - Ensure transaction validation (e.g., sufficient balance).
- **Integration Tests**:
  - Simulate player-NPC bidding wars.
  - Verify player-event interactions (e.g., buying during market events).
- **Performance Tests**:
  - Handle multiple players with high transaction volumes.
  - Ensure tick processing completes within 1 second.

## Notes
- The 4-digit PIN adds satirical humor, mimicking insecure crypto wallets, but is hashed for minimal responsibility.
- Budget settings in `nft_config.json` allow tuning of player and NPC economies for balance.
- Player actions are logged in the `Transactions` collection for transparency.

## Future Considerations
- **Achievements**: Reward players for milestones (e.g., completing a collection, earning $10,000 profit).
- **Player Rankings**: Expand leaderboards to include player-specific metrics (e.g., most collections completed).
- **Social Features**: Allow players to form trading alliances or compete in meme contests (see `README.Future.md`).

---
See the main [README.md](README.md), [README.Database.md](README.Database.md), and [README.NPCs.md](README.NPCs.md) for project context and related schemas.