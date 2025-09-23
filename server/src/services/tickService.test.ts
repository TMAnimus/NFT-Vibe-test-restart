jest.mock('../models/NFT', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue([])
    }),
    distinct: jest.fn().mockReturnValue(['collection1', 'collection2']),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn()
  }
}));

// Mock marketplaceService with synchronous return value
jest.mock('./marketplaceService', () => ({
  updateAllListedNftPrices: jest.fn().mockReturnValue([])
}));

// Mock socketService with synchronous return value
jest.mock('./socketService', () => ({
  emitMarketUpdate: jest.fn()
}));

// Mock MongoDB
jest.mock('mongoose');

import { TickService } from './tickService';
import { emitMarketUpdate } from './socketService';
import { updateAllListedNftPrices } from './marketplaceService';

describe('TickService', () => {
  let tickService: TickService;

  beforeEach(() => {
    tickService = new TickService();
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Set up global io for socket service
    (global as any).io = {
      to: jest.fn(() => ({
        emit: jest.fn()
      })),
      emit: jest.fn()
    };
    
    // Ensure the service emits via our mocked function
    tickService.setEmitFunction(emitMarketUpdate);
  });

  afterEach(() => {
    tickService.stopTickSystem();
    jest.useRealTimers();
  });

  describe('startTickSystem', () => {
    it('should start the tick system with default interval', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem();
      
      expect(consoleSpy).toHaveBeenCalledWith('Starting tick system with 10000ms interval');
      expect(tickService.getStatus().isRunning).toBe(true);
    });

    it('should start the tick system with custom interval', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem(5000);
      
      expect(consoleSpy).toHaveBeenCalledWith('Starting tick system with 5000ms interval');
      expect(tickService.getStatus().isRunning).toBe(true);
    });

    it('should not start if already running', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem();
      tickService.startTickSystem(); // Try to start again
      
      expect(consoleSpy).toHaveBeenCalledWith('Tick system is already running');
    });
  });

  describe('stopTickSystem', () => {
    it('should stop the tick system cleanly', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem();
      tickService.stopTickSystem();
      
      expect(consoleSpy).toHaveBeenCalledWith('Stopping tick system');
      expect(tickService.getStatus().isRunning).toBe(false);
    });

    it('should not stop if not running', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.stopTickSystem();
      
      expect(consoleSpy).toHaveBeenCalledWith('Tick system is not running');
    });
  });

  describe('getStatus', () => {
    it('should return correct status when not running', () => {
      const status = tickService.getStatus();
      
      expect(status.isRunning).toBe(false);
      expect(status.lastTickTime).toBeInstanceOf(Date);
      expect(status.interval).toBeNull();
    });

    it('should return correct status when running', () => {
      tickService.startTickSystem();
      const status = tickService.getStatus();
      
      expect(status.isRunning).toBe(true);
      expect(status.lastTickTime).toBeInstanceOf(Date);
      expect(status.interval).toBe(10000);
    });
  });

  describe('market sentiment tracking', () => {
    it('should initialize with neutral market sentiment', () => {
      tickService.startTickSystem();
      
      expect(tickService.getStatus().isRunning).toBe(true);
    });

    it('should evolve market sentiment over multiple ticks', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem(1000);
      
      // Trigger a few ticks manually
      await tickService.triggerTick();
      await tickService.triggerTick();
      await tickService.triggerTick();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing tick')
      );
    });

    it('should handle event generation and lifecycle', async () => {
      // Create a completely fresh service instance for this test
      const freshService = new TickService();
      freshService.setEmitFunction(emitMarketUpdate);
      
      // Mock Math.random to guarantee event generation
      // Use a simple approach: return very small values for the first call
      const mockRandom = jest.spyOn(Math, 'random')
        .mockReturnValue(0.01); // Always return 0.01 (< 0.02) to trigger events
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Trigger tick on fresh instance
      await (freshService as any).triggerTick();
      
      mockRandom.mockRestore();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('New market event')
      );
    });

    it('should update collection sentiment based on market activity', async () => {
      const mockNFTModel = require('../models/NFT').default;
      
      tickService.startTickSystem(1000);
      
      // Trigger a tick manually
      await tickService.triggerTick();
      
      expect(mockNFTModel.distinct).toHaveBeenCalledWith('collectionName');
    });
  });

  describe('enhanced tick processing', () => {
    it('should pass market sentiment to price update function', async () => {
      tickService.startTickSystem(1000);
      
      // Trigger a tick manually
      await tickService.triggerTick();
      
      expect(updateAllListedNftPrices).toHaveBeenCalledWith(
        expect.objectContaining({
          globalSentiment: expect.any(Number),
          collectionSentiment: expect.any(Object),
          npcActivityLevel: expect.any(Number),
          activeEvents: expect.any(Array)
        })
      );
    });

    it('should include market sentiment in emitted market update', async () => {
      tickService.startTickSystem(1000);
      
      // Trigger a tick manually
      await tickService.triggerTick();
      
      expect(emitMarketUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tick',
          message: 'Market tick processed',
          marketData: expect.objectContaining({
            marketSentiment: expect.objectContaining({
              globalSentiment: expect.any(Number),
              collectionSentiment: expect.any(Object),
              npcActivityLevel: expect.any(Number),
              activeEvents: expect.any(Array)
            })
          })
        })
      );
    });

    it('should track tick count properly', async () => {
      // Create a fresh tick service instance for this test
      const freshTickService = new TickService();
      freshTickService.setEmitFunction(emitMarketUpdate);
      
      // Clear mocks to start fresh
      jest.clearAllMocks();
      
      // Don't call startTickSystem to avoid the initial tick
      // Just manually trigger ticks and verify the count
      await (freshTickService as any).triggerTick();
      await (freshTickService as any).triggerTick();
      await (freshTickService as any).triggerTick();
      await (freshTickService as any).triggerTick();
      
      // Should have emitted 4 times
      expect(emitMarketUpdate).toHaveBeenCalledTimes(4);
      
      const calls = (emitMarketUpdate as jest.Mock).mock.calls;
      expect(calls[0][0].marketData.tickNumber).toBe(1);
      expect(calls[1][0].marketData.tickNumber).toBe(2);
      expect(calls[2][0].marketData.tickNumber).toBe(3);
      expect(calls[3][0].marketData.tickNumber).toBe(4);
      
      // Clean up
      freshTickService.stopTickSystem();
    });
  });

  describe('tick processing', () => {
    it('should emit market update on each tick', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem(1000);
      
      // Trigger a tick manually
      await tickService.triggerTick();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Processing tick'));
      expect(consoleSpy).toHaveBeenCalledWith('Market update emitted via Socket.IO');
    });

    it('should handle errors gracefully without stopping the tick system', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock emitMarketUpdate to throw an error
      (emitMarketUpdate as jest.Mock).mockImplementation(() => {
        throw new Error('Socket error');
      });
      
      tickService.startTickSystem(1000);
      
      // Trigger a tick manually
      await tickService.triggerTick();
      
      expect(errorSpy).toHaveBeenCalledWith('Error processing tick:', expect.any(Error));
      expect(tickService.getStatus().isRunning).toBe(true);
    });
  });

  describe('tick interval', () => {
    it('should be configurable with custom interval', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem(2000);
      
      expect(consoleSpy).toHaveBeenCalledWith('Starting tick system with 2000ms interval');
      expect(tickService.getStatus().isRunning).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle NFT model query failures gracefully', async () => {
      const mockNFTModel = require('../models/NFT').default;
      mockNFTModel.distinct.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      tickService.startTickSystem(1000);
      
      // Trigger a tick manually
      await tickService.triggerTick();
      
      expect(tickService.getStatus().isRunning).toBe(true);
    });
  });
});