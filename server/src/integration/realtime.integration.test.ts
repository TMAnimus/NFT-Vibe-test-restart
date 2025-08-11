import http from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket } from 'socket.io-client';
import { Server as SocketIOServer } from 'socket.io';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import { tickService } from '../services/tickService';
import { connectTestDB, clearTestDB, closeTestDB } from '../test/db';

describe('Realtime Integration (HTTP + Socket.IO)', () => {
  let server: http.Server;
  let ioServer: SocketIOServer;
  let baseUrl: string;
  let socket: Socket | null = null;

  beforeAll(async () => {
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

    // Socket.IO event handlers (no auth for now)
    ioServer.on('connection', (socket) => {
      console.log(`User connected`);
      socket.join('marketplace');
      
      socket.on('joinMarketplace', () => {
        socket.join('marketplace');
        console.log(`User joined marketplace`);
      });
    });

    // Set global io instance for socket service
    (global as any).io = ioServer;

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    try {
      tickService.stopTickSystem();
    } catch {}
    if (socket) {
      socket.disconnect();
      socket.close();
      socket = null;
    }
    ioServer.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await closeTestDB();
  });

  function connectSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      socket = Client(baseUrl, {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
      });
      let resolved = false;
      socket.on('connect', () => {
        resolved = true;
        resolve();
      });
      socket.on('connect_error', (err: unknown) => {
        if (!resolved) reject(err);
      });
    });
  }

  it('should connect to Socket.IO server', async () => {
    await connectSocket();
    expect(socket!.connected).toBe(true);
  });

  it('should receive marketUpdate on tick', async () => {
    await connectSocket();

    const updates: any[] = [];
    socket!.on('marketUpdate', (data: unknown) => updates.push(data));

    // Start a fast tick and wait for an update
    tickService.startTickSystem(200);
    await new Promise((r) => setTimeout(r, 500));
    tickService.stopTickSystem();

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0]).toHaveProperty('type', 'tick');
  });

  it('should receive marketUpdate on tick', async () => {
    if (!socket || !socket.connected) {
      await connectSocket();
    }

    const updates: any[] = [];
    socket!.on('marketUpdate', (data: unknown) => updates.push(data));

    // Start a fast tick and wait for an update
    tickService.startTickSystem(200);
    await new Promise((r) => setTimeout(r, 500));
    tickService.stopTickSystem();

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0]).toHaveProperty('type', 'tick');
  });
});


