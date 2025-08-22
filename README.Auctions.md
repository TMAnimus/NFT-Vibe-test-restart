# NFT Trading Game: Auction System Design

## Overview
This document outlines an auction system to replace the current first-come-first-serve marketplace in the NFT Trading Game. The system maintains the satirical tone while adding strategic depth and better player-NPC competition.

## Current vs Proposed System

### Current System
- **First-come-first-serve**: Fastest buyer gets the NFT
- **Fixed pricing**: Seller sets price, buyer accepts or rejects
- **Limited competition**: No bidding wars or strategic timing

### Proposed Auction System
- **Bidding competition**: Multiple players/NPCs can compete for same NFT
- **Dynamic pricing**: Market determines final price through competition
- **Strategic timing**: Players must decide when and how much to bid

## Auction Types

### 1. Standard Auctions (Individual NFTs)
**For unique NFTs and single items**

**Mechanics:**
- Seller lists NFT with starting bid and duration (e.g., 24-72 hours)
- Buyers place incremental bids
- Highest bidder wins when auction expires
- Autobid feature available for players

**Example:**
```
Purple Cat with Sceptre
Starting Bid: $500
Current Bid: $750 (CryptoHypeBot)
Time Remaining: 18 hours
Your Max Autobid: $900
```

### 2. Batch Auctions (Common/No-Prop NFTs)
**For batches of identical NFTs**

**Mechanics:**
- Dutch auction style: Price starts high, decreases over time
- Players bid for quantity they want at current price
- When demand meets supply, auction closes
- Multiple winners possible

**Example:**
```
7 Brown Randy Raccoons
Current Price: $120 each (started at $150)
Next Price Drop: $110 in 2 hours
Bids: SceptreFanatic (2), You (1), CryptoWhale (3)
Remaining: 1
```

### 3. Reserve Auctions
**For high-value or rare NFTs**

**Mechanics:**
- Hidden reserve price set by seller
- Bidding continues until reserve is met
- If reserve not met, seller can accept highest bid or relist

## Implementation Strategy

### Database Schema Updates

```typescript
interface Auction {
  id: string;
  nftId: string; // Single NFT or batch representative
  sellerId: string;
  type: AuctionType; // "standard", "batch", "reserve"
  
  // Pricing
  startingBid: number;
  reservePrice?: number; // Hidden from bidders
  currentHighBid: number;
  
  // Batch-specific
  batchSize?: number; // For batch auctions
  dutchStartPrice?: number;
  dutchPriceDecrement?: number;
  dutchDecrementInterval?: number; // hours
  
  // Timing
  startTime: Date;
  endTime: Date;
  
  // Bids
  bids: Bid[];
  
  // Status
  status: "active" | "ended" | "cancelled";
  winnerId?: string;
  finalPrice?: number;
}

interface Bid {
  bidderId: string;
  amount: number;
  quantity?: number; // For batch auctions
  timestamp: Date;
  isAutobid: boolean;
  maxAutobid?: number;
}
```

### Tick Integration

**During Daily Ticks:**
1. **Process Ending Auctions**: Award NFTs to winners, charge buyers, pay sellers
2. **Update Dutch Auctions**: Decrease prices for batch auctions
3. **Execute Autobids**: Check if any autobids should be triggered
4. **NPC Bidding**: NPCs evaluate active auctions and place bids based on strategies

**Auction Processing Order:**
```typescript
// Daily tick auction processing
async function processDailyAuctions() {
  // 1. End expired auctions
  const endingAuctions = await getExpiringAuctions();
  for (const auction of endingAuctions) {
    await finalizeAuction(auction);
  }
  
  // 2. Update Dutch auction prices
  await updateDutchAuctionPrices();
  
  // 3. Process NPC bidding
  await processNPCBidding();
  
  // 4. Execute pending autobids
  await processAutobids();
}
```

### NPC Bidding Strategies

**Conservative NPCs:**
- Bid early with modest increments
- Set low maximum bids
- Focus on undervalued items

**Aggressive NPCs:**
- Bid in final hours with large increments
- Willing to overbid significantly
- Create bidding wars

**Collector NPCs:**
- Extremely high bids for focused items (sceptres, purple, etc.)
- Will bid regardless of "reasonable" price
- Create artificial scarcity

**Speculative NPCs:**
- Snipe auctions in final minutes
- Calculate maximum profitable bids
- Avoid emotional bidding

**Opportunist NPCs:**
- Focus on batch auctions and Dutch auctions
- Wait for price drops
- Bid strategically on multiple items

## User Interface Updates

### Auction Listings Page
```
=== ACTIVE AUCTIONS ===

🔥 Purple Cat with Sceptre              Time: 4h 23m
   Current Bid: $1,250 (SceptreFanatic)   Starting: $500
   [Bid Now] [Set Autobid: $____]

⚡ 5 Brown Randy Raccoons (Dutch)       Time: 1h 15m until price drop
   Current Price: $85 each                Next Price: $80
   Bids: CryptoWhale(2), You(1)          Remaining: 2
   [Bid for __ items]

💎 Glowing Potato (Reserve Not Met)     Time: 12h 05m
   Current Bid: $2,100 (CryptoHypeBot)   Starting: $1,000
   Status: Reserve not yet met
   [Bid Now] [Set Autobid: $____]
```

### Bidding Interface
```
=== BID ON: Purple Cat with Sceptre ===

Current High Bid: $1,250 (SceptreFanatic)
Minimum Next Bid: $1,300

Your Bid: $_______ [Place Bid]

⚙️ Autobid Settings:
   Max Autobid: $_______ 
   Increment: $50 ▼
   [x] Bid in final 10 minutes only
   [ ] Bid immediately when outbid
   
Recent Bids:
- SceptreFanatic: $1,250 (2 mins ago)
- CryptoWhale: $1,200 (15 mins ago) 
- You: $1,150 (1 hour ago)
```

## Configuration Options

**Add to nft_config.json:**
```json
{
  "auctions": {
    "defaultDurationHours": 24,
    "minBidIncrement": 25,
    "autobidMaxIncrement": 100,
    "dutchAuctionStartMultiplier": 1.5,
    "dutchAuctionDecrementPercent": 0.1,
    "dutchAuctionInterval": 2,
    "reserveAuctionThreshold": 1000,
    "npcBiddingAggressiveness": {
      "conservative": 0.3,
      "aggressive": 0.8,
      "speculative": 0.6,
      "collector": 1.2,
      "opportunist": 0.4
    }
  }
}
```

## Satirical Elements

### Auction Events
- **"Bid War Frenzy"**: NPCs go crazy bidding on common items
- **"Sniping Bot Malfunction"**: All final-second bids fail hilariously
- **"Whale Enters Chat"**: Mysterious NPC with unlimited budget appears
- **"Reserve Revelation"**: Reserve prices are accidentally revealed

### NPC Behavior Flavors
- **SceptreFanatic**: "MUST HAVE SCEPTRE AT ANY COST!"
- **CryptoHypeBot**: Bids in round numbers only ($1000, $2000, etc.)
- **PanicSeller**: Lists everything with 1-hour auctions
- **SnipeKing**: Only bids in final 30 seconds

### Auction Messages
```
🎊 BIDDING WAR ALERT! 
SceptreFanatic and CryptoWhale are locked in epic battle over a plastic fork NFT!
Current bid: $5,000 (this is fine 🔥)

⚡ DUTCH AUCTION CHAOS!
Nobody wants these 10 Brown Randy Raccoons at $200 each...
Price dropped to $150... still nothing...
Price dropped to $100... CryptoHypeBot finally awakens!

💀 AUCTION FAIL!
Reserve price of $50,000 not met for "Slightly Used Tissue NFT"
High bid was $3. We're not angry, just disappointed.
```

## Migration Strategy

### Phase 1: Parallel Systems
- Run both auction and fixed-price systems simultaneously
- Allow sellers to choose listing type
- Gather data on user preferences

### Phase 2: Gradual Transition  
- Default new listings to auctions
- Keep fixed-price for batch items under certain value
- Add auction filters and sorting

### Phase 3: Full Migration
- Convert remaining fixed-price listings to auctions
- Remove old marketplace code
- Optimize auction-specific features

## Benefits

### For Players
- **Strategic depth**: Timing and bidding strategy matter
- **Fair competition**: Better players can outmaneuver NPCs
- **Price discovery**: True market value through competition
- **Excitement**: Bidding wars and last-second wins

### For Gameplay
- **Market dynamics**: More realistic price fluctuations
- **NPC differentiation**: Strategies become more apparent
- **Event integration**: Auctions can trigger special events
- **Satirical opportunities**: More scenarios for absurd market behavior

### Technical Benefits
- **Batch efficiency**: Dutch auctions handle common NFTs elegantly  
- **Load distribution**: Bidding spreads across auction duration
- **Data richness**: Bidding history provides market insights

## Potential Challenges

### Technical
- **Timing precision**: Ensuring fair final-second bidding
- **Scalability**: Multiple simultaneous auctions
- **State management**: Complex auction states vs simple listings

### Gameplay
- **Learning curve**: More complex than fixed pricing
- **Balance**: Ensuring NPCs don't dominate all auctions
- **Pacing**: Auction durations vs daily tick timing

### Solutions
- **Bid queuing**: Handle simultaneous final bids fairly
- **NPC throttling**: Limit NPC participation per auction
- **Tutorial system**: Guide new players through auction mechanics
- **Flexible durations**: Match auction length to item importance

---

This auction system maintains the game's satirical spirit while adding strategic depth that should make player vs NPC competition more engaging and fair than the current first-come-first-serve system.