# Milestone 6: NPC Buyers System

This milestone implements an intelligent NPC buyer system that simulates real market participants in a tick-based simulation, with daily and weekly market updates.

## Goals
- Implement NPC buyers with different trading strategies
- Create a tick-based market simulation system
- Add NPC-driven price fluctuations
- Implement market events triggered by NPC behavior
- Add comprehensive tests for NPC behavior

## Steps & Status

### 1. NPC Buyer System
- [ ] Create NPC buyer model with attributes:
  - Trading strategy (Conservative, Aggressive, Speculative)
  - Risk tolerance
  - Budget management
  - Collection preferences
  - Market knowledge level
- [ ] Implement NPC decision-making logic:
  - Daily price evaluation
  - Weekly portfolio review
  - Collection completion goals
  - Market trend analysis
- [ ] Add NPC wallet management:
  - Weekly budget refresh
  - Profit tracking
  - Transaction history

### 2. Market Simulation
- [ ] Implement tick-based cycles:
  - Daily tick (24 hours):
    - NPC buying/selling decisions
    - Price updates
    - Collection status changes
  - Weekly tick (7 days):
    - Market event checks
    - Collection status updates
    - Budget refreshes
    - Market sentiment shifts
- [ ] Add market sentiment system:
  - Global market sentiment
  - Collection-specific sentiment
  - Rarity-based sentiment
- [ ] Create price influence mechanics:
  - Daily NPC buying pressure
  - Daily NPC selling pressure
  - Weekly market manipulation attempts

### 3. NPC Trading Strategies
- [ ] Implement strategy types:
  - **Conservative**:
    - Focus on established collections
    - Prefer lower risk investments
    - Long-term holding
    - **Specific Behaviors**:
      - Only buys NFTs with proven price history
      - Maximum 20% of budget per purchase
      - Holds NFTs for minimum 7 days (1 weekly tick)
      - Sells only when profit > 15%
      - Avoids market events and hype
      - Prefers complete collections over individual NFTs
      - Price sensitivity: -10% to +5% of market value
  - **Aggressive**:
    - High-risk, high-reward approach
    - Quick trading
    - Market manipulation attempts
    - **Specific Behaviors**:
      - Up to 80% of budget per purchase
      - Minimum hold time: 1 day (1 daily tick)
      - Sells at any profit > 5%
      - Actively participates in market events
      - Creates artificial price spikes
      - Targets First of Set NFTs
      - Price sensitivity: -5% to +20% of market value
      - May attempt to corner specific collections
  - **Speculative**:
    - Trend following
    - Collection completion focus
    - First of Set targeting
    - **Specific Behaviors**:
      - 30-50% of budget per purchase
      - Hold time: 1-3 days (1-3 daily ticks)
      - Sells at profit > 10% or loss > 15%
      - Actively monitors market trends
      - Targets emerging collections
      - Price sensitivity: -15% to +15% of market value
      - Quick to react to market events
  - **Collector**:
    - Focus on completing sets
    - Long-term investment
    - Rarity-driven decisions
    - **Specific Behaviors**:
      - Up to 40% of budget per purchase
      - Hold time: 14+ days (2+ weekly ticks)
      - Rarely sells unless completing set
      - Prioritizes missing pieces in collections
      - Price sensitivity: -5% to +10% of market value
      - Tracks collection completion status
  - **Opportunist**:
    - Market timing specialist
    - Event-driven trading
    - Quick profit taking
    - **Specific Behaviors**:
      - 20-60% of budget per purchase
      - Hold time: 1-2 days (1-2 daily ticks)
      - Sells at any profit > 3%
      - Actively monitors market events
      - Price sensitivity: -20% to +5% of market value
      - Specializes in flash sales and market dips

### 4. Market Events
- [ ] Implement tick-based events:
  - **Daily Events**:
    - Price fluctuations
    - Collection status updates
    - NPC trading decisions
  - **Weekly Events**:
    - Market crashes
    - Collection rushes
    - Price manipulation
    - Environmental backlash
    - Media events
- [ ] Add event effects:
  - Price multipliers
  - Market sentiment changes
  - Trading volume spikes
  - Collection status changes

### 5. Testing
- [ ] Unit tests for:
  - Daily tick processing
  - Weekly tick processing
  - NPC decision making
  - Market simulation
  - Trading strategies
  - Event triggers
- [ ] Integration tests for:
  - NPC-market interaction
  - Player-NPC interaction
  - Event system
- [ ] Performance tests for:
  - Multiple NPCs
  - Market simulation
  - Event processing

## Technical Implementation

### NPC Buyer Model
```javascript
{
  id: String,
  name: String,
  strategy: {
    type: String, // 'conservative', 'aggressive', 'speculative', 'collector', 'opportunist'
    riskTolerance: Number, // 0-1
    marketKnowledge: Number, // 0-1
    collectionPreferences: [String]
  },
  wallet: {
    balance: Number,
    totalSpent: Number,
    totalEarned: Number,
    lastRefresh: Date // Weekly budget refresh timestamp
  },
  portfolio: {
    nfts: [NFT],
    collections: [Collection],
    firstOfSets: [NFT]
  },
  behavior: {
    lastAction: Date,
    actionFrequency: Number, // Actions per daily tick
    preferredPriceRange: {
      min: Number,
      max: Number
    }
  }
}
```

### Market Simulation
```javascript
{
  currentTick: {
    type: String, // 'daily' or 'weekly'
    number: Number,
    startTime: Date,
    endTime: Date
  },
  currentCycle: {
    type: String, // 'bull', 'bear', 'sideways'
    startTick: Number,
    duration: Number, // in ticks
    strength: Number // 0-1
  },
  sentiment: {
    global: Number, // -1 to 1
    collections: Map<String, Number>,
    rarities: Map<String, Number>
  },
  npcActivity: {
    activeBuyers: Number,
    activeSellers: Number,
    tradingVolume: Number
  }
}
```

### Event System
```javascript
{
  type: String,
  trigger: {
    condition: String,
    threshold: Number,
    duration: Number, // in ticks
    tickType: String // 'daily' or 'weekly'
  },
  effects: {
    priceMultiplier: Number,
    sentimentChange: Number,
    volumeMultiplier: Number
  },
  participants: {
    npcs: [String],
    players: [String]
  }
}
```

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NPC_COUNT` | Number of active NPCs | `10` |
| `DAILY_TICK_INTERVAL` | Time between daily ticks (ms) | `86400000` |
| `WEEKLY_TICK_INTERVAL` | Time between weekly ticks (ms) | `604800000` |
| `EVENT_TRIGGER_THRESHOLD` | Threshold for event triggers | `0.7` |

## Completion Criteria
- [ ] NPC buyers can make daily trading decisions
- [ ] Weekly market updates affect NFT prices realistically
- [ ] NPCs respond to market events appropriately
- [ ] All tests pass
- [ ] Documentation is complete

## Future Considerations
- Machine learning for NPC behavior
- More complex trading strategies
- Advanced market manipulation
- Player-NPC interaction features
- NPC reputation system

---
See the main [README.md](README.md) for project context and previous milestones. 