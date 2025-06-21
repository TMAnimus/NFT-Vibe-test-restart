# NFT VibeCode Gameplay Guide

## Overview
NFT VibeCode is a blockchain-based NFT marketplace simulation where players can trade NFTs with dynamic pricing based on rarity, market events, and trading activity. The game operates on a tick-based system with daily and weekly updates, simulating a realistic NFT market environment.

## Core Gameplay Mechanics

### 1. NFT Collection & Management
- **NFT Set Attributes**
  - Base price (changes with sales of set members)
  - Trajectory: New, Normal, Declining, Dead
- **Acquisition Methods**:
  - Purchase from the marketplace
  - Generate new NFTs (Future expansion)
  - Trade with other players
  - Trade with NPCs
- **NFT Attributes**:
  - Color Rarity: Common, Rare, VeryRare
  - Prop Rarity: NotPresent, Common, Rare, VeryRare
  - First of Set: Special status for the first NFT in a collection
  - Blockchain: The blockchain the NFT is minted on
- **NFT Status**:
  - Owned: Currently in your collection
  - Listed: Available for purchase in the marketplace
  - Sold: Recently sold

### 2. Marketplace System
- **Trading Features**:
  - List NFTs for sale
  - Set custom prices or use suggested prices
  - Filter listings by:
    - Color Rarity
    - Prop Rarity
    - Blockchain
    - Price Range
  - Daily listing updates
  - Transaction history tracking
- **Price Mechanics**:
  - Base price calculation based on rarity
  - First of Set bonus multiplier
  - Market event modifiers
  - Daily price updates
  - Weekly market adjustments
  - Minimum price floor before market crash

### 3. Market Events
- **Daily Events**:
  - Price fluctuations
  - Collection status updates
  - NPC trading decisions
- **Weekly Events**:
  - Environmental Backlash (price reduction)
  - Media Events (price boosts)
  - Market Crashes
  - Special Sales Periods
  - Collection status changes
- **Event Effects**:
  - Price multipliers
  - Status changes
  - Market sentiment shifts
  - Collection lifecycle progression

### 4. Trading Strategy
- **Market Analysis**:
  - Track daily price trends
  - Monitor weekly market cycles
  - Watch for First of Set opportunities
  - Follow market events
- **Trading Tactics**:
  - Buy low, sell high
  - Collect complete sets
  - Target rare combinations
  - Time market events
  - React to daily/weekly updates

## Game Cycle

### Daily Updates (24-hour tick)
- Players can make offers on NFTs
- List their own NFTs for sale
- NPCs make trading decisions
- Price fluctuations occur
- Collection status updates
- Market sentiment shifts

### Weekly Updates (7-day tick)
- Market events are checked and triggered
- Collection statuses are updated
- Player budgets are refreshed
- Market sentiment is recalculated
- Long-term price trends are adjusted
- Environmental and media events occur

### Collection Lifecycle
- **New**: Recently created collections
- **Normal**: Established collections
- **Declining**: Collections losing value
- **Dead**: Collections with no value
- Status changes occur during weekly updates
- Media events can reset collections to "New"

## Getting Started

### New Player Guide
1. **Account Setup**:
   - Create an account
   - Receive initial balance
   - Learn marketplace interface
2. **First Steps**:
   - Browse available NFTs
   - Understand rarity system
   - Make your first purchase
3. **Early Trading**:
   - Monitor daily price trends
   - Learn weekly market cycles
   - Build your collection

### Advanced Trading
1. **Collection Building**:
   - Focus on rare combinations
   - Complete sets
   - Target First of Set NFTs
2. **Market Timing**:
   - Watch for weekly events
   - Track daily price fluctuations
   - Identify buying opportunities
3. **Risk Management**:
   - Diversify your collection
   - Set price limits
   - Monitor market health
   - Plan for weekly updates

## Tips & Tricks
- **Trading Success**:
  - Research before buying
  - Set competitive prices
  - Watch for weekly events
  - Track daily price history
- **Collection Management**:
  - Balance rarity levels
  - Maintain diverse portfolio
  - Keep track of First of Set NFTs
  - Monitor collection status
- **Market Awareness**:
  - Monitor weekly event calendar
  - Watch daily price trends
  - Track successful trades
  - Plan for budget refreshes

## Technical Features
- **Daily Updates**:
  - Listing notifications
  - Purchase confirmations
  - Price updates
  - NPC trading activity
- **Weekly Updates**:
  - Market event alerts
  - Collection status changes
  - Budget refreshes
  - Market sentiment updates
- **User Interface**:
  - Responsive marketplace
  - Advanced filtering
  - Price display
  - Transaction history
  - Event calendar

## System Requirements
- **Browser Compatibility**:
  - Modern web browser (Chrome, Firefox, Safari, Edge)
  - JavaScript enabled
  - LocalStorage support
- **Requirements**:
  - Stable internet connection
  - Screen resolution: 1024x768 or higher recommended

## Game End Conditions
- Market collapses when all NFT sets are dead
- Each set may collapse independently
- Final winner has the most money
- Leaderboard tracks:
  - Most money
  - Most trades
  - Best trade (sale price - purchase price)
  - Most valuable NFT held
- Dead NFTs are valued at $1 each

---
For technical details and development information, see the main [README.md](README.md).

(Initial file)
Gameplay notes for the NFT Sim:

Pre-start: give players time to register 

Start: the players have a budget of X dollars
- this may refresh every 2 weeks or get a boost of Y dollars, representing income from a real job

Game begins: a selection of NFTs become available... not necessarily the first of their sets, since it's assumed unnamed buyers have taken some of the NFTs available.
- should probably be at least one first in the set, though 

NFT sets will have their own status: new, normal, declining, dead
- media event switches normal back to new?

Daily: players make offers on viable NFTs, or try putting their own NFTs up for sale 
- NPC buyers should do the same 
Price fluctuations due to both the market in general and buyers' actions, the latter having more of an effect 
Weekly: check for events, adjust prices and statuses accordingly.

Eventually the market should just collapse when everyone realizes how silly all this is.
- each set may have its own collapse, but the whole market should start falling later in the game.

Game ends when all NFT sets are dead. Winner is whoever has the most money. Leaderboard could also have who traded the most NFTS, who made the best trade (in terms of sale price minus purchase price), who had the most valuable one, et cetera.
- Held dead NFTS are essentially worthless, valued at $1 each.
