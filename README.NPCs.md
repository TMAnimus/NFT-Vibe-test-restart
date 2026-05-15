# NPC Buyers System

**Branch**: `NPCs`  
**Status**: 🚧 **IN DEVELOPMENT** — Milestone 6  
**Last Updated**: May 2026

---

## Overview

NPCs simulate real market participants, competing with players in the tick-based marketplace. They drive price dynamics through strategic trading, market manipulation, and event responses — adding chaos and satirical flavour to the game.

Five distinct trading strategies create different market pressures. Players can observe NPC activity and exploit predictable behaviours (e.g., listing sceptre NFTs at a premium when a Collector NPC is known to be active).

---

## Implementation Status

| Sub-Milestone | Description | Status |
|---------------|-------------|--------|
| **6A** | NPC model, schema, wallet, basic API | 🚧 In progress |
| **6B** | Decision engine, strategy behaviours | ⬜ Planned |
| **6C** | Tick system integration, marketplace participation | ⬜ Planned |
| **6D** | Advanced behaviours, market manipulation | ⬜ Planned |
| **6E** | Market events, chain reactions, cycles | ⬜ Planned |
| **6F** | Testing and performance optimisation | ⬜ Planned |

See [README.Milestone6.md](README.Milestone6.md) for full sub-milestone detail.

---

## NPC Model

NPCs are stored in the MongoDB `npcs` collection.

```typescript
export enum StrategyType {
  Conservative = 'conservative',
  Aggressive    = 'aggressive',
  Speculative   = 'speculative',
  Collector     = 'collector',
  Opportunist   = 'opportunist',
}

export enum CollectorFocusType {
  Color        = 'color',
  Prop         = 'prop',
  ColorAndProp = 'colorAndProp',
}

export interface CollectorFocus {
  type:   CollectorFocusType;
  color?: string; // e.g. "purple"
  prop?:  string; // e.g. "sceptre"
}

export interface INPC {
  id:   string;   // UUID
  name: string;   // Satirical name, e.g. "SceptreFanatic9000"
  strategy: {
    type:                  StrategyType;
    riskTolerance:         number;          // 0–1
    collectionPreferences?: string[];       // Non-Collector NPCs only
    collectorFocus?:        CollectorFocus; // Collector NPCs only
  };
  wallet: {
    balance:     number;
    totalSpent:  number;
    totalEarned: number;
    lastRefresh: Date;   // Weekly budget refresh timestamp
  };
  portfolio: {
    nfts:        string[]; // NFT IDs
    collections: string[]; // Collection IDs
    firstOfSets: string[]; // First-of-set NFT IDs
  };
  behavior: {
    lastAction:        Date;
    actionFrequency:   number; // Actions per daily tick (0–5)
    preferredPriceRange: {
      min: number;
      max: number;
    };
  };
}
```

**Indexes**: `strategy.type`, `strategy.collectorFocus.type`

---

## Trading Strategies

### 1. Conservative
Risk-averse, long-term holders focused on stable collections.

- Buys from `Normal` or `New` collections with ≥ 3 prior sales
- Max 20% of budget per purchase
- Holds ≥ 7 days; sells only at > 15% profit
- Ignores market events
- Price range: −10% to +5% of market value
- **Market effect**: Stabilises established collection prices

### 2. Aggressive
High-risk traders chasing quick profits and market manipulation.

- Spends up to 80% of budget per purchase
- Min hold: 1 day; sells at any profit > 5%
- Targets "First of Set" NFTs
- Floods buy/sell orders to spike prices up to ±50% temporarily
- May corner a collection (buy ≥ 50% of its NFTs)
- Price range: −5% to +20% of market value
- **Market effect**: Creates volatility; challenges players to time trades

### 3. Speculative
Trend-followers targeting emerging collections and hype cycles.

- Spends 30–50% of budget per purchase
- Holds 1–3 days; sells at > 10% profit or cuts losses at −15%
- Targets `New` collections and rare NFTs
- Reacts quickly to events (e.g. buys during "Celebrity Endorsement")
- Price range: −15% to +15% of market value
- **Market effect**: Amplifies price swings during trending events

### 4. Collector
Obsessive long-term investors fixated on a single attribute or combination — satirising irrational NFT collector behaviour.

**Focus** (assigned randomly at creation):
- **Color** (33%): Collects all NFTs of a specific colour, e.g. all "purple" NFTs
- **Prop** (33%): Collects all NFTs with a specific prop, e.g. all "sceptre" NFTs
- **Color + Prop** (34%): Collects all NFTs matching both, e.g. all "blue sceptre" NFTs

**Behaviours**:
- Spends up to 40% of budget per purchase
- Holds ≥ 14 days; rarely sells unless completing a set
- Triggers aggressive buying (bids 15% above market) when 80% of target set is owned
- Price range: −5% to +10% of market value
- Focus is static; reassigned weekly only if target set is completed or goes `Dead`

**Market effect**: Inflates prices for targeted attributes; creates scarcity players can exploit by listing matching NFTs at a premium.

**Satirical flavour**: "Sceptres unlock the metaverse's secrets!" / "Purple is the blockchain's chosen colour!"

### 5. Opportunist
Event-driven traders capitalising on dips and flash sales.

- Spends 20–60% of budget per purchase
- Holds 1–2 days; sells at any profit > 3%
- Buys during market crashes and environmental backlash events for discounted NFTs
- Price range: −20% to +5% of market value
- **Market effect**: Increases trading volume during events; creates buying opportunities for players

---

## Player–NPC Interaction

- **Bidding competition**: NPCs and players bid simultaneously during daily ticks. NPCs have randomised response times (0–500 ms) to simulate chaotic market behaviour.
- **Visibility**: Players see NPC activity in the feed (e.g. "SceptreFanatic9000 bought a blue sceptre Capybara for $500") but not the NPC's strategy or focus.
- **Exploitable patterns**:
  - Collector NPCs inflate prices for their target attribute — list matching NFTs at a premium
  - Aggressive NPCs create volatility — time purchases during their sell-offs
  - Opportunists signal market dips — watch for their buying activity

---

## Tick Integration

### Daily tick
- NPCs evaluate prices and execute up to `actionFrequency` buy/sell actions
- Buy pressure: +5–20% price impact per tick
- Sell pressure: −5–15% price impact per tick
- Aggressive manipulation: up to ±50% temporary swing

### Weekly tick
- Portfolio review and strategy adjustments
- Budget refresh (amount from `nft_config.json`)
- Collector focus reassignment if target set is complete or `Dead`
- NPCs react to weekly market events (e.g. Aggressive NPCs buy heavily during "Brand Collab Mania")

---

## Market Influence

| Effect | Range |
|--------|-------|
| Buy pressure per tick | +5% to +20% |
| Sell pressure per tick | −5% to −15% |
| Aggressive manipulation | up to ±50% (temporary) |
| Collector demand on target attribute | up to +20% |

Heavy NPC buying delays a collection's transition to `Declining` or `Dead`; heavy selling accelerates it.

---

## Configuration

Values sourced from `server/nft_config.json` (not environment variables) to allow in-game tuning without redeployment.

| Key | Description | Default |
|-----|-------------|---------|
| `NPC_COUNT` | Number of active NPCs | `10` |
| `NPC_INITIAL_BALANCE` | Starting wallet balance | `10000` |
| `NPC_BUDGET_REFRESH` | Weekly budget top-up | `2000` |
| `NPC_MAX_ACTIONS` | Max actions per daily tick | `5` |

---

## Files (planned)

```
server/src/
├── models/
│   └── NPC.ts                    # Mongoose model + INPC interface
├── services/
│   └── npcService.ts             # NPC creation, decision engine, tick processing
├── routes/
│   └── npc.ts                    # REST API endpoints
└── services/
    └── tickService.ts            # Extended to call npcService on each tick
```

---

## Testing Plan

- **Unit**: Strategy decision logic, Collector focus assignment, wallet operations
- **Integration**: NPC marketplace participation, player–NPC bidding competition, event responses
- **Performance**: 50+ NPCs processing within 1 second per tick

---

## Notes

- NPC actions are recorded in the `Transactions` collection for transparency and debugging
- NPCs use the same `buyNft` / `listNft` service functions as players — no separate code path
- The satirical tone is intentional: Aggressive NPCs can "accidentally" crash a collection by overselling
