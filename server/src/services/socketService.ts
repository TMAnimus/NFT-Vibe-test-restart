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