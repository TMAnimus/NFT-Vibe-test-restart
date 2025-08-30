import { Server as SocketIOServer } from 'socket.io';

// Get the global io instance
const getIO = (): SocketIOServer => {
  return (global as any).io;
};

// Emit marketplace events to all connected clients
export const emitMarketplaceEvent = (event: string, data: any) => {
  const io = getIO();
  if (io) {
    io.to('marketplace').emit(event, data);
    console.log(`Emitted ${event} event to marketplace`);
  }
};

// Emit listing created event
export const emitListingCreated = (nft: any) => {
  emitMarketplaceEvent('listingCreated', {
    nft,
    timestamp: new Date().toISOString()
  });
};

// Emit listing sold event
export const emitListingSold = (nft: any, buyer: string) => {
  emitMarketplaceEvent('listingSold', {
    nft,
    buyer,
    timestamp: new Date().toISOString()
  });
};

// Emit market update event (for tick-based updates)
export const emitMarketUpdate = (update: any) => {
  emitMarketplaceEvent('marketUpdate', {
    ...update,
    timestamp: new Date().toISOString()
  });
};

// Emit notification to specific user
export const emitNotification = (userId: string, notification: any) => {
  const io = getIO();
  if (io) {
    io.to(userId).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log(`Emitted notification to user ${userId}`);
  }
};

// Emit notification to all users
export const emitGlobalNotification = (notification: any) => {
  const io = getIO();
  if (io) {
    io.emit('globalNotification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
    console.log('Emitted global notification');
  }
}; 

// Emit auction events to all connected clients
export const emitAuctionEvent = (event: string, data: any) => {
  const io = getIO();
  if (io) {
    io.to('auctions').emit(event, data);
    console.log(`Emitted ${event} event to auctions`);
  }
};

// Emit auction created event
export const emitAuctionCreated = (auction: any) => {
  emitAuctionEvent('auctionCreated', {
    auction,
    timestamp: new Date().toISOString()
  });
};

// Emit bid placed event
export const emitBidPlaced = (auction: any, bid: any) => {
  emitAuctionEvent('bidPlaced', {
    auction: {
      id: auction.id,
      currentBid: auction.currentBid,
      winnerId: auction.winnerId
    },
    bid: {
      id: bid.id,
      bidderId: bid.bidderId,
      bidAmount: bid.bidAmount,
      bidTime: bid.bidTime
    },
    timestamp: new Date().toISOString()
  });
};

// Emit auction ended event
export const emitAuctionEnded = (auction: any, winnerUsername?: string) => {
  emitAuctionEvent('auctionEnded', {
    auction: {
      id: auction.id,
      nftId: auction.nftId,
      winnerId: auction.winnerId,
      winningBid: auction.winningBid,
      winnerUsername
    },
    timestamp: new Date().toISOString()
  });
};

// Emit auction updated event (for Dutch auction price changes, etc.)
export const emitAuctionUpdated = (auction: any) => {
  emitAuctionEvent('auctionUpdated', {
    auction: {
      id: auction.id,
      currentBid: auction.currentBid,
      dutchCurrentPrice: auction.dutchCurrentPrice,
      status: auction.auctionStatus
    },
    timestamp: new Date().toISOString()
  });
};

// Emit auction cancelled event
export const emitAuctionCancelled = (auction: any) => {
  emitAuctionEvent('auctionCancelled', {
    auction: {
      id: auction.id,
      nftId: auction.nftId,
      reason: 'cancelled_by_seller'
    },
    timestamp: new Date().toISOString()
  });
};

// Emit active auctions list (for periodic updates)
export const emitActiveAuctionsUpdate = (auctions: any[]) => {
  emitAuctionEvent('activeAuctionsUpdate', {
    auctions: auctions.map(auction => ({
      id: auction.id,
      nftId: auction.nftId,
      currentBid: auction.currentBid,
      endTime: auction.endTime,
      auctionType: auction.auctionType,
      dutchCurrentPrice: auction.dutchCurrentPrice
    })),
    timestamp: new Date().toISOString()
  });
};