# Milestone 6: NPC Buyers System

**Branch**: `NPCs`  
**Status**: 🚧 **IN DEVELOPMENT**  
**Design reference**: [README.NPCs.md](README.NPCs.md)

---

## Overview

Milestone 6 adds intelligent NPC market participants that compete with players in the existing tick-based marketplace. NPCs use five distinct trading strategies, participate in fixed-price sales and auctions, and drive price dynamics through buying pressure, selling pressure, and market manipulation.

NPCs reuse the existing `buyNft`, `listNft`, and auction service functions — no separate code path.

---

## Sub-Milestone Progress

| # | Name | Status | Key Deliverables |
|---|------|--------|-----------------|
| **6A** | NPC Foundation | 🚧 In progress | Model, schema, wallet, generation service, basic API |
| **6B** | Decision Engine | ⬜ Planned | Strategy behaviours, market analysis, buy/sell decisions |
| **6C** | Market Integration | ⬜ Planned | Tick system hooks, marketplace participation, price influence |
| **6D** | Advanced Behaviours | ⬜ Planned | Market manipulation, NPC–NPC interaction, complex strategies |
| **6E** | Market Events | ⬜ Planned | Event system, chain reactions, bull/bear cycles |
| **6F** | Testing & Optimisation | ⬜ Planned | Full test coverage, 50+ NPC performance, balance testing |

---

## 6A: NPC Foundation

**Goal**: NPC entities exist in the database with wallets and can be created via API.

### Steps
- [ ] `server/src/models/NPC.ts` — Mongoose model + `INPC` interface + `StrategyType` / `CollectorFocusType` enums
- [ ] `server/src/services/npcService.ts` — NPC generation, wallet management, basic CRUD
- [ ] `server/src/routes/npc.ts` — REST endpoints: list, get by ID, create, delete
- [ ] Seed script to populate initial NPCs on server start
- [ ] Unit tests for model and service

### Completion criteria
- [ ] NPCs can be created and persisted with correct strategy and wallet fields
- [ ] `GET /api/npcs` returns active NPCs
- [ ] Wallet balance, totalSpent, totalEarned tracked correctly
- [ ] Unit tests passing

---

## 6B: NPC Decision Engine

**Goal**: Each NPC strategy produces distinct, testable buy/sell decisions.

### Steps
- [ ] `decideAction(npc, marketState)` — returns `buy | sell | hold` with target NFT and price
- [ ] Per-strategy logic:
  - **Conservative**: buys `Normal`/`New` collections with ≥ 3 sales; sells at > 15% profit
  - **Aggressive**: targets First-of-Set; spends up to 80% of budget; sells at > 5% profit
  - **Speculative**: follows price trends; cuts losses at −15%
  - **Collector**: only targets NFTs matching `collectorFocus`; triggers aggressive buying at 80% set completion
  - **Opportunist**: buys during market events and dips; sells at > 3% profit
- [ ] Market analysis helpers: price trend, collection status, sentiment
- [ ] Portfolio management: track holdings, calculate P&L

### Completion criteria
- [ ] Each strategy behaves distinctly in unit tests
- [ ] Decision logic is deterministic given a fixed market state (testable)
- [ ] Collector focus assignment (color / prop / color+prop) works correctly

---

## 6C: Market Integration & Tick Processing

**Goal**: NPCs actively trade in the marketplace on every tick.

### Steps
- [ ] Extend `tickService.ts` — call `npcService.processTick()` on each daily and weekly tick
- [ ] Daily tick: each NPC executes up to `actionFrequency` buy/sell actions
- [ ] Weekly tick: budget refresh, portfolio review, Collector focus reassignment if needed
- [ ] NPC buy/sell actions call existing `buyNft` / `listNft` / auction service functions
- [ ] Price influence: aggregate NPC buy/sell pressure fed into `updateAllListedNftPrices`
- [ ] NPC activity emitted via Socket.IO to the trade feed (e.g. "SceptreFanatic9000 bought a blue sceptre Capybara for $500")

### Completion criteria
- [ ] NPCs execute trades on each tick without errors
- [ ] NPC buying/selling measurably affects `currentPrice`
- [ ] Trade feed shows NPC activity in real time
- [ ] Tick processing with 10 NPCs completes in < 1 second

---

## 6D: Advanced Behaviours

**Goal**: NPCs exhibit complex, emergent market behaviour.

### Steps
- [ ] **Aggressive**: coordinated pump-and-dump between multiple Aggressive NPCs; market corner attempts (buy ≥ 50% of a collection)
- [ ] **Speculative**: momentum trading with stop-losses; trend prediction
- [ ] **Collector**: cross-collection trading to complete sets; rarity premium calculations
- [ ] **Opportunist**: arbitrage detection; flash crash recovery
- [ ] NPC–NPC influence: Aggressive NPCs can trigger Speculative NPCs to follow a trend
- [ ] Temporary trading alliances between NPCs of compatible strategies

### Completion criteria
- [ ] Market manipulation creates observable price spikes/crashes
- [ ] NPC interactions produce emergent market patterns
- [ ] No single strategy dominates over a simulated 30-day period

---

## 6E: Market Events & Dynamic Systems

**Goal**: NPC collective behaviour triggers and responds to market events.

### Steps
- [ ] Triggered events: heavy Aggressive buying → "Hype Surge"; mass selling → "Market Crash"
- [ ] Event chain reactions: one event can trigger another (e.g. crash → Opportunists buy → partial recovery)
- [ ] Bull/bear market cycles driven by aggregate NPC sentiment
- [ ] Player actions can influence event outcomes (e.g. large player sale tips market into bear)
- [ ] Event effects: price multipliers, sentiment shifts, collection status changes, volume spikes

### Completion criteria
- [ ] At least 5 distinct triggered events implemented
- [ ] Events feel connected to NPC behaviour, not random
- [ ] Market cycles provide strategic depth over multiple sessions

---

## 6F: Testing & Performance Optimisation

**Goal**: NPC system is robust, performant, and balanced.

### Steps
- [ ] Unit tests: all strategy decision functions, Collector focus logic, wallet operations
- [ ] Integration tests: NPC–marketplace interaction, player–NPC bidding competition, event triggers
- [ ] Performance: 50+ NPCs, tick processing < 1 second
- [ ] Load test: high-frequency events + simultaneous NPC trades
- [ ] Balance test: no strategy dominates; market remains engaging for players
- [ ] Memory: no leaks over 24-hour simulated run

### Completion criteria
- [ ] Full test coverage for all NPC functionality
- [ ] 50+ NPCs process within 1 second per tick
- [ ] Market balance verified over simulated 30-day period

---

## Technical Model

```typescript
// server/src/models/NPC.ts

export enum StrategyType {
  Conservative = 'conservative',
  Aggressive   = 'aggressive',
  Speculative  = 'speculative',
  Collector    = 'collector',
  Opportunist  = 'opportunist',
}

export enum CollectorFocusType {
  Color        = 'color',
  Prop         = 'prop',
  ColorAndProp = 'colorAndProp',
}

export interface INPC extends Document {
  id:   string;
  name: string;
  strategy: {
    type:                  StrategyType;
    riskTolerance:         number;           // 0–1
    collectionPreferences?: string[];        // non-Collector NPCs
    collectorFocus?: {
      type:   CollectorFocusType;
      color?: string;
      prop?:  string;
    };
  };
  wallet: {
    balance:     number;
    totalSpent:  number;
    totalEarned: number;
    lastRefresh: Date;
  };
  portfolio: {
    nfts:        Types.ObjectId[];
    firstOfSets: Types.ObjectId[];
  };
  behavior: {
    lastAction:          Date;
    actionFrequency:     number;   // actions per daily tick (0–5)
    preferredPriceRange: { min: number; max: number };
  };
}
```

Configuration values (`NPC_COUNT`, `NPC_INITIAL_BALANCE`, `NPC_BUDGET_REFRESH`, `NPC_MAX_ACTIONS`) are stored in `server/nft_config.json`, not environment variables.

---

## Overall Completion Criteria

- [ ] **6A**: NPCs created, stored, and retrievable via API
- [ ] **6B**: Each strategy makes distinct, testable trading decisions
- [ ] **6C**: NPCs trade on every tick and influence market prices
- [ ] **6D**: Complex behaviours and market manipulation work correctly
- [ ] **6E**: Dynamic events create engaging, connected market dynamics
- [ ] **6F**: Full test coverage, 50+ NPC performance, market balance verified

---

See [README.NPCs.md](README.NPCs.md) for strategy detail and [README.md](README.md) for project overview.
