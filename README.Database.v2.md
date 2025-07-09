# Database Schema for NFT Trading Game (Version 2)

**Last Updated**: July 6, 2025, 12:43 AM PDT

## Overview
This document defines the MongoDB database schemas for the *NFT Trading Game* (NFT VibeCode), a satirical multiplayer simulation of an NFT marketplace. The schemas support players, NPCs, NFTs, sets, and transactions, enabling tick-based gameplay, budget management, and new set debuts with batch management for common/no-prop NFTs. All schemas are implemented with TypeScript for type safety, and key parameters (e.g., budgets) are sourced from `server/sets/nft_config.json`.

## Goals
- Provide a robust data structure for players, NPCs, NFTs, sets, and transactions.
- Support batch management for common/no-prop NFTs (e.g., “7 brown Randy Raccoons for $100 each”).
- Ensure efficient querying with indexes for marketplace and leaderboard operations.
- Align with gameplay mechanics (e.g., budget refreshes, set debuts) and satirical tone.

## Database Collections

### Players
Stores player data, including authentication, budget, and owned NFTs.

**Schema** (TypeScript):
```typescript
enum Rarity {
  Common = "common",
  Uncommon = "uncommon",
  Rare = "rare",
  VeryRare = "veryrare",
}

interface Player {
  id: string; // Unique identifier (UUID)
  username: string; // Unique username
  pinHash: string; // Hashed 4-digit PIN (satirical, minimal security)
  wallet: {
    balance: number; // Current budget (from PLAYER_INITIAL_BALANCE)
    totalSpent: number; // Total spent on NFTs
    totalEarned: number; // Total earned from sales
    lastRefresh: Date; // Timestamp of last budget refresh (every second weekly tick)
  };
  ownedNFTs: string[]; // Array of NFT IDs
  transactionHistory: string[]; // Array of Transaction IDs
  createdAt: Date; // Account creation timestamp
}
```

**Indexes**:
- `username` (unique): Fast lookup for login.
- `id`: Primary key for queries.

### NPCs
Stores NPC data, including strategies and portfolios.

**Schema** (TypeScript):
```typescript
enum StrategyType {
  Conservative = "conservative",
  Aggressive = "aggressive",
  Speculative = "speculative",
  Collector = "collector",
  Opportunist = "opportunist",
}

enum CollectorFocusType {
  Color = "color",
  Prop = "prop",
  ColorAndProp = "colorAndProp",
}

interface CollectorFocus {
  type: CollectorFocusType; // Focus type
  color?: string; // Specific color (e.g., "purple") if applicable
  prop?: string; // Specific prop (e.g., "sceptre") if applicable
}

interface NPC {
  id: string; // Unique identifier (UUID)
  name: string; // Satirical name (e.g., "SceptreFanatic")
  strategy: {
    type: StrategyType; // Trading strategy
    riskTolerance: number; // 0-1, affects purchase decisions
    collectionPreferences?: string[]; // Preferred collection IDs (non-Collectors)
    collectorFocus?: CollectorFocus; // Used only by Collectors
  };
  wallet: {
    balance: number; // Current budget (from NPC_INITIAL_BALANCE)
    totalSpent: number; // Total spent on NFTs
    totalEarned: number; // Total earned from sales
    lastRefresh: Date; // Weekly budget refresh timestamp
  };
  portfolio: {
    nfts: string[]; // Array of NFT IDs
    collections: string[]; // Array of Collection IDs
    firstOfSets: string[]; // Array of First of Set NFT IDs
  };
  behavior: {
    lastAction: Date; // Timestamp of last trade
    actionFrequency: number; // Actions per daily tick (0-5)
    preferredPriceRange: {
      min: number; // Minimum price willing to pay
      max: number; // Maximum price willing to pay
    };
  };
}
```

**Indexes**:
- `id`: Primary key.
- `strategy.type`: For filtering NPCs by strategy.
- `strategy.collectorFocus.type`: For querying Collector NPCs by focus.

### NFTs
Stores NFT data, including attributes and batch information for common/no-prop NFTs.

**Schema** (TypeScript):
```typescript
enum CollectionStatus {
  New = "new",
  Normal = "normal",
  Declining = "declining",
  Dead = "dead",
}

interface Prop {
  name: string; // Prop name (e.g., "sceptre", "hat")
  rarity: Rarity; // Prop rarity
}

interface NFT {
  id: string; // Unique identifier (UUID)
  setId: string; // Reference to Sets collection
  color: string; // Color (e.g., "brown", "purple")
  thing: string; // Base item (e.g., "Randy Raccoon", "Cat")
  props: Prop[]; // Array of props (empty for no-prop NFTs)
  rarity: Rarity; // Derived from color and props
  currentPrice: number; // Current market price
  batchCount?: number; // Number of duplicates for common/no-prop NFTs
  batchPrice?: number; // Shared price for batch (common/no-prop only)
  status: CollectionStatus; // Inherited from parent set
  createdAt: Date; // Creation timestamp
}
```

**Indexes**:
- `id`: Primary key.
- `setId`: For querying NFTs by set.
- `color`: For filtering by color (e.g., Collector focus).
- `props.name`: For filtering by prop (e.g., Collector focus).
- `rarity`: For marketplace filtering.

**Notes**:
- **Common/No-Prop NFTs**: For NFTs with common colors and no props (e.g., “brown Randy Raccoon”), `batchCount` tracks the number of duplicates available in the marketplace, and `batchPrice` sets the shared price (e.g., “7 brown Randy Raccoons for $100 each”).
- **Unique NFTs**: Non-common NFTs or those with props have `batchCount` and `batchPrice` undefined and are listed individually.

### Sets
Stores metadata for NFT sets, including debut details.

**Schema** (TypeScript):
```typescript
interface Set {
  id: string; // Unique identifier (UUID)
  name: string; // Set name (e.g., "Crypto Cats")
  status: CollectionStatus; // New, Normal, Declining, Dead
  totalNFTs: number; // Total NFTs (unique + duplicates)
  uniqueNFTCount: number; // Number of unique NFTs
  commonComboCount: number; // Number of common/no-prop combinations
  duplicatesPerCommonCombo: number; // Duplicates per common/no-prop combo
  creatorReserved: number; // Number of NFTs reserved by creators
  npcAcquired: number; // Number of NFTs acquired by NPCs at debut
  debutDate: Date; // Timestamp of set debut
}
```

**Indexes**:
- `id`: Primary key.
- `status`: For filtering active sets.
- `debutDate`: For tracking debut timing.

### Transactions
Stores records of all trades for transparency.

**Schema** (TypeScript):
```typescript
interface Transaction {
  id: string; // Unique identifier (UUID)
  nftId: string; // Reference to NFT
  batchCount?: number; // Number of common/no-prop NFTs bought/sold (if applicable)
  buyerId: string; // Player or NPC ID
  sellerId: string; // Player, NPC, or "system" (for debut sales)
  price: number; // Transaction price (batchPrice * batchCount for batches)
  timestamp: Date; // Transaction timestamp
}
```

**Indexes**:
- `nftId`: For querying transactions by NFT.
- `buyerId`: For player/NPC transaction history.
- `sellerId`: For player/NPC transaction history.
- `timestamp`: For sorting and leaderboard calculations.

## Config Integration
Key parameters are sourced from `nft_config.json`:
- `PLAYER_INITIAL_BALANCE`: Initial player budget (e.g., 10000).
- `PLAYER_BUDGET_REFRESH`: Player budget refresh every second weekly tick (e.g., 2000).
- `NPC_INITIAL_BALANCE`: Initial NPC budget (e.g., 10000).
- `NPC_BUDGET_REFRESH`: Weekly NPC budget refresh (e.g., 2000).
- `NEW_SET_SIZE`: Number of unique NFTs per set (e.g., 100).
- `DUPLICATES_PER_COMMON_COMBO`: Duplicates for common/no-prop combinations (e.g., 10).
- `CREATOR_RESERVE_PERCENTAGE`: Percentage reserved by creators (e.g., 0.2).
- `NPC_ACQUISITION_PERCENTAGE`: Percentage acquired by NPCs at debut (e.g., 0.3).
- `NEW_SET_DEBUT_DAYS`: Days until new sets stop debuting (e.g., 40).
- `GAME_DURATION_DAYS`: Total game duration (e.g., 90).

## TypeScript Integration
- **Type Safety**: Interfaces (e.g., `Player`, `NFT`, `Set`) and enums (e.g., `Rarity`, `CollectionStatus`) ensure type-safe data handling.
- **Validation**: API endpoints validate inputs against schemas (e.g., `batchCount` for common/no-prop NFTs) and config values.

## Testing
- **Unit Tests**:
  - Validate schema integrity (e.g., `batchCount` for common/no-prop NFTs).
  - Ensure budget fields align with `nft_config.json`.
  - Test transaction logging for batch purchases.
- **Integration Tests**:
  - Verify set debut mechanics (e.g., splitting NFTs, batch listings).
  - Test player-NPC interactions with batch and unique NFTs.
- **Performance Tests**:
  - Handle high transaction volumes and batch updates.
  - Ensure indexing supports fast marketplace queries.

## Notes
- **Batch Management**: Common/no-prop NFTs are managed in batches to simplify the text-based UI (e.g., “7 brown Randy Raccoons for $100 each”).
- **Satirical Tone**: Schema fields like NPC `name` (e.g., “CryptoHypeBot”) and transaction logs support the game’s humor.
- **Scalability**: Indexes optimize queries for leaderboards, marketplace filters, and set debut processing.

---
See [README.v2.md](README.v2.md), [README.Gameplay.v2.md](README.Gameplay.v2.md), [README.Players.md](README.Players.md), [README.NPCs.md](README.NPCs.md), and [README.Sets.md](README.Sets.md) for related mechanics.