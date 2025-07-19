import { emitMarketplaceEvent, emitListingCreated, emitListingSold, emitMarketUpdate } from './socketService';

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Socket Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset global io to null for each test
    (global as any).io = null;
  });

  describe('emitMarketplaceEvent', () => {
    it('should handle missing io gracefully', () => {
      expect(() => emitMarketplaceEvent('testEvent', {})).not.toThrow();
    });

    it('should emit events when io is available', () => {
      const mockEmit = jest.fn();
      const mockTo = jest.fn(() => ({
        emit: mockEmit
      }));
      
      (global as any).io = {
        to: mockTo
      };

      const testData = { test: 'data' };
      emitMarketplaceEvent('testEvent', testData);

      expect(mockTo).toHaveBeenCalledWith('marketplace');
      expect(mockEmit).toHaveBeenCalledWith('testEvent', testData);
    });
  });

  describe('emitListingCreated', () => {
    it('should emit listingCreated event with NFT data', () => {
      const mockEmit = jest.fn();
      const mockTo = jest.fn(() => ({
        emit: mockEmit
      }));
      
      (global as any).io = {
        to: mockTo
      };

      const mockNft = {
        _id: 'test-id',
        displayName: 'Test NFT',
        currentPrice: 100
      };

      emitListingCreated(mockNft);

      expect(mockTo).toHaveBeenCalledWith('marketplace');
      expect(mockEmit).toHaveBeenCalledWith('listingCreated', {
        nft: mockNft,
        timestamp: expect.any(String)
      });
    });
  });

  describe('emitListingSold', () => {
    it('should emit listingSold event with NFT and buyer data', () => {
      const mockEmit = jest.fn();
      const mockTo = jest.fn(() => ({
        emit: mockEmit
      }));
      
      (global as any).io = {
        to: mockTo
      };

      const mockNft = {
        _id: 'test-id',
        displayName: 'Test NFT',
        currentPrice: 100
      };
      const buyer = 'testuser';

      emitListingSold(mockNft, buyer);

      expect(mockTo).toHaveBeenCalledWith('marketplace');
      expect(mockEmit).toHaveBeenCalledWith('listingSold', {
        nft: mockNft,
        buyer: buyer,
        timestamp: expect.any(String)
      });
    });
  });

  describe('emitMarketUpdate', () => {
    it('should emit marketUpdate event with update data', () => {
      const mockEmit = jest.fn();
      const mockTo = jest.fn(() => ({
        emit: mockEmit
      }));
      
      (global as any).io = {
        to: mockTo
      };

      const mockUpdate = {
        type: 'priceChange',
        data: { priceChange: 10 }
      };

      emitMarketUpdate(mockUpdate);

      expect(mockTo).toHaveBeenCalledWith('marketplace');
      expect(mockEmit).toHaveBeenCalledWith('marketUpdate', {
        ...mockUpdate,
        timestamp: expect.any(String)
      });
    });
  });
}); 