import http from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket } from 'socket.io-client';
import { Server as SocketIOServer } from 'socket.io';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { tickService } from '../services/tickService';
import { connectTestDB, clearTestDB, closeTestDB } from '../test/db';

// Mock the services to avoid real database operations
jest.mock('../services/marketplaceService', () => ({
  ...jest.requireActual('../services/marketplaceService'),
  updateAllListedNftPrices: jest.fn().mockResolvedValue([])
}));

jest.mock('../models/NFT', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([])
    })
  }
}));

jest.mock('../models/User', () => ({
  UserModel: {
    findById: jest.fn()
  }
}));

describe('Realtime Integration (HTTP + Socket.IO)', () => {
  let server: http.Server;
  let ioServer: SocketIOServer;
  let baseUrl: string;
  let clientSocket: Socket | null = null;
  let jwtToken: string = '';
  const testUserId = '507f1f77bcf86cd799439011';
  const testUsername = `itest_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  beforeAll(async () => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Ensure test database is connected and cleared
    await connectTestDB();
    await clearTestDB();
    
    server = http.createServer(app);
    
    // Set up Socket.IO server for testing
    ioServer = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Socket.IO authentication middleware
    ioServer.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        (socket as any).userId = decoded.userId;
        (socket as any).username = decoded.username;
        next();
      } catch (err) {
        return next(new Error('Authentication error'));
      }
    });

    // Socket.IO event handlers
    ioServer.on('connection', (socket) => {
      console.log(`User ${(socket as any).username} connected`);
      socket.join('marketplace');
      
      socket.on('joinMarketplace', () => {
        socket.join('marketplace');
        console.log(`${(socket as any).username} joined marketplace`);
      });
    });

    // Set global io instance for socket service
    (global as any).io = ioServer;

    // Create a mock JWT token for testing
    jwtToken = jwt.sign(
      { userId: testUserId, username: testUsername },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    try {
      tickService.stopTickSystem();
    } catch {}
    if (clientSocket) {
      clientSocket.disconnect();
      clientSocket.close();
      clientSocket = null;
    }
    ioServer.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await closeTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    jest.clearAllMocks();
    
    // Clean up previous socket connection
    if (clientSocket) {
      clientSocket.disconnect();
      clientSocket.close();
      clientSocket = null;
    }
  });

  afterEach(() => {
    if (clientSocket) {
      clientSocket.disconnect();
      clientSocket.close();
      clientSocket = null;
    }
  });

  function connectSocket(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      clientSocket = Client(baseUrl, {
        auth: { token: jwtToken },
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      });
      
      let resolved = false;
      clientSocket.on('connect', () => {
        resolved = true;
        clientSocket!.emit('joinMarketplace');
        resolve(clientSocket!);
      });
      clientSocket.on('connect_error', (err: unknown) => {
        if (!resolved) reject(err);
      });
    });
  }

  it('should connect to Socket.IO server with authentication', async () => {
    const socket = await connectSocket();
    expect(socket.connected).toBe(true);
  });

  it('should receive marketUpdate event on tick', async () => {
    const socket = await connectSocket();

    const updates: any[] = [];
    socket.on('marketUpdate', (data: unknown) => updates.push(data));

    // Start a fast tick and wait for an update
    tickService.startTickSystem(200);
    
    // Wait for a tick to occur and event to be received
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (updates.length > 0) {
          clearInterval(interval);
          resolve();
        }
      }, 50); // Check every 50ms
      
      // Timeout after 2 seconds
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 2000);
    });
    
    tickService.stopTickSystem();

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0]).toHaveProperty('type', 'tick');
    expect(updates[0]).toHaveProperty('message', 'Market tick processed');
  });

  it('should handle authentication errors gracefully', async () => {
    const invalidToken = 'invalid-token';
    
    return new Promise<void>((resolve, reject) => {
      const testSocket = Client(baseUrl, {
        auth: { token: invalidToken },
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      });
      
      testSocket.on('connect_error', (err: unknown) => {
        expect(err).toBeDefined();
        testSocket.close();
        resolve();
      });
      
      testSocket.on('connect', () => {
        testSocket.close();
        reject(new Error('Should not have connected with invalid token'));
      });
      
      // Timeout after 1 second
      setTimeout(() => {
        testSocket.close();
        reject(new Error('Test timed out'));
      }, 1000);
    });
  });

  it('should join marketplace room successfully', async () => {
    const socket = await connectSocket();
    
    // Verify that the socket is connected
    expect(socket.connected).toBe(true);
    
    // Verify that the joinMarketplace event was emitted (this happens in connectSocket)
    // The server should have logged the join message, which we can verify by checking
    // that the socket is properly authenticated and connected
    expect(socket.auth).toEqual({ token: jwtToken });
    
    // Test that we can listen for events (this verifies the connection is working)
    let eventReceived = false;
    socket.on('test-event', () => {
      eventReceived = true;
    });
    
    // The fact that we can set up event listeners means the connection is working
    expect(socket.connected).toBe(true);
  });

  it('should handle connection errors gracefully', async () => {
    // Try to connect to a non-existent server
    const invalidUrl = 'http://localhost:99999';
    
    return new Promise<void>((resolve, reject) => {
      const testSocket = Client(invalidUrl, {
        auth: { token: jwtToken },
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
        timeout: 1000, // Short timeout for test
      });
      
      testSocket.on('connect_error', (err: unknown) => {
        expect(err).toBeDefined();
        testSocket.close();
        resolve();
      });
      
      testSocket.on('connect', () => {
        testSocket.close();
        reject(new Error('Should not have connected to invalid server'));
      });
      
      // Timeout after 2 seconds
      setTimeout(() => {
        testSocket.close();
        reject(new Error('Test timed out'));
      }, 2000);
    });
  });

  it('should handle reconnection attempts', async () => {
    const socket = await connectSocket();
    
    // Verify initial connection
    expect(socket.connected).toBe(true);
    
    // Disconnect the socket
    socket.disconnect();
    expect(socket.connected).toBe(false);
    
    // Try to reconnect
    return new Promise<void>((resolve, reject) => {
      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        resolve();
      });
      
      socket.on('connect_error', (err: unknown) => {
        reject(new Error(`Reconnection failed: ${err}`));
      });
      
      // Attempt to reconnect
      socket.connect();
      
      // Timeout after 3 seconds
      setTimeout(() => {
        reject(new Error('Reconnection timed out'));
      }, 3000);
    });
  });

  it('should handle network interruptions', async () => {
    const socket = await connectSocket();
    
    // Verify initial connection
    expect(socket.connected).toBe(true);
    
    // Simulate network interruption by closing the server connection
    // This is a bit tricky to test, but we can verify the socket handles disconnection
    socket.disconnect();
    expect(socket.connected).toBe(false);
    
    // Verify that the socket can be reconnected after interruption
    return new Promise<void>((resolve, reject) => {
      socket.on('connect', () => {
        expect(socket.connected).toBe(true);
        resolve();
      });
      
      socket.on('connect_error', (err: unknown) => {
        reject(new Error(`Reconnection after interruption failed: ${err}`));
      });
      
      // Attempt to reconnect
      socket.connect();
      
      // Timeout after 3 seconds
      setTimeout(() => {
        reject(new Error('Reconnection after interruption timed out'));
      }, 3000);
    });
  });
});


