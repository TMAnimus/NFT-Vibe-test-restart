# Milestone 5: Real-time Multiplayer Features

**Status**: In Progress — core real-time features implemented; all unit and integration tests passing; notification preferences implemented, notification history not started

This milestone adds real-time updates to the NFT marketplace using Socket.IO, ensuring that all players see new listings and sales instantly when they happen. Real-time updates are synchronized with the tick-based simulation system.

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
- [x] Integrate Socket.IO for real-time communication between server and clients
- [x] Broadcast new listings and completed sales to all connected clients instantly
- [x] Ensure the marketplace UI updates in real-time for all players
- [x] Synchronize real-time updates with the tick-based simulation system

### Backend Features
- [x] Install and configure Socket.IO server in Express app
- [x] Create Socket.IO event handlers for marketplace events
- [x] Emit `listingCreated` event when new NFTs are listed
- [x] Emit `listingSold` event when purchases are completed
- [x] Emit `marketUpdate` event for tick-based market changes
- [x] Implement user authentication for Socket.IO connections
- [x] Add room management for different marketplace channels

### Frontend Features
- [x] Install Socket.IO client library
- [x] Connect client to Socket.IO server
- [x] Listen for real-time marketplace events
- [x] Update marketplace UI instantly when events are received
- [x] Handle connection/disconnection gracefully
- [x] Add visual indicators for real-time updates (pop-up notifications)

### Testing
- [x] Unit tests for Socket.IO event emission (backend)
- [x] Unit tests for TickService (emit on tick, error handling, intervals)
- [x] Integration tests for real-time marketplace updates (auth, tick event)
- [ ] End-to-end tests for UI updates (not present)
- [ ] Test race conditions and data consistency (not present)
- [x] Test connection handling and error scenarios (invalid server, reconnection, network interruptions)

## Milestone 5B: Real-time Notifications

### Goals
- [x] Implement a notification system to alert users of marketplace events (pop-up notifications)
- [x] Provide real-time notifications for listings, sales, and market events
- [x] Add optional notification preferences for users

### Backend Features
- [x] Create notification service for marketplace events (emit personal/global notifications)
- [x] Implement user notification preferences
- [x] Emit notification events through Socket.IO
- [ ] Add notification storage in database (not started)
- [ ] Create notification management endpoints (not started)

### Frontend Features
- [x] Add notification UI component (pop-up notifications)
- [ ] Implement notification preferences settings (UI)
- [ ] Show real-time notification badges (not started)
- [ ] Add notification history view (not started)
- [x] Implement notification dismissal functionality (auto-dismiss after 5s)

### Testing
- [x] Unit tests for notification service (emission + logging)
- [ ] Integration tests for notification delivery (not present)
- [ ] End-to-end tests for notification UI (not present)
- [x] Test notification preferences routes (GET/PUT/DELETE + auth)

## Implementation Details

### Socket.IO Integration
- **Server Setup**: Add Socket.IO to Express server with authentication
- **Client Setup**: Connect marketplace.js to Socket.IO server
- **Event Types**: `listingCreated`, `listingSold`, `marketUpdate`, `notification`, `globalNotification`
- **Authentication**: Use JWT tokens for Socket.IO authentication
- **Rooms**: Organize connections by marketplace channels

### Real-time Updates
- **Instant Updates**: UI updates immediately when events are received
- **Tick Synchronization**: Market updates tied to simulation ticks
- **Error Handling**: Graceful fallback to polling if real-time fails
- **Performance**: Optimize for multiple concurrent users

### Notification System
- **Event Types**: New listings, sales, price changes, market events
- **User Preferences**: Implemented (REST endpoints, defaults, validation)
- **Delivery Methods**: In-app notifications (pop-up), no email/webhook yet
- **History**: Not yet implemented

## Testing Status

### Unit Tests ✅
- **All tests passing**: 120+/120+
- **Complete coverage**: All services, routes, models, and utilities
- **Advanced mocking**: Custom mocks for MongoDB, Socket.IO, and external services
- **Error scenarios**: Comprehensive error handling and edge case testing

### Integration Tests ✅
- **Real-time integration**: Socket.IO connections with authentication
- **Database integration**: MongoDB operations with transaction support
- **Tick system integration**: Market simulation with real-time updates

### Missing Tests ❌
- **End-to-end tests**: UI interaction tests not implemented
- **Race condition tests**: Concurrent operation testing

## Documentation
- [x] Update API documentation to include Socket.IO events
- [x] Document notification system and preferences (see `server/docs/socket-events.md`)
- [x] Add client integration examples (`notification`, `globalNotification`)
- [x] Document environment variables for Socket.IO configuration

## Notification Preferences (Backend)

- Model: `server/src/models/NotificationPreference.ts`
  - `userId` (unique), `enabled` (default true)
  - `types`: `marketUpdate`, `listingCreated`, `listingSold`, `system` (all default true)

- Service: `server/src/services/notificationPreferenceService.ts`
  - `getOrCreateDefault(userId)`, `updatePreferences(userId, payload)`, `resetPreferences(userId)`

- Routes: `server/src/routes/notifications.ts` (mounted at `/api/notifications`)
  - GET `/preferences`: returns current user's prefs (creates defaults if missing)
  - PUT `/preferences`: update any subset of fields; validated via `express-validator`
  - DELETE `/preferences`: reset to defaults
  - All endpoints require `Authorization: Bearer <jwt>`

See `server/docs/socket-events.md` for Socket.IO `notification` and `globalNotification` event schemas and client examples.

---
See [README.Milestone4.md](README.Milestone4.md) for completed marketplace features and [README.v2.md](README.v2.md) for project overview.
