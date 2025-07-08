

# NPC Buyers System for NFT Trading Game

**Last Updated**: July 5, 2025, 11:13 PM PDT

## Overview
This document details the Non-Player Character (NPC) buyer system for the *NFT Trading Game* (NFT VibeCode), a satirical multiplayer simulation of an NFT marketplace. NPCs simulate real market participants, competing with players in a tick-based system with daily and weekly updates. They drive market dynamics through strategic trading, price manipulation, and event responses, adding chaos and humor to the game. The system is implemented with TypeScript for type safety.

## Goals
- Simulate realistic yet exaggerated market behavior with diverse NPC trading strategies.
- Influence NFT prices and collection statuses through NPC actions.
- Enhance player competition by having NPCs bid against players.
- Support tick-based market updates (daily and weekly).
- Ensure NPC behavior aligns with the game’s satirical tone (e.g., over-the-top market manipulation).

## NPC Buyer Model
NPCs are stored in the MongoDB `NPCs` collection, with attributes defining their trading behavior and portfolios.

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
  name: string; // Satirical name (e.g., "CryptoHypeBot")
  strategy: {
    type: StrategyType; // Trading strategy
    riskTolerance: number; // 0-1, affects purchase decisions
    collectionPreferences?: string[]; // Preferred collection IDs (used by non-Collectors)
    collectorFocus?: CollectorFocus; // Used only by Collectors
  };
  wallet: {
    balance: number; // Current budget (from config file, e.g., NPC_INITIAL_BALANCE)
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

**Notes**:
- The `collectorFocus` field defines the Collector’s target (color, prop, or color-prop combination).
- Non-Collector NPCs use `collectionPreferences` for broader preferences.
- Budget balance and refresh amounts are defined in the game’s config file (e.g., `server/sets/nft_config.json`).

## Trading Strategies
NPCs follow one of five strategies, each with distinct behaviors to influence the market and challenge players.

### 1. Conservative
- **Description**: Risk-averse traders focusing on stable, established collections.
- **Behaviors**:
  - Buys NFTs from “Normal” or “New” collections odels with at least 3 sales).
  - Maximum 20% of budget per purchase (budget from config file).
  - Holds NFTs for at least 7 days (1 weekly tick).
  - Sells only when profit > 15%.
  - Avoids market events (e.g., ignores “Viral Meme Token Hype”).
  - Prefers complete collections over individual NFTs.
  - Price sensitivity: Pays -10% to +5% of market value.
- **Impact**: Stabilizes prices of established collections, reducing volatility.

### 2. Aggressive
- **Description**: High-risk traders aiming for quick profits and market manipulation.
- **Behaviors**:
  - Spends up to 80% of budget per purchase (budget from config file).
  - Minimum hold time: 1 day (1 daily tick).
  - Sells at any profit > 5%.
  - Actively participates in market events (e.g., buys during “Brand Collab Mania”).
  - Attempts market manipulation by flooding buy/sell orders, potentially spiking prices by up to 50% temporarily.
  - Targets “First of Set” NFTs.
  - Price sensitivity: Pays -5% to +20% of market value.
  - May corner specific collections (e.g., buys 50% of a collection’s NFTs).
- **Impact**: Creates price volatility, challenging players to time trades.

### 3. Speculative
- **Description**: Trend-followers targeting emerging collections and market hype.
- **Behaviors**:
  - Spends 30-50% of budget per purchase (budget from config file).
  - Holds NFTs for 1-3 days (1-3 daily ticks).
  - Sells at profit > 10% or loss > 15%.
  - Monitors market trends (e.g., buys during rising prices).
  - Targets “New” collections and rare NFTs.
  - Price sensitivity: Pays -15% to +15% of market value.
  - Quick to react to events (e.g., buys during “Celebrity Endorsement”).
- **Impact**: Amplifies price swings during trending events.

### 4. Collector
- **Description**: Long-term investors obsessed with collecting NFTs based on a single aspect (color or prop) or a dual aspect (color and prop), satirizing irrational NFT collector behavior with absurd fixations like “sceptres are the blockchain’s holy grail!”
- **Behaviors**:
  - **Focus**:
    - **Single Aspect (Color)**: Collects all NFTs of a specific color (e.g., all “purple” NFTs).
    - **Single Aspect (Prop)**: Collects all NFTs with a specific prop (e.g., all “sceptre” NFTs).
    - **Dual Aspect**: Collects all NFTs with a specific prop of a specific color (e.g., all “sceptre” props on “blue” NFTs).
    - Assigned randomly at NPC creation: 33% chance for color, 33% for prop, 34% for color-prop.
  - Spends up to 40% of budget per purchase (budget from config file).
  - Holds NFTs for 14+ days (2+ weekly ticks).
  - Rarely sells unless completing a set (e.g., owns all “purple” NFTs, all “sceptre” NFTs, or all “blue sceptre” NFTs).
  - Prioritizes NFTs matching their `collectorFocus` (e.g., buys any “sceptre” NFT if focused on “sceptre”).
  - Price sensitivity: Pays -5% to +10% of market value.
  - Triggers aggressive buying when 80% of target NFTs are owned (e.g., bids 15% above market value).
- **Impact**: Drives demand for specific colors, props, or color-prop combinations, inflating prices for matching NFTs and creating scarcity for players.
- **Satirical Flavor**: Collectors display absurd motivations (e.g., “Sceptres unlock the metaverse’s secrets!” or “Purple is the blockchain’s chosen color!”).

### 5. Opportunist
- **Description**: Event-driven traders capitalizing on market dips and flash sales.
- **Behaviors**:
  - Spends 20-60% of budget per purchase (budget from config file).
  - Holds NFTs for 1-2 days (1-2 daily ticks).
  - Sells at any profit > 3%.
  - Monitors events (e.g., buys during “Environmental Backlash” for discounts).
  - Price sensitivity: Pays -20% to +5% of market value.
  - Specializes in flash sales and market dips.
- **Impact**: Increases trading volume during events, creating buying opportunities for players.

## Player-NPC Interaction
- **Bidding Competition**: During daily ticks, NPCs and players bid simultaneously on listed NFTs. The highest bid wins, with NPCs having randomized response times (0-500ms) to simulate chaotic market behavior.
- **Visibility**: Players see NPC activity (e.g., “SceptreFanatic bought a sceptre cat for $500”) but not specific NPC strategies or focus.
- **Impact on Players**:
  - Collector NPCs inflate prices for specific colors, props, or color-prop combos (e.g., a “sceptre” focus increases sceptre NFT prices by up to 20%).
  - Aggressive NPCs create broader volatility, complementing Collectors’ targeted demand.
  - Players can exploit Collector focus by listing matching NFTs at premium prices.

## Tick-Based Behavior
- **Daily Ticks (24 hours)**:
  - NPCs evaluate market prices and make buy/sell decisions based on their strategy.
  - Up to `actionFrequency` actions per tick (e.g., Collectors make 1-3 trades, Aggressive NPCs up to 5).
  - Price updates reflect NPC buying/selling pressure (e.g., heavy buying increases prices by up to 20%).
- **Weekly Ticks (7 days)**:
  - NPCs review portfolios and adjust strategies (e.g., Collectors prioritize incomplete sets).
  - Budgets refresh (amount from config file, e.g., NPC_BUDGET_REFRESH).
  - NPCs react to market events (e.g., Aggressive NPCs buy heavily during “Brand Collab Mania”).

## Market Influence
- **Price Fluctuations**: NPC trades directly affect `NFT.currentPrice`:
  - Buy pressure: +5-20% per tick (multiplicative).
  - Sell pressure: -5-15% per tick.
  - Manipulation by Aggressive NPCs: Up to ±50% temporary swings.
- **Collection Status**: Heavy NPC buying can delay a collection’s transition to “Declining” or “Dead”; heavy selling accelerates it.
- **Event Responses**: NPCs adjust behavior based on events (e.g., Opportunists buy during “cryptoMarketCrash” for $1 floor NFTs).

## Environment Variables
| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NPC_COUNT` | Number of active NPCs | `10` |
| `NPC_INITIAL_BALANCE` | Starting budget for NPCs | Configured in `nft_config.json` (e.g., `10000`) |
| `NPC_BUDGET_REFRESH` | Weekly budget refresh amount | Configured in `nft_config.json` (e.g., `2000`) |
| `NPC_MAX_ACTIONS` | Maximum actions per daily tick | `5` |
| `COLLECTOR_FOCUS_PROBABILITY` | Probability of focus type (color/prop/colorAndProp) | `{ color: 0.33, prop: 0.33, colorAndProp: 0.34 }` |

## TypeScript Integration
- **Type Safety**: The `CollectorFocus` interface ensures Collectors only target valid attributes (e.g., colors or props from `README.Database.md`).
- **Enums**: `CollectorFocusType` and `StrategyType` prevent invalid focus or strategy assignments.
- **Validation**: NPC bids are validated against their wallet balance (from config file) and market conditions before execution.

## Testing
- **Unit Tests**:
  - Validate Collector focus assignment (e.g., color, prop, or color-prop).
  - Test Collector bidding logic (e.g., only bids on “sceptre” NFTs if focused on prop “sceptre”).
  - Ensure price impact from NPC demand.
  - Verify balance and refresh amounts are read from config file.
- **Integration Tests**:
  - Simulate Collector-player bidding wars for targeted NFTs.
  - Verify NPC-event interactions (e.g., Opportunists buying during market dips).
- **Performance Tests**:
  - Handle 10+ NPCs with high transaction volumes.
  - Ensure tick processing completes within 1 second.

## Notes
- NPCs are designed to exaggerate market behavior, aligning with the game’s satirical tone (e.g., Aggressive NPCs may “accidentally” crash a collection by overselling).
- Budget balance and refresh amounts are sourced from `server/sets/nft_config.json` to allow flexible tuning.
- NPC actions are logged in the `Transactions` collection for transparency.
- Collectors’ focus is static but can be reassigned weekly if their target set is completed or becomes “Dead.”

## Future Considerations
- **Dynamic Focus**: Collectors could shift focus based on market trends (e.g., switch to “hat” if “sceptre” becomes “Dead”).
- **Collector Rivalries**: Introduce competition between Collectors with opposing focuses (e.g., sceptre vs. hat).
- **Player-NPC Alliances**: Allow players to “bribe” Collectors to target specific NFTs.

---
See the main [README.md](README.md) and [README.Database.md](README.Database.md) for project context and database schemas.
