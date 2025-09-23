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
 *               description: The NFT's color rarity level
 *             propRarity:
 *               type: string
 *               description: The NFT's prop rarity level
 *             currentPrice:
 *               type: number
 *               description: The listing price
 *             ownerId:
 *               type: string
 *               description: The ID of the user selling the NFT
 *             marketStatus:
 *               type: string
 *               description: The market status of the NFT (e.g., 'Listed')
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
 *         Example connection:
 *         ```javascript
 *         const socket = io({
 *           auth: { token: 'your-jwt-token' }
 *         });
 *         ```
 *       tags:
 *         - Real-time Events
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         101:
 *           description: WebSocket connection upgrade
 */
