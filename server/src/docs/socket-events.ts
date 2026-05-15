// Real-time event documentation for Swagger UI
/**
 * @openapi
 * components:
 *   schemas:
 *     ListingCreatedEvent:
 *       type: object
 *       properties:
 *         nft:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The NFT's unique identifier
 *             displayName:
 *               type: string
 *               description: The NFT's display name
 *             colorRarity:
 *               type: string
 *               enum: [common, uncommon, rare, veryRare]
 *             propRarity:
 *               type: string
 *               enum: [notPresent, common, uncommon, rare, veryRare]
 *             currentPrice:
 *               type: number
 *               description: The listing price
 *             ownerId:
 *               type: string
 *               description: The ID of the user selling the NFT
 *             marketStatus:
 *               type: string
 *               enum: [Owned, Listed, Auction, Sold]
 *               description: Market status of the NFT — will be `Listed` in this event
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the listing was created
 * 
 *     ListingSoldEvent:
 *       type: object
 *       properties:
 *         nft:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             displayName:
 *               type: string
 *             marketStatus:
 *               type: string
 *               enum: [Owned, Listed, Auction, Sold]
 *               description: Market status of the NFT — will be `Owned` after purchase
 *         buyer:
 *           type: string
 *           description: The buyer's username
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *     MarketUpdateEvent:
 *       type: object
 *       properties:
 *         updates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nftId:
 *                 type: string
 *               oldPrice:
 *                 type: number
 *               newPrice:
 *                 type: number
 *               reason:
 *                 type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *     AuctionCreatedEvent:
 *       type: object
 *       description: Emitted when a new auction is created. The NFT's marketStatus is now `Auction`.
 *       properties:
 *         auction:
 *           $ref: '#/components/schemas/Auction'
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *     BidPlacedEvent:
 *       type: object
 *       description: Emitted when a bid is placed on an auction.
 *       properties:
 *         auction:
 *           $ref: '#/components/schemas/Auction'
 *         bid:
 *           $ref: '#/components/schemas/Bid'
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *     AuctionEndedEvent:
 *       type: object
 *       description: |
 *         Emitted when an auction ends. The NFT's marketStatus reverts to `Owned`
 *         regardless of whether there was a winner.
 *       properties:
 *         auction:
 *           $ref: '#/components/schemas/Auction'
 *         winner:
 *           type: string
 *           description: Winner's username (omitted if no winner)
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 * tags:
 *   - name: Real-time Events
 *     description: Socket.IO events for real-time marketplace updates
 * 
 * paths:
 *   /socket.io:
 *     get:
 *       summary: Socket.IO endpoint
 *       description: |
 *         WebSocket endpoint for real-time updates. Use Socket.IO client to connect.
 *         
 *         **Connection:**
 *         ```javascript
 *         const socket = io({ auth: { token: 'your-jwt-token' } });
 *         ```
 *         
 *         **Server → Client events:**
 *         | Event | Schema | Trigger |
 *         |-------|--------|---------|
 *         | `listingCreated` | `ListingCreatedEvent` | NFT listed for fixed-price sale |
 *         | `listingSold` | `ListingSoldEvent` | Fixed-price NFT purchased |
 *         | `marketUpdate` | `MarketUpdateEvent` | Tick system price update |
 *         | `auctionCreated` | `AuctionCreatedEvent` | New auction started |
 *         | `bidPlaced` | `BidPlacedEvent` | Bid placed on auction |
 *         | `auctionEnded` | `AuctionEndedEvent` | Auction completed or cancelled |
 *         | `auctionUpdated` | `Auction` | Dutch price tick or bid update |
 *         | `notification` | — | Personal notification to user |
 *         | `globalNotification` | — | System-wide announcement |
 *         
 *         **Client → Server events:**
 *         | Event | Payload | Effect |
 *         |-------|---------|--------|
 *         | `joinMarketplace` | — | Join marketplace room |
 *         | `joinAuction` | `{ auctionId }` | Join auction room |
 *         | `leaveAuction` | `{ auctionId }` | Leave auction room |
 *       tags:
 *         - Real-time Events
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         101:
 *           description: WebSocket connection upgrade
 */
