# NFT Trading Game API Documentation

## Overview
Complete API documentation for the NFT Trading Game, including authentication, marketplace, auction system, notifications, and real-time features.

**Base URL**: `http://localhost:3000/api`  
**Authentication**: JWT Bearer Token  
**Real-time**: Socket.IO for live updates

## Table of Contents
- [Authentication](#authentication)
- [User Management](#user-management)
- [NFT Operations](#nft-operations)
- [Marketplace](#marketplace)
- [Auction System](#auction-system) ✅ **NEW**
- [Notifications](#notifications)
- [Tick System](#tick-system)
- [Socket.IO Events](#socketio-events)
- [Error Handling](#error-handling)

---

## Authentication

### Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "testuser",
  "pin": "1234"
}
```

**Response (201):**
```json
{
  "_id": "60f7c2b8e1d2c8a1b8e1d2c8",
  "username": "testuser",
  "balance": 10000,
  "nfts": []
}
```

**Errors:**
- `400`: Username already exists or invalid input
- `500`: Server error

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "testuser",
  "pin": "1234"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400`: Invalid username or PIN
- `500`: Server error

---

## User Management

### Get User Profile
**GET** `/user/profile`  
**Auth Required**: Yes

Get current user's profile information.

**Response (200):**
```json
{
  "_id": "60f7c2b8e1d2c8a1b8e1d2c8",
  "username": "testuser",
  "balance": 9500,
  "nfts": [
    {
      "_id": "nft123",
      "displayName": "Rare Potato #1",
      "colorRarity": "rare",
      "propRarity": "common",
      "currentPrice": 150
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized
- `404`: User not found
- `500`: Server error

---

## NFT Operations

### Generate NFT
**POST** `/nft/generate`

Generate a new NFT from a collection.

**Request Body:**
```json
{
  "collectionName": "Crypto Toasters"
}
```

**Available Collections:**
- Apathetic Axolotls, Crypto Bananas, Cynical Capybaras
- Distracted Degenerates, Disinterested Ducks, Crypto Lamps  
- Crypto Mugs, Crypto Clips, Crypto Pencils, Crypto Plants
- Crypto Potatoes, Sleepy Sloths, Crypto Socks, Crypto Toast, Crypto Toasters

**Response (201):**
```json
{
  "_id": "nft456",
  "displayName": "Crypto Toaster #1",
  "collectionName": "Crypto Toasters",
  "colorRarity": "rare",
  "propRarity": "common",
  "blockchain": "Ethereum",
  "currentPrice": 100,
  "marketStatus": "Owned"
}
```

**NFT Market Status Values:**
| Status | Description |
|--------|-------------|
| `Owned` | NFT is owned and not listed — default state after generation or purchase |
| `Listed` | NFT is listed for fixed-price sale on the marketplace |
| `Auction` | NFT is currently being auctioned |
| `Sold` | NFT has been sold (legacy/reserved state) |

**Errors:**
- `400`: Validation error
- `404`: Collection not found
- `500`: Server error

### Get My NFTs
**GET** `/nft/my-nfts`  
**Auth Required**: Yes

Get current user's NFT collection.

**Response (200):**
```json
[
  {
    "_id": "nft123",
    "displayName": "Rare Potato #1",
    "colorRarity": "rare",
    "propRarity": "common",
    "currentPrice": 150,
    "marketStatus": "Listed"
  }
]
```

---

## Marketplace

### Get Listed NFTs
**GET** `/marketplace/listed`

Get all NFTs available for purchase with optional filtering.

**Query Parameters:**
- `colorRarity`: `common`, `uncommon`, `rare`, `veryRare`
- `propRarity`: `notPresent`, `common`, `uncommon`, `rare`, `veryRare`
- `blockchain`: `Ethereum`, `Polygon`, `Solana`
- `minPrice`: number
- `maxPrice`: number

**Response (200):**
```json
[
  {
    "_id": "nft123",
    "displayName": "Rare Potato #1",
    "colorRarity": "rare",
    "propRarity": "common",
    "blockchain": "Ethereum",
    "currentPrice": 150,
    "marketStatus": "Listed"
  }
]
```

### List NFT for Sale
**POST** `/marketplace/list`  
**Auth Required**: Yes

List an NFT for fixed-price sale.

**Request Body:**
```json
{
  "nftId": "nft123",
  "price": 150
}
```

**Response (200):**
```json
{
  "message": "NFT listed successfully."
}
```

**Errors:**
- `400`: Validation error or NFT not in `Owned` status (already listed or being auctioned)
- `401`: User doesn't own the NFT
- `404`: NFT not found

### Buy NFT
**POST** `/marketplace/buy/{nftId}`  
**Auth Required**: Yes

Purchase an NFT from the marketplace.

**Response (200):**
```json
{
  "message": "NFT purchased successfully."
}
```

**Errors:**
- `400`: NFT not for sale, insufficient funds, or trying to buy own NFT
- `404`: NFT not found

### Suggest Price
**GET** `/marketplace/suggest-price/{nftId}`

Get AI-suggested price for an NFT based on rarity and market conditions.

**Response (200):**
```json
{
  "suggestedPrice": 210
}
```

### Batch Operations

#### Buy from Batch
**POST** `/marketplace/batch-buy`  
**Auth Required**: Yes

Buy quantity from a batch NFT (common/no-prop only).

**Request Body:**
```json
{
  "nftId": "batch123",
  "quantity": 3
}
```

#### Sell to Batch
**POST** `/marketplace/batch-sell`  
**Auth Required**: Yes

Sell quantity to a batch NFT.

**Request Body:**
```json
{
  "nftId": "batch123",
  "quantity": 2
}
```

---

## Auction System ✅ **FULLY IMPLEMENTED**

### Get Active Auctions
**GET** `/auctions/active`

Get all currently active auctions.

**Response (200):**
```json
[
  {
    "_id": "auction123",
    "nftId": {
      "_id": "nft123",
      "displayName": "Rare Potato #1",
      "colorRarity": "rare"
    },
    "sellerId": {
      "_id": "user123",
      "username": "seller1"
    },
    "auctionType": "standard",
    "auctionStatus": "active",
    "startingBid": 100,
    "currentBid": 150,
    "endTime": "2025-01-13T12:00:00.000Z",
    "bidCount": 3
  }
]
```

### Get Auction Details
**GET** `/auctions/{auctionId}`

Get detailed auction information with bid history.

**Response (200):**
```json
{
  "auction": {
    "_id": "auction123",
    "nftId": {
      "_id": "nft123",
      "displayName": "Rare Potato #1"
    },
    "auctionType": "standard",
    "currentBid": 150,
    "endTime": "2025-01-13T12:00:00.000Z"
  },
  "bids": [
    {
      "_id": "bid123",
      "bidderId": {
        "username": "bidder1"
      },
      "bidAmount": 150,
      "bidTime": "2025-01-13T10:30:00.000Z",
      "isAutobid": false
    }
  ]
}
```

### Create Auction
**POST** `/auctions/create`  
**Auth Required**: Yes

Create a new auction for an NFT.

**Request Body:**
```json
{
  "nftId": "nft123",
  "auctionType": "standard",
  "startingBid": 100,
  "duration": 300,
  "reservePrice": 200
}
```

**Auction Types:**
- `standard`: English-style auction, highest bid wins
- `dutch`: Price decreases over time, first bidder wins
- `reserve`: Hidden minimum price that must be met

**Response (201):**
```json
{
  "message": "Auction created successfully",
  "auction": {
    "_id": "auction123",
    "auctionType": "standard",
    "startingBid": 100,
    "endTime": "2025-01-13T12:00:00.000Z"
  }
}
```

**Errors:**
- `400`: Validation error or NFT not in `Owned` status (already listed or being auctioned)
- `401`: User doesn't own the NFT
- `403`: NFT is currently being auctioned (`Auction` status)
- `404`: NFT not found

### Place Bid
**POST** `/auctions/{auctionId}/bid`  
**Auth Required**: Yes

Place a bid on an active auction.

**Request Body:**
```json
{
  "bidAmount": 150,
  "isAutobid": false,
  "maxAutobidAmount": 200,
  "autobidIncrement": 10
}
```

**Response (200):**
```json
{
  "message": "Bid placed successfully",
  "bid": {
    "_id": "bid123",
    "bidAmount": 150,
    "bidTime": "2025-01-13T10:30:00.000Z"
  }
}
```

**Errors:**
- `400`: Invalid bid amount, auction ended, or bidding on own auction
- `404`: Auction not found

### Cancel Auction
**POST** `/auctions/{auctionId}/cancel`  
**Auth Required**: Yes

Cancel an auction (seller only, no bids).

**Response (200):**
```json
{
  "message": "Auction cancelled successfully"
}
```

**Errors:**
- `400`: Cannot cancel (has bids or auction ended)
- `403`: Not the auction owner
- `404`: Auction not found

### Get My Auctions
**GET** `/auctions/my-auctions`  
**Auth Required**: Yes

Get user's auctions as seller.

**Response (200):**
```json
[
  {
    "_id": "auction123",
    "nftId": {
      "displayName": "Rare Potato #1"
    },
    "auctionType": "standard",
    "auctionStatus": "active",
    "currentBid": 150,
    "endTime": "2025-01-13T12:00:00.000Z"
  }
]
```

### Get My Bids
**GET** `/auctions/my-bids`  
**Auth Required**: Yes

Get user's bids as bidder.

**Response (200):**
```json
[
  {
    "_id": "bid123",
    "auctionId": {
      "_id": "auction123",
      "nftId": {
        "displayName": "Rare Potato #1"
      },
      "auctionStatus": "active"
    },
    "bidAmount": 150,
    "bidTime": "2025-01-13T10:30:00.000Z"
  }
]
```

---

## Notifications

### Get Notification Preferences
**GET** `/notifications/preferences`  
**Auth Required**: Yes

Get current user's notification preferences.

**Response (200):**
```json
{
  "userId": "60f7c2b8e1d2c8a1b8e1d2c8",
  "enabled": true,
  "types": {
    "marketUpdate": true,
    "listingCreated": true,
    "listingSold": true,
    "system": true,
    "auctionBid": true,
    "auctionWon": true,
    "auctionEnded": true
  }
}
```

### Update Notification Preferences
**PUT** `/notifications/preferences`  
**Auth Required**: Yes

Update user's notification preferences.

**Request Body:**
```json
{
  "enabled": false,
  "types": {
    "marketUpdate": false,
    "auctionBid": true
  }
}
```

### Reset Notification Preferences
**DELETE** `/notifications/preferences`  
**Auth Required**: Yes

Reset preferences to defaults.

**Response (204):** No content

---

## Tick System

### Get Tick Status
**GET** `/tick/status`

Get current tick system status.

**Response (200):**
```json
{
  "isRunning": true,
  "lastTickTime": "2025-01-13T06:02:29.066Z",
  "interval": 10000
}
```

### Start Tick System
**POST** `/tick/start`

Start the tick system for market updates and auction processing.

**Request Body (Optional):**
```json
{
  "intervalMs": 10000
}
```

### Stop Tick System
**POST** `/tick/stop`

Stop the tick system.

---

## Socket.IO Events

### Connection Setup
```javascript
const socket = io({
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Server to Client Events

#### Marketplace Events
- **`listingCreated`**: New NFT listed for sale
- **`listingSold`**: NFT purchased
- **`marketUpdate`**: Price changes from tick system

#### Auction Events ✅ **NEW**
- **`auctionCreated`**: New auction started
- **`bidPlaced`**: New bid placed on auction
- **`auctionEnded`**: Auction completed or expired
- **`dutchPriceUpdate`**: Dutch auction price decreased

#### Notification Events
- **`notification`**: Personal notification to user
- **`globalNotification`**: System-wide announcement

### Client to Server Events
- **`joinMarketplace`**: Join marketplace room for updates
- **`joinAuction`**: Join specific auction room for bid updates

### Event Examples

#### Auction Bid Event
```json
{
  "type": "bidPlaced",
  "auctionId": "auction123",
  "bidAmount": 150,
  "bidderId": "user456",
  "bidderUsername": "bidder1",
  "timestamp": "2025-01-13T10:30:00.000Z"
}
```

#### Auction End Event
```json
{
  "type": "auctionEnded",
  "auctionId": "auction123",
  "winnerId": "user456",
  "winnerUsername": "bidder1",
  "finalBid": 200,
  "nftId": "nft123",
  "timestamp": "2025-01-13T12:00:00.000Z"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content
- **400**: Bad Request (validation errors, business logic violations)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

### Common Error Scenarios

#### Authentication Errors
```json
{
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

#### Validation Errors
```json
{
  "message": "Validation error",
  "error": [
    {
      "msg": "Valid bid amount required",
      "path": "bidAmount",
      "location": "body"
    }
  ]
}
```

#### Business Logic Errors
```json
{
  "message": "Cannot bid on your own auction",
  "error": "Seller cannot bid"
}
```

---

## Rate Limiting & Security

- **JWT Expiration**: 1 hour
- **Password Hashing**: bcrypt with 10 salt rounds
- **Input Validation**: express-validator for all endpoints
- **MongoDB Transactions**: Used for critical operations (auctions, purchases)
- **Socket.IO Authentication**: JWT token required for real-time features

---

## Development & Testing

### Swagger UI
Interactive API documentation available at: `http://localhost:3000/api-docs`

### Test Coverage
- **104/104 tests passing** ✅
- Unit tests for all services
- Integration tests for API endpoints
- Socket.IO event testing
- Auction system comprehensive testing

### Environment Variables
See `server/docs/environment-variables.md` for configuration options.

---

## Changelog

### Version 3.2 - MarketStatus Enum ✅ **LATEST**
- **NEW**: `MarketStatus` enum added to `server/src/models/enums.ts` with four states: `Owned`, `Listed`, `Auction`, `Sold`
- **FIXED**: NFT schema now uses `Object.values(MarketStatus)` — `Auction` is now a valid enum value (was previously missing, causing silent Mongoose validation failures)
- **FIXED**: Default `marketStatus` corrected from `Listed` → `Owned` (a newly generated NFT starts as owned, not listed)
- **FIXED**: Cancelled and no-winner auctions now correctly reset NFT status to `Owned` instead of `Listed`
- **IMPROVED**: All magic strings replaced with `MarketStatus` enum references across `auctionService.ts` and `marketplaceService.ts`

### NFT Market Status State Machine
```
[Generated] ──► Owned ──► Listed ──► Owned  (after purchase)
                  │
                  └──► Auction ──► Owned    (after auction ends: won, no-winner, or cancelled)
```

### Version 3.1 - Modern Frontend ✅
- **NEW**: React + TypeScript + Tailwind CSS frontend implementation
- **NEW**: Interactive auction components with real-time countdown timers
- **NEW**: Modern UI with responsive design and custom component classes
- **NEW**: Enhanced NFT generation interface with all 15 collections
- **ENHANCED**: Improved user experience with modal dialogs and form validation
- **ENHANCED**: Real-time notifications with custom toast animations
- **ENHANCED**: Production-ready build process with Vite and optimized CSS

### Version 3.0 - Auction System ✅
- **NEW**: Complete auction system with Standard, Dutch, and Reserve auctions
- **NEW**: Real-time bidding with Socket.IO integration
- **NEW**: Auction management endpoints (create, bid, cancel)
- **NEW**: Auction-specific notification types
- **ENHANCED**: Marketplace now supports both fixed-price and auction listings
- **ENHANCED**: Tick system processes auction expiration and Dutch price updates
- **ENHANCED**: 104/104 tests passing with full auction coverage

### Version 2.0 - Notifications & Real-time
- Notification preference management
- Socket.IO real-time updates
- Market tick system
- Batch operations for common NFTs

### Version 1.0 - Core Features
- User authentication with JWT
- NFT generation and ownership
- Basic marketplace operations
- Price suggestion system