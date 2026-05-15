# NFT Trading Game - Gameplay Guide (v2)

## Overview
NFT Trading Game is a satirical, multiplayer NFT marketplace simulation. Players compete to collect, trade, and manipulate the market with a variety of absurd NFTs.

## Core Mechanics

- **NFT Creation:** Generate NFTs with random attributes and rarity.
- **Marketplace:** List, buy, and sell NFTs. Prices fluctuate based on rarity, batch status, and market events.
- **Events:** Market events (see [README.Events.md](README.Events.md)) can affect prices and collection status.
- **Tick-based Updates:** Daily and weekly updates drive the market, update prices, and trigger events.
- **NPCs:** Compete with NPC buyers using diverse strategies (see [README.NPCs.md](README.NPCs.md)).

## Glossary

- **Set:** All NFTs of the same noun.
- **Collection:** NFTs owned by a user or NPC.
- **Batch:** Group of NFTs with the same description in the market.

## NFT Attributes

- **Display Name:** Satirical name (e.g., “Glowing Crypto Potato”)
- **Color Rarity:** Common, Uncommon, Rare, Very Rare
- **Prop Rarity:** NotPresent, Common, Uncommon, Rare, Very Rare
- **First of Set:** Special status for first NFT in a set
- **Blockchain:** Ethereum (default; may expand)
- **Base Price:** By rarity
- **Current Price:** Dynamic; affected by market updates and events
- **Status:** Owned, Listed, Sold
- **Collection Status:** New, Normal, Declining, Dead

## Features

- Real-time updates via Socket.IO
- TypeScript for improved coherence
- Satirical authentication (4-digit PIN, hashed)
- Marketplace events and sentiment shifts
- NPC trading strategies
- Daily/weekly cycles
- Batch management for common NFTs

## Future Features

See [README.Future.md](README.Future.md) for planned features (GUI, player-triggered events, etc.)