# Frontend Overview

## Tech Stack
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS v3 with custom component classes
- **Real-time:** Socket.IO client for live marketplace and auction updates
- **Build:** Vite with optimised production bundles
- **Testing:** Jest + React Testing Library

## Project Structure

```
client/src/
├── types/
│   └── index.ts          # Shared types mirroring server-side enums
├── components/
│   ├── Marketplace.tsx   # Main marketplace view (fixed-price + auctions)
│   ├── AuctionCard.tsx   # Individual auction card with live countdown
│   ├── CreateListing.tsx # Unified fixed-price / auction listing form
│   ├── MyAuctions.tsx    # User's auctions and bids activity modal
│   ├── GenerateNFT.tsx   # NFT generation modal
│   ├── NotificationToast.tsx  # Toast notification system
│   ├── Login.tsx
│   └── Register.tsx
├── services/
│   └── api.ts            # All REST API calls
└── App.tsx               # Router + global Socket.IO notification listener
```

## Shared Types (`client/src/types/index.ts`)

All component interfaces are defined once in `types/index.ts` and imported where needed — no more duplicated local interfaces. These mirror the server-side enums exactly.

```typescript
export type MarketStatus = 'Owned' | 'Listed' | 'Auction' | 'Sold';
export type AuctionType  = 'standard' | 'dutch' | 'reserve';
export type AuctionStatus = 'active' | 'ended' | 'cancelled';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'veryRare' | 'notPresent';

export interface NFT { ... }
export interface Auction { ... }
```

### NFT Market Status

| Status | Meaning | Can be listed? |
|--------|---------|----------------|
| `Owned` | Owned, not on market | ✅ Yes |
| `Listed` | Fixed-price sale active | ❌ No |
| `Auction` | Currently being auctioned | ❌ No |
| `Sold` | Legacy/reserved | ❌ No |

`CreateListing` filters `userNFTs` to only show `Owned` NFTs. The empty-state message explains why `Listed` and `Auction` NFTs are excluded.

`Marketplace` renders a coloured status badge on each NFT card using a `MARKET_STATUS_BADGE` map:

```typescript
const MARKET_STATUS_BADGE: Record<string, string> = {
    Owned:   'bg-gray-400',
    Listed:  'bg-blue-500',
    Auction: 'bg-purple-600',
    Sold:    'bg-green-600',
};
```

---

## Components

### `Marketplace.tsx`
Main view. Fetches listed NFTs, active auctions, user NFTs, and user profile on mount. Sets up Socket.IO listeners for all real-time events. Renders tabbed navigation between fixed-price listings and auctions.

**Socket.IO events handled:**
- `listingCreated` — prepends new NFT to fixed-price list
- `listingSold` — removes sold NFT from list
- `auctionCreated` — prepends new auction
- `bidPlaced` / `auctionUpdated` — updates auction in place
- `auctionEnded` — removes ended auction

### `AuctionCard.tsx`
Displays a single auction with:
- Live countdown timer (updates every second via `setInterval`)
- Current price display (uses `dutchCurrentPrice` for Dutch auctions)
- Auction type badge (🔨 / ⚡ / 💎)
- Inline bid form with minimum bid validation
- Seller badge when viewing your own auction

### `CreateListing.tsx`
Unified form for creating either a fixed-price listing or an auction. Only shows NFTs with `marketStatus === 'Owned'`. Auction section includes type selector, duration slider, and optional reserve price field.

### `MyAuctions.tsx`
Modal with two tabs:
- **My Auctions** — auctions the user created as seller
- **My Bids** — auctions the user has bid on, with Won/Lost/Active status

### `GenerateNFT.tsx`
Modal for generating a new NFT. Dropdown lists all 15 available collections.

### `NotificationToast.tsx`
Fixed-position toast stack (top-right). Notifications auto-dismiss after a configurable duration. Uses a custom `slideIn` CSS animation.

### `App.tsx`
Handles routing (Login / Register / Marketplace) and a global Socket.IO connection for personal `notification` and `globalNotification` events, which feed into the `NotificationToast`.

---

## Styling

All components use **Tailwind CSS v3** utility classes. Custom component classes are defined in `client/src/index.css`:

```css
.btn-primary   { ... }
.btn-success   { ... }
.btn-secondary { ... }
.btn-info      { ... }
.card-auction  { ... }
.input-field   { ... }
.select-field  { ... }
.modal-overlay { ... }
.modal-content { ... }
.rarity-common / uncommon / rare / very-rare  { ... }
```

Rarity colours for dynamic inline styles (where Tailwind can't be used with runtime values):

```typescript
const RARITY_COLORS: Record<string, string> = {
    common:     '#6c757d',
    uncommon:   '#28a745',
    rare:       '#007bff',
    veryRare:   '#6f42c1',
    notPresent: '#6c757d',
};
```

---

## API Service (`client/src/services/api.ts`)

All backend calls go through `api.ts`. Auth token is read from `localStorage` and attached as a `Bearer` header automatically via `getAuthHeaders()`.

| Function | Method | Endpoint |
|----------|--------|----------|
| `registerPlayer` | POST | `/auth/register` |
| `loginPlayer` | POST | `/auth/login` |
| `getUserProfile` | GET | `/user/profile` |
| `getUserNFTs` | GET | `/nft/my-nfts` |
| `generateNFT` | POST | `/nft/generate` |
| `getListedNFTs` | GET | `/marketplace/listed` |
| `createFixedPriceListing` | POST | `/marketplace/list` |
| `buyNFT` | POST | `/marketplace/buy/:id` |
| `getActiveAuctions` | GET | `/auctions/active` |
| `createAuction` | POST | `/auctions/create` |
| `placeBid` | POST | `/auctions/:id/bid` |
| `cancelAuction` | POST | `/auctions/:id/cancel` |
| `getMyAuctions` | GET | `/auctions/my-auctions` |
| `getMyBids` | GET | `/auctions/my-bids` |
| `getAuctionDetails` | GET | `/auctions/:id` |

---

## Real-time Integration

Two separate Socket.IO connections are used:

1. **`App.tsx`** — global connection for personal notifications (`notification`, `globalNotification`)
2. **`Marketplace.tsx`** — marketplace connection for live listing and auction updates

Both authenticate with the JWT token stored in `localStorage`.

---

## Running the Frontend

```bash
cd client
npm install
npm run dev      # Development server at http://localhost:5173
npm run build    # Production build
npm test         # Run Jest tests
```
