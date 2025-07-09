# New Set Debut System for NFT Trading Game

**Last Updated**: July 6, 2025, 12:29 AM PDT

## Overview
This document outlines the new set debut system in the *NFT Trading Game* (NFT VibeCode), a satirical multiplayer simulation of an NFT marketplace. The system generates NFTs, splits them among set creators, NPCs, and players, and manages common/no-prop NFTs in batches to create a dynamic and challenging trading environment. The debut process ensures that most possible combinations are created, while some NFTs are held back by creators or instantly acquired by NPCs, adding scarcity and competition.

## Generating the Set
- **Unique Combinations**: The game generates a set number of unique NFTs based on attribute combinations (e.g., color, thing, props). The number of unique NFTs is defined by `NEW_SET_SIZE` in `nft_config.json` (e.g., 100).
- **Common/No-Prop NFTs**: For combinations with common colors and no props (e.g., "brown Randy Raccoon"), duplicates are allowed. The game generates a fixed number of identical NFTs for each such combination, as defined by `DUPLICATES_PER_COMMON_COMBO` in `nft_config.json` (e.g., 10 duplicates per combination).
- **Total NFTs**: The total number of NFTs in the set is the sum of unique NFTs and duplicates. For example, with 80 unique NFTs and 20 common/no-prop combinations each having 10 duplicates, the total is 80 + (20 * 10) = 280 NFTs.

## Splitting the NFTs
At debut, the total NFTs are divided into three groups:
- **Held Back by Creators**: A percentage of the total NFTs is reserved by the set creators for later release (e.g., during special events). This percentage is defined by `CREATOR_RESERVE_PERCENTAGE` in `nft_config.json` (e.g., 20%).
- **Instantly Acquired by NPCs**: Another percentage is immediately acquired by NPCs at the moment of debut, simulating bots or insiders. This percentage is defined by `NPC_ACQUISITION_PERCENTAGE` in `nft_config.json` (e.g., 30%).
- **Available to Players**: The remaining portion is listed in the marketplace for players to purchase. This is calculated as the total NFTs minus the creators' reserve and NPCs' share (e.g., 50% of the total).

## Managing Common/No-Prop NFTs in Batches
- **Definition**: Common/no-prop NFTs are those with common colors and no props, where duplicates are allowed (e.g., multiple "brown Randy Raccoons").
- **Batch Listings**: Instead of listing each duplicate individually, these NFTs are grouped into batches for sale. For example, if 7 duplicates of "brown Randy Raccoon" are available to players, the marketplace lists them as:
  - **"7 brown Randy Raccoons on sale for $100 each."**
- **Buying from Batches**: Players and NPCs can purchase one or more NFTs from the batch. If a player buys 1, the listing updates to "6 brown Randy Raccoons on sale for $100 each." The price for the batch may adjust based on demand (e.g., increasing if many are bought quickly).
- **Market Simplicity**: This batch system keeps the text-based UI clean and manageable, avoiding a flood of individual listings for identical NFTs.

## Unique NFTs
- **Individual Listings**: Each unique NFT (e.g., "Purple Cat with Sceptre") is listed individually in the marketplace with its own price, which is set by the system or adjusted by players.
- **Trading**: Unique NFTs are traded separately, with their prices influenced by rarity, events, and market activity.

## Example Debut
Consider a new set with:
- 80 unique NFTs.
- 20 common/no-prop combinations, each with 10 duplicates (200 duplicates total).
- Total NFTs: 280.

**Splitting at Debut**:
- **Creators’ Reserve**: 20% of 280 = 56 NFTs (e.g., 16 unique + 40 duplicates).
- **NPCs’ Share**: 30% of 280 = 84 NFTs (e.g., 24 unique + 60 duplicates).
- **Players’ Share**: 50% of 280 = 140 NFTs.
  - **Unique NFTs**: 40 listed individually (e.g., "Blue Dog with Hat: $120").
  - **Common/No-Prop NFTs**: For each combination, the available duplicates are listed in batches. If a combination has 10 duplicates and 5 are available to players (after NPCs take 3 and creators reserve 2), the batch starts as "5 brown Randy Raccoons on sale for $100 each."

**Marketplace Appearance**:
- Players see individual listings for the 40 unique NFTs.
- For each common/no-prop combination, they see batch listings like "5 brown Randy Raccoons on sale for $100 each," reflecting the available count after NPC acquisitions and creators' reserves.

## Trading Dynamics
- **Players**: Can buy from or sell to batch listings for common/no-prop NFTs, reducing or increasing the available count. For example, buying 1 from a batch of 5 updates it to "4 brown Randy Raccoons for $100 each." Players can also sell duplicates back to the batch at the current market price.
- **NPCs**: After their initial acquisition, NPCs can continue to buy from or sell to the batches during daily ticks, competing with players.
- **Creators**: Reserved NFTs can be added to the marketplace later, either as individual listings or by increasing batch counts, potentially during special events or to influence market dynamics.

## Configurability
All key parameters for the new set debut system are defined in `nft_config.json` to allow for easy tuning and flexibility:
- `NEW_SET_SIZE`: Number of unique NFTs generated per set.
- `DUPLICATES_PER_COMMON_COMBO`: Number of duplicates generated for each common/no-prop combination.
- `CREATOR_RESERVE_PERCENTAGE`: Percentage of total NFTs reserved by creators.
- `NPC_ACQUISITION_PERCENTAGE`: Percentage of total NFTs instantly acquired by NPCs at debut.
- Additional settings (e.g., `NPC_DEBUT_AGGRESSION_FACTOR`, `NEW_SET_HYPE_MULTIPLIER`) can be added to control NPC behavior and market effects during debuts.

## Why It Works
- **Batch Management**: Grouping common/no-prop NFTs simplifies trading and keeps the marketplace organized, especially in a text-based UI.
- **Gameplay Challenge**: With only a portion of NFTs available to players at debut, and NPCs grabbing a share, the system creates scarcity and competition, leaning into the game’s satirical take on real-world NFT drops.
- **Flexibility**: Configurable percentages and sizes allow for easy adjustments to the game’s difficulty and pacing.

---
See the main [README.md](README.md), [README.Gameplay.md](README.Gameplay.md), and [README.NPCs.md](README.NPCs.md) for project context and related mechanics.