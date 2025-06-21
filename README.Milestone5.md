# Milestone 5: Real-time Multiplayer Features

This milestone adds real-time updates to the NFT marketplace using Socket.IO, ensuring that all players see new listings and sales instantly. It also covers optional real-time notifications and chat features. All new features must be fully tested.

## Goals
- Integrate Socket.IO for real-time communication. **(Done)**
- Broadcast new listings and completed sales to all connected clients. **(Done)**
- Ensure the marketplace UI updates instantly for all players. **(Done)**
- (Optional) Add real-time notifications or chat features. *(Basic notifications done)*
- Add comprehensive tests for real-time features. **(Done)**

## Steps & Status

### 1. Socket.IO Integration
- [ ] Install Socket.IO on both server and client.
- [ ] Set up a Socket.IO server in your Express app (`server/app.js` or `server/index.js`).
- [ ] Connect the client to the Socket.IO server (see `client/js/marketplace.js`).

### 2. Real-time Marketplace Updates
- [ ] Emit a `listingCreated` event from the server when a new NFT is listed.
- [ ] Emit a `listingSold`/`listingPurchased` event when a purchase is completed.
- [ ] On the client, listen for these events and update the marketplace UI accordingly.
- [ ] Ensure that all connected clients receive updates instantly.

### 3. (Optional) Real-time Notifications/Chat
- [ ] Implement a notification system to alert users of new listings, sales, or other market events. *(Basic notifications implemented in client)*
- [ ] Optionally, add a simple chat feature for players. *(Not implemented)*

### 4. Testing
- [ ] Write Jest tests for new backend logic (e.g., event emission on listing creation/sale).
- [ ] Use Socket.IO's testing utilities or mocks to verify that events are emitted and received as expected.
- [ ] Add end-to-end tests to ensure the UI updates in real-time when listings are created or sold.
- [ ] Test for race conditions and ensure data consistency across clients (see `purchaseConcurrency.test.js`).

### 5. Documentation
- [ ] Update API and developer documentation to describe new real-time events and client integration steps. *(See below)*
- [ ] Document any new environment variables or configuration options for Socket.IO.

---
See the main [README.md](README.md) for project context and previous milestones.
