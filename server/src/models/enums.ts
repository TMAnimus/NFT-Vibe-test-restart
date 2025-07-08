// Centralized enums for NFT Trading Game models

export enum Rarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  VeryRare = 'veryrare',
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