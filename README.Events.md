# NFT Marketplace Events Reference

This document describes all market events defined in `server/sets/nft_config.json` that can affect NFT prices and gameplay. Each event may have a multiplier, duration, conditions, and special effects.

---

## Event List

### celebrityEndorsement
- **Description:** A celebrity gives a shoutout to a collection or NFT, causing a surge in value.
- **Effect:** Multiplier: 1.3x, Duration: 3 days

### celebrityCriticism
- **Description:** A celebrity criticizes NFTs, causing a dip in value.
- **Effect:** Multiplier: 0.85x, Duration: 2 days

### nftStolen
- **Description:** News breaks that an NFT was “stolen.” Value drops, but may recover if the outcome is positive.
- **Effect:** Multiplier: 0.8x, Duration: 2 days
- **Positive Outcome:** If resolved, value increases (1.1x for 2 days)

### artificialScarcity
- **Description:** A sudden reduction in available NFTs creates artificial scarcity, boosting prices.
- **Effect:** Multiplier: 1.4x, Duration: unlimited

### publicOpinionSours
- **Description:** Public sentiment turns against NFTs, causing a market dip.
- **Effect:** Multiplier: 0.9x, Duration: 5 days

### ageDecay
- **Description:** Older NFTs lose value over time unless they have special utility or reputation.
- **Effect:** After 6 months, price decays by 0.95x monthly (floor: $1)

### cryptoMarketCrash
- **Description:** The entire crypto market crashes, dragging NFT prices down.
- **Effect:** Multiplier: 0.7x, Duration: 4 days

### viralMemeTokenHype
- **Description:** A meme token goes viral, boosting rare color NFTs.
- **Effect:** Multiplier: 1.35x, Duration: 2 days
- **Condition:** Only applies to NFTs with colorRarity: rare or veryRare

### environmentalBacklash
- **Description:** Environmental concerns about blockchain energy use cause a dip in Ethereum NFTs.
- **Effect:** Multiplier: 0.85x, Duration: 3 days
- **Condition:** Only applies to blockchain: Ethereum

### brandCollabMania
- **Description:** A major brand collaborates with NFT creators, boosting rare prop NFTs.
- **Effect:** Multiplier: 1.25x, Duration: 3 days
- **Condition:** Only applies to NFTs with propRarity: rare or veryRare

### speculativeBubblePop
- **Description:** The NFT market bubble pops, especially for common NFTs.
- **Effect:** Multiplier: 0.75x, Duration: 5 days
- **Condition:** Only applies to NFTs with colorRarity: common and propRarity: common or notPresent

### solanaOutage
- **Description:** Solana blockchain outage causes a dip in Solana NFTs.
- **Effect:** Multiplier: 0.8x, Duration: 2 days
- **Condition:** Only applies to blockchain: Solana

### polygonFeeHike
- **Description:** Polygon network fee hike causes a dip in Polygon NFTs.
- **Effect:** Multiplier: 0.9x, Duration: 3 days
- **Condition:** Only applies to blockchain: Polygon

---

See `nft_config.json` for technical details and event probabilities. Events may be expanded in the future for more satirical or dynamic gameplay.
