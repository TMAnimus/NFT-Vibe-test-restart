# Milestone 5: Real-time Multiplayer Features

**Status**: Not Started - Ready to begin after Milestone 4 completion

This milestone adds real-time updates to the NFT marketplace using Socket.IO, ensuring that all players see new listings and sales instantly when they happen. Real-time updates will be synchronized with the tick-based simulation system.

## Tick System Implementation Details

### Architecture
- **Location**: `server/src/services/tickService.ts`
- **Integration**: Started from `server/src/index.ts` after database and app initialization
- **Responsibilities**: Manage game loop, trigger market updates, emit real-time events

### Tick Service Structure
```typescript
// server/src/services/tickService.ts
export class TickService {
  private tickInterval: NodeJS.Timeout | null = null;
  private lastTickTime: Date = new Date();
  
  startTickSystem(intervalMs: number = 10000): void {
    // Start tick loop with configurable interval (default 10 seconds for dev)
    // Emit marketUpdate events via socketService
    // Trigger game logic: price updates, NPC actions, events
  }
  
  stopTickSystem(): void {
    // Clean shutdown of tick system
  }
  
  private processTick(): void {
    // Core tick logic: market updates, events, real-time emissions
  }
}
```

### Integration Points
- **Server Startup**: `startTickSystem()` called after DB connection and app setup
- **Socket.IO**: Emit `marketUpdate` events on each tick via `socketService`
- **Market Logic**: Trigger price updates, NPC actions, market events
- **Configuration**: Tick interval configurable via environment variables

### Real-time Event Flow
1. Tick occurs → `tickService.processTick()`
2. Market updates calculated → `marketplaceService.updatePrices()`
3. Real-time event emitted → `socketService.emitMarketUpdate()`
4. All connected clients receive update → UI refreshes automatically

## Milestone 5A: Real-time Marketplace Updates

### Goals
- Integrate Socket.IO for real-time communication between server and clients
- Broadcast new listings and completed sales to all connected clients instantly
- Ensure the marketplace UI updates in real-time for all players
- Synchronize real-time updates with the tick-based simulation system

### Backend Features
- [ ] Install and configure Socket.IO server in Express app
- [ ] Create Socket.IO event handlers for marketplace events
- [ ] Emit `listingCreated` event when new NFTs are listed
- [ ] Emit `listingSold` event when purchases are completed
- [ ] Emit `marketUpdate` event for tick-based market changes
- [ ] Implement user authentication for Socket.IO connections
- [ ] Add room management for different marketplace channels

### Frontend Features
- [ ] Install Socket.IO client library
- [ ] Connect client to Socket.IO server
- [ ] Listen for real-time marketplace events
- [ ] Update marketplace UI instantly when events are received
- [ ] Handle connection/disconnection gracefully
- [ ] Add visual indicators for real-time updates

### Testing
- [ ] Unit tests for Socket.IO event emission
- [ ] Integration tests for real-time marketplace updates
- [ ] End-to-end tests for UI updates
- [ ] Test race conditions and data consistency
- [ ] Test connection handling and error scenarios

## Milestone 5B: Real-time Notifications

### Goals
- Implement a notification system to alert users of marketplace events
- Provide real-time notifications for listings, sales, and market events
- Add optional notification preferences for users

### Backend Features
- [ ] Create notification service for marketplace events
- [ ] Implement user notification preferences
- [ ] Emit notification events through Socket.IO
- [ ] Add notification storage in database
- [ ] Create notification management endpoints

### Frontend Features
- [ ] Add notification UI component
- [ ] Implement notification preferences settings
- [ ] Show real-time notification badges
- [ ] Add notification history view
- [ ] Implement notification dismissal functionality

### Testing
- [ ] Unit tests for notification service
- [ ] Integration tests for notification delivery
- [ ] End-to-end tests for notification UI
- [ ] Test notification preferences and settings

## Implementation Details

### Socket.IO Integration
- **Server Setup**: Add Socket.IO to Express server with authentication
- **Client Setup**: Connect marketplace.js to Socket.IO server
- **Event Types**: `listingCreated`, `listingSold`, `marketUpdate`, `notification`
- **Authentication**: Use JWT tokens for Socket.IO authentication
- **Rooms**: Organize connections by marketplace channels

### Real-time Updates
- **Instant Updates**: UI updates immediately when events are received
- **Tick Synchronization**: Market updates tied to simulation ticks
- **Error Handling**: Graceful fallback to polling if real-time fails
- **Performance**: Optimize for multiple concurrent users

### Notification System
- **Event Types**: New listings, sales, price changes, market events
- **User Preferences**: Configurable notification settings
- **Delivery Methods**: In-app notifications, optional email/webhook
- **History**: Store and display notification history

## Documentation
- [ ] Update API documentation to include Socket.IO events
- [ ] Document notification system and preferences
- [ ] Add client integration examples
- [ ] Document environment variables for Socket.IO configuration

---
See [README.Milestone4.md](README.Milestone4.md) for completed marketplace features and [README.v2.md](README.v2.md) for project overview.
