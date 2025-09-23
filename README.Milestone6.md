# Milestone 6: NPC Buyers System (FUTURE)

> ⚠️ **IMPORTANT**: This milestone contains **FUTURE PLANS** and is **NOT CURRENTLY IMPLEMENTED**. 
> 
> The NFT Trading Game is **production-ready** as of Milestone 5 with complete auction system functionality.
> This document represents proposed future enhancements.

**Status**: 🚧 **PLANNED** — This milestone is planned for future development and is not currently implemented.

**Current Status**: The project has completed Milestone 5 (Auction System) and is production-ready. This milestone represents future enhancements.

This milestone would implement an intelligent NPC buyer system that simulates real market participants in a tick-based simulation, with daily and weekly market updates.

## Proposed Goals
- Implement NPC buyers with different trading strategies
- Create a tick-based market simulation system
- Add NPC-driven price fluctuations
- Implement market events triggered by NPC behavior
- Add comprehensive tests for NPC behavior

## Proposed Sub-Milestones

### 6A: NPC Foundation System (Not Implemented)
**Goal**: Establish basic NPC entities and infrastructure

**Steps**:
- [ ] Create NPC buyer model with core attributes:
  - Basic identity (name, ID, creation date)
  - Trading strategy type (Conservative, Aggressive, Speculative, Collector, Opportunist)
  - Risk tolerance and market knowledge levels
  - Budget and wallet management
- [ ] Implement NPC database schema and storage
- [ ] Create NPC generation service for creating diverse NPCs
- [ ] Add basic NPC wallet management:
  - Initial balance allocation
  - Transaction tracking
  - Profit/loss calculation
- [ ] Implement NPC authentication and identification system
- [ ] Create basic NPC API endpoints (list, create, view details)

**Completion Criteria**:
- [ ] NPCs can be created and stored in database
- [ ] Basic wallet functionality works
- [ ] NPCs have distinct identities and strategy types
- [ ] Unit tests for NPC model and basic operations

### 6B: NPC Decision Engine (Not Implemented)
**Goal**: Implement intelligent decision-making for NPC trading

**Steps**:
- [ ] Create decision-making framework:
  - Daily price evaluation algorithms
  - Market trend analysis
  - Collection completion tracking
  - Risk assessment calculations
- [ ] Implement strategy-specific behaviors:
  - Conservative: Low-risk, long-term holding
  - Aggressive: High-risk, quick trading, market manipulation
  - Speculative: Trend following, collection completion focus
  - Collector: Set completion priority, rarity-driven decisions
  - Opportunist: Market timing, event-driven trading
- [ ] Add NPC market analysis capabilities:
  - Price history evaluation
  - Collection status monitoring
  - Market sentiment assessment
- [ ] Create NPC portfolio management:
  - Asset tracking and valuation
  - Diversification strategies
  - Profit target setting

**Completion Criteria**:
- [ ] NPCs can analyze market conditions
- [ ] Each strategy type behaves distinctly
- [ ] NPCs can make buy/sell decisions based on their strategy
- [ ] Decision logic is testable and predictable

### 6C: Market Integration & Tick Processing (Not Implemented)
**Goal**: Integrate NPCs into the existing tick system and marketplace

**Steps**:
- [ ] Extend existing tick system for NPC processing:
  - Daily tick: NPC trading decisions and actions
  - Weekly tick: Budget refresh, portfolio review, strategy adjustments
- [ ] Implement NPC marketplace integration:
  - NPCs can list NFTs for sale
  - NPCs can purchase from marketplace
  - NPCs can participate in auctions (bidding and selling)
- [ ] Add NPC-driven price influence:
  - Buying pressure affects prices upward
  - Selling pressure affects prices downward
  - Market manipulation attempts by aggressive NPCs
- [ ] Create market sentiment system:
  - Global market sentiment tracking
  - Collection-specific sentiment
  - Rarity-based sentiment shifts
- [ ] Implement NPC event responses:
  - React to market events
  - Trigger new market events through collective behavior

**Completion Criteria**:
- [ ] NPCs actively participate in marketplace
- [ ] NPC actions influence market prices
- [ ] Tick system processes NPC decisions efficiently
- [ ] Market sentiment affects NPC and player behavior

### 6D: Advanced NPC Behaviors (Not Implemented)
**Goal**: Add sophisticated trading patterns and market manipulation

**Steps**:
- [ ] Implement advanced trading strategies:
  - **Conservative Strategy Refinements**:
    - Advanced risk assessment algorithms
    - Long-term market trend analysis
    - Portfolio diversification logic
  - **Aggressive Strategy Refinements**:
    - Market manipulation coordination between aggressive NPCs
    - Pump-and-dump scheme detection and execution
    - High-frequency trading patterns
  - **Speculative Strategy Refinements**:
    - Trend prediction algorithms
    - Social sentiment analysis simulation
    - Momentum trading with stop-losses
  - **Collector Strategy Refinements**:
    - Set completion optimization
    - Cross-collection trading for completion
    - Rarity premium calculations
  - **Opportunist Strategy Refinements**:
    - Event prediction and preparation
    - Arbitrage opportunity detection
    - Flash crash recovery strategies

- [ ] Implement NPC social behaviors:
  - NPCs influence each other's decisions
  - Formation of temporary trading alliances
  - Competitive behaviors between rival NPCs
  - Information sharing and market rumors

- [ ] Add advanced market manipulation:
  - Coordinated buying/selling campaigns
  - Artificial scarcity creation
  - Market corner attempts on specific collections
  - Counter-manipulation by defensive NPCs

**Completion Criteria**:
- [ ] NPCs exhibit complex, realistic trading behaviors
- [ ] Market manipulation creates interesting dynamics
- [ ] NPC interactions create emergent market patterns
- [ ] Advanced strategies are balanced and engaging

### 6E: Market Events & Dynamic Systems (Not Implemented)
**Goal**: Create dynamic market events triggered by NPC behavior and external factors

**Steps**:
- [ ] Implement comprehensive market event system:
  - **Daily Events**: Price fluctuations, collection status updates, NPC trading decisions
  - **Weekly Events**: Market crashes, collection rushes, media events, environmental backlash
  - **Triggered Events**: Events caused by NPC collective behavior
- [ ] Add event effects and consequences:
  - Dynamic price multipliers based on event type
  - Market sentiment shifts affecting all participants
  - Trading volume spikes and crashes
  - Collection status changes (trending, declining, dead)
- [ ] Create event chain reactions:
  - Events can trigger other events
  - NPC responses to events can amplify or dampen effects
  - Player actions can influence event outcomes
- [ ] Implement market cycles:
  - Bull and bear market periods
  - Seasonal trends and patterns
  - Long-term market evolution

**Completion Criteria**:
- [ ] Market events create engaging gameplay dynamics
- [ ] Events feel natural and connected to NPC behavior
- [ ] Market cycles provide long-term strategic depth
- [ ] Event system is configurable and extensible

### 6F: Testing & Performance Optimization (Not Implemented)
**Goal**: Ensure NPC system is robust, performant, and well-tested

**Steps**:
- [ ] Comprehensive unit testing:
  - NPC decision-making algorithms
  - Strategy-specific behaviors
  - Market event triggers and effects
  - Tick processing with multiple NPCs
- [ ] Integration testing:
  - NPC-marketplace interaction
  - Player-NPC competitive scenarios
  - Event system integration
  - Real-time updates with NPC actions
- [ ] Performance optimization:
  - Efficient NPC decision processing
  - Scalable tick system with many NPCs
  - Database optimization for NPC data
  - Memory management for long-running simulations
- [ ] Load testing:
  - Multiple NPCs trading simultaneously
  - High-frequency market events
  - Large-scale market manipulation scenarios
- [ ] Balance testing:
  - Ensure no single strategy dominates
  - Verify market remains engaging for players
  - Test economic balance with NPC participation

**Completion Criteria**:
- [ ] All NPC functionality has comprehensive test coverage
- [ ] System performs well with 50+ active NPCs
- [ ] Market remains balanced and engaging
- [ ] No memory leaks or performance degradation over time

## Proposed Technical Implementation

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

## Sub-Milestone Summary

| Sub-Milestone | Focus | Key Deliverables |
|---------------|-------|------------------|
| **6A: NPC Foundation** | Basic NPC infrastructure | NPC models, wallet system, basic API |
| **6B: Decision Engine** | AI trading logic | Strategy behaviors, market analysis, decision algorithms |
| **6C: Market Integration** | Tick system integration | NPC marketplace participation, price influence |
| **6D: Advanced Behaviors** | Sophisticated trading | Market manipulation, NPC interactions, complex strategies |
| **6E: Market Events** | Dynamic market systems | Event system, market cycles, chain reactions |
| **6F: Testing & Optimization** | Quality assurance | Comprehensive testing, performance optimization |

## Overall Completion Criteria (Future)
- [ ] **6A Complete**: NPCs can be created and managed with basic wallet functionality
- [ ] **6B Complete**: NPCs make intelligent trading decisions based on their strategies
- [ ] **6C Complete**: NPCs actively participate in marketplace and influence prices
- [ ] **6D Complete**: NPCs exhibit complex behaviors and market manipulation
- [ ] **6E Complete**: Dynamic market events create engaging gameplay
- [ ] **6F Complete**: System is well-tested, performant, and balanced
- [ ] **Overall**: All sub-milestones integrated into cohesive NPC trading ecosystem

## Current Project Status
The NFT Trading Game is **production-ready** with the following completed features:
- ✅ User authentication and registration
- ✅ NFT generation with rarity system
- ✅ Dual marketplace (fixed-price + auctions)
- ✅ Complete auction system (Standard, Dutch, Reserve)
- ✅ Real-time updates with Socket.IO
- ✅ Notification system with preferences
- ✅ Comprehensive testing (104/104 tests passing)
- ✅ Complete API documentation

This NPC system represents a future enhancement to add AI-driven market participants.

## Future Considerations
- Machine learning for NPC behavior
- More complex trading strategies
- Advanced market manipulation
- Player-NPC interaction features
- NPC reputation system

---
See the main [README.md](README.md) for project context and previous milestones. 