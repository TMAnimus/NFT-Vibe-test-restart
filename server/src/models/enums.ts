// Centralized enums for NFT Trading Game models

export enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  VeryRare = 'veryRare',
  NotPresent = 'notPresent',
}

// NOTE: All enum values for Rarity must be lowercase except 'notPresent'.
// Use these values everywhere (tests, config, docs, frontend, etc.) to avoid mismatches.
export enum CollectionStatus {
  New = 'new',
  Normal = 'normal',
  Declining = 'declining',
  Dead = 'dead',
} 

export enum AuctionType {
  Standard = 'standard',     // English auction - bids increase over time
  Dutch = 'dutch',          // Dutch auction - price decreases over time  
  Reserve = 'reserve',       // Auction with hidden reserve price
}

export enum AuctionStatus {
  Active = 'active',
  Ended = 'ended',
  Cancelled = 'cancelled',
}