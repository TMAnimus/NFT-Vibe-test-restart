# Frontend Overview

## Tech Stack
- **Current:** React, TypeScript, and CSS.
- **Real-time:** Socket.IO for live marketplace updates and notifications.

## Key Features ✅ IMPLEMENTED
- **Real-time Marketplace:** The UI updates in real-time to show new NFT listings, sales, and price changes without needing to refresh the page. This is powered by Socket.IO events from the backend.
- **Auction System:** ✅ **NEW** - Interactive auction interface with live bidding, countdown timers, and real-time updates
- **Seller Choice Interface:** ✅ **NEW** - Unified listing creation allowing sellers to choose between fixed-price sales and auctions
- **Text-Based NFTs:** In the current version, NFTs are represented as text descriptions. There are no images associated with NFTs. For example, an NFT might be "A sentient JPEG of a toaster."
- **Real-time Notifications:** Users receive real-time pop-up notifications for marketplace events, auction updates, and bidding activity

## Connection to Backend
The frontend communicates with the backend primarily through a Socket.IO connection. This allows for the real-time features that are central to the gameplay experience. User authentication is handled via JWTs, which are used to secure the Socket.IO connection.


## Auction System Implementation ✅ COMPLETE

The auction system frontend has been **fully implemented** with comprehensive UI components and real-time functionality.

### ✅ Implemented UI Components

- **AuctionCard.tsx:** ✅ Interactive auction display component featuring:
  - Live countdown timers with real-time updates
  - Current bid display with winner information
  - Auction type indicators (🔨 Standard, ⚡ Dutch, 💎 Reserve)
  - Interactive bidding interface with minimum bid validation
  - Real-time bid updates via Socket.IO

- **CreateListing.tsx:** ✅ Unified listing creation interface allowing:
  - Choice between fixed-price sales and auctions
  - Auction type selection (Standard, Dutch, Reserve)
  - Configurable auction duration with visual slider
  - Reserve price setting for reserve auctions
  - Helpful descriptions for each auction type

- **Enhanced Marketplace.tsx:** ✅ Updated marketplace with:
  - Tabbed interface showing fixed-price listings and auctions separately
  - Real-time updates for both listing types
  - Integrated "Create Listing" button
  - Live auction and fixed-price data fetching

- **NotificationToast.tsx:** ✅ Real-time notification system with:
  - Auction-specific notifications (outbid, won, ended)
  - Auto-dismissing toast notifications
  - Different notification types (success, warning, info, error)
  - Clean animation and styling

### ✅ Real-time Features Implemented

- **Live Bidding:** ✅ UI updates instantly as new bids are placed via Socket.IO events
- **Auction Status Updates:** ✅ Real-time auction status changes (active → ended) without page reload
- **Price Updates:** ✅ Dutch auction price decreases shown in real-time
- **Countdown Timers:** ✅ Live countdown timers updating every second
- **Instant Notifications:** ✅ Real-time notifications for:
  - Being outbid in an auction
  - Winning an auction
  - Auction ending notifications
  - New bid alerts for sellers

### ✅ Socket.IO Integration

- **Auction Events:** `auctionCreated`, `bidPlaced`, `auctionEnded`, `auctionUpdated`
- **Notification Events:** `notification`, `globalNotification`
- **Room Management:** Automatic joining of marketplace and auction rooms
- **Authentication:** JWT-based Socket.IO authentication
- **Error Handling:** Graceful connection error handling and reconnection