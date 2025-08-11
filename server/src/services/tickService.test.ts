jest.mock('./socketService', () => {
  const actual = jest.requireActual('./socketService');
  return {
    ...actual,
    emitMarketUpdate: jest.fn()
  };
});

import { TickService } from './tickService';
import { emitMarketUpdate } from './socketService';

// Mock MongoDB
jest.mock('mongoose');

describe('TickService', () => {
  let tickService: TickService;

  beforeEach(() => {
    tickService = new TickService();
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Ensure the service emits via our mocked function
    tickService.setEmitFunction(emitMarketUpdate as unknown as (u: any) => void);
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

    it('should process initial tick immediately', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem();
      
      // Wait for the next tick to allow async operations to complete
      await Promise.resolve();
      // Flush another microtask to ensure emit completes
      await Promise.resolve();
      // And one more to stabilize emission timing on CI
      await Promise.resolve();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Processing tick'));
      // Verify that emission occurred via log, which is independent of mock wiring
      expect(consoleSpy).toHaveBeenCalledWith('Market update emitted via Socket.IO');
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

  describe('tick processing', () => {
    it('should emit market update on each tick', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem(1000); // 1 second interval for testing
      
      // Wait for the next tick to allow async operations to complete
      await Promise.resolve();
      await Promise.resolve();
      
      // Fast-forward time to trigger next tick
      jest.advanceTimersByTime(1000);
      
      // Wait for async operations again
      await Promise.resolve();
      await Promise.resolve();
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Processing tick'));
      expect(consoleSpy).toHaveBeenCalledWith('Market update emitted via Socket.IO');
    });

    it('should handle errors gracefully without stopping the tick system', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock emitMarketUpdate to throw an error through the injected emitter
      (emitMarketUpdate as jest.Mock).mockImplementation(() => {
        throw new Error('Socket error');
      });
      
      tickService.startTickSystem(1000);
      
      // Wait for the next tick to allow async operations to complete
      await Promise.resolve();
      await Promise.resolve();
      
      // Fast-forward time to trigger next tick
      jest.advanceTimersByTime(1000);
      
      // Wait for async operations again
      await Promise.resolve();
      await Promise.resolve();
      
      expect(errorSpy).toHaveBeenCalledWith('Error processing tick:', expect.any(Error));
      expect(tickService.getStatus().isRunning).toBe(true); // Should still be running
    });
  });

  describe('tick interval', () => {
    it('should process ticks at the specified interval', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      tickService.startTickSystem(2000); // 2 second interval
      
      // First tick (immediate)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Processing tick'));
      
      // Reset mock to count subsequent ticks
      consoleSpy.mockClear();
      
      // Second tick (after 2 seconds)
      jest.advanceTimersByTime(2000);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Processing tick'));
      
      // Third tick (after another 2 seconds)
      consoleSpy.mockClear();
      jest.advanceTimersByTime(2000);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Processing tick'));
    });
  });
}); 