# NFT Creation and Pricing Mechanics

**Last Updated**: June 19, 2025, 11:34 PM PDT

## Overview
This document outlines the NFT creation and pricing mechanics for the *NFT Trading Game*. NFTs are generated based on a combination of color, thing, and optional props, with pricing influenced by rarity, events, and market trends.

## NFT Structure
- **Color**: Base attribute with rarity levels
  - `colorRarity`: Enum (`"common"`, `"uncommon"`, `"rare"`, `"veryRare"`)
- **Thing**: Core object (e.g., "cat", "rock", "cloud")
- **Props**: Optional modifiers
  - `propRarity`: Enum (`"notPresent"`, `"common"`, `"uncommon"`, `"rare"`, `"veryRare"`)
  - Examples: "hat", "glasses", "sceptre"
  - `propVerb`: usually "holding" or "wearing"
- **NFT Description:**
  - (color) (thing) (if present: (propVerb) (prop))
  - Example: "purple cat holding a sceptre"

## Pricing Mechanics
### Base Price Adjustments
- **Color Rarity**:
  - `common`: Base price
  - `uncommon`: +15%
  - `rare`: +25%
  - `veryRare`: +40%

- **Prop Rarity**:
  - `notPresent`: No adjustment
  - `common`: +5%
  - `uncommon`: +10%
  - `rare`: +15%
  - `veryRare`: +25%

### Event Modifiers
- See README.Events.md for more details
- Events have a duration
- **Viral Meme Token Hype**:
  - `colorRarity: "rare"`: +35%
  - `colorRarity: "veryRare"`: +50%
  - `propRarity: "rare"`: +25%
  - `propRarity: "veryRare"`: +40%

- **Environmental Backlash**:
  - `colorRarity: "common"`: -15%
  - `colorRarity: "uncommon"`: -10%
  - `propRarity: "common"`: -10%
  - `propRarity: "uncommon"`: -5%

- **Brand Collab Mania**:
  - `colorRarity: "rare"`: +20%
  - `colorRarity: "veryRare"`: +30%
  - `propRarity: "rare"`: +15%
  - `propRarity: "veryRare"`: +25%

### Special Cases
- **First of Set**: +50% to base price
- **Blockchain**: Additional 10% for each blockchain attribute
- **Market Crash**: All prices reduced by 25% during event

## Implementation Guidelines
1. **NFT Generation**:
   - Randomly select color and thing
   - 30% chance for prop addition (percentage is set-specific)
   - Ensure uniqueness unless common color/no prop present

2. **Price Calculation**:
   - Start with base price (100)
   - Apply rarity modifiers
   - Apply event modifiers
   - Apply special case modifiers

3. **Event Handling**:
   - Events can stack
   - There is no hard maximum price cap.
   - **Maximum price change per cycle is +250% (from previous price, if provided).**
   - Minimum price floor: **$25 before a crypto market crash, $1 after**

## Example Calculations
1. Common NFT with no prop:
   - Base: 100
   - Total: 100

2. Very Rare color with rare prop:
   - Base: 100
   - Color: +40%
   - Prop: +15%
   - Total: 155

3. Rare color with very rare prop during Viral Meme Token Hype:
   - Base: 100
   - Color: +25% + 35% (event)
   - Prop: +25% + 25% (event)
   - Total: 210

## Notes
- All percentages are multiplicative
- Round final price to nearest integer
- Store base price with NFT for future reference
- Update prices in real-time during events
- **There is no hard price cap. If a previous price is provided, the maximum price change per cycle is +250%.**
- Minimum price is $25 unless the crypto market has crashed, in which case the minimum is $1.