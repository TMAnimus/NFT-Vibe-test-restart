# Socket.IO Events Documentation

## Overview
This document describes the real-time events used in the NFT Trading Game for instant marketplace updates and notifications.

## Connection Setup
```javascript
// Client-side connection
const socket = io({
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Events

### Server to Client Events

#### `listingCreated`
Emitted when a new NFT is listed in the marketplace.
```typescript
interface ListingCreatedEvent {
  nft: {
    _id: string;
    displayName: string;
    colorRarity: string;
    propRarity: string;
    price: number;
    seller: string;
  };
  timestamp: string;
}
```

#### `listingSold`
Emitted when an NFT is purchased.
```typescript
interface ListingSoldEvent {
  nft: {
    _id: string;
    displayName: string;
  };
  buyer: string;
  timestamp: string;
}
```

#### `marketUpdate`
Emitted on each tick when market prices are updated.
```typescript
interface MarketUpdateEvent {
  updates: Array<{
    nftId: string;
    oldPrice: number;
    newPrice: number;
    reason?: string;
  }>;
  timestamp: string;
}
```

### Client to Server Events

#### `joinMarketplace`
Sent by client to join the marketplace room for updates.
```typescript
// No payload required
socket.emit('joinMarketplace');
```

## Error Handling
Socket connection errors are handled automatically with reconnection attempts. Clients should implement error handling:

```javascript
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});
```

## Environment Variables
The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| `SOCKET_PING_TIMEOUT` | Socket ping timeout in ms | 5000 |
| `SOCKET_PING_INTERVAL` | Socket ping interval in ms | 10000 |
| `DAILY_TICK_INTERVAL` | Interval for daily market updates | 86400000 |
| `WEEKLY_TICK_INTERVAL` | Interval for weekly market updates | 604800000 |

## Client Integration Example

```javascript
// Initialize Socket.IO connection
const socket = io({
  auth: { token: localStorage.getItem('jwt') }
});

// Listen for new listings
socket.on('listingCreated', (data) => {
  // Update UI with new listing
  updateMarketplaceUI(data.nft);
});

// Listen for sales
socket.on('listingSold', (data) => {
  // Remove sold NFT from marketplace
  removeFromMarketplace(data.nft._id);
});

// Listen for market updates
socket.on('marketUpdate', (data) => {
  // Update prices in UI
  updatePrices(data.updates);
});
```
