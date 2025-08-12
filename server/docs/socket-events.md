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

#### `notification`
Emitted to a specific user for personal notifications.
```typescript
interface NotificationEvent {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  timestamp: string; // ISO string provided by server
}
```

Notes:
- Delivered to the user-specific room. The room name is the authenticated user's `userId`.
- Example client listener:
```javascript
socket.on('notification', (data) => {
  // e.g., show toast or badge update
  showToast(data);
});
```

#### `globalNotification`
Emitted to all connected users for system-wide announcements.
```typescript
interface GlobalNotificationEvent {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  timestamp: string;
}
```

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

### Rooms
- `marketplace`: price ticks, listing events
- `<userId>`: user-targeted `notification` events

Client example to join a user room (if not automatically joined by the server):
```javascript
// Join your personal room to receive notifications
socket.emit('join', { room: userId });
// Or if the server auto-joins on connect, no action needed here
```

## Error Handling
Socket connection errors are handled automatically with reconnection attempts. Clients should implement error handling:

```javascript
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});
socket.on('disconnect', (reason) => {
  console.warn('Socket disconnected:', reason);
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

## REST: Notification Preferences
Manage per-user notification delivery via REST APIs.

Base path: `/api/notifications`

- GET `/preferences`
  - Returns current user's preferences (auto-creates defaults if missing)
  - Response example:
  ```json
  {
    "userId": "60f7c2b8e1d2c8a1b8e1d2c8",
    "enabled": true,
    "types": {
      "marketUpdate": true,
      "listingCreated": true,
      "listingSold": true,
      "system": true
    }
  }
  ```

- PUT `/preferences`
  - Body (partial allowed):
  ```json
  {
    "enabled": false,
    "types": { "marketUpdate": false }
  }
  ```
  - Response mirrors merged result with defaults.

- DELETE `/preferences`
  - Resets to defaults (subsequent GET recreates default doc)

All endpoints require `Authorization: Bearer <jwt>`.

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
