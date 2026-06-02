import { 
  createAuction, 
  placeBid, 
  endAuction, 
  getActiveAuctions, 
  cancelAuction,
  processDutchAuctionTick,
  AuctionError 
} from './auctionService';
import { AuctionType, AuctionStatus } from '../models/enums';

// Mock dependencies
jest.mock('../models/Auction');
jest.mock('../models/Bid');
jest.mock('../models/NFT');
jest.mock('../models/User');
jest.mock('../models/Transaction');
jest.mock('./socketService');

// Mock fs so the module-level config load in auctionService succeeds
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn((filePath: string) => {
    if (String(filePath).includes('marketplaceConfig')) {
      return JSON.stringify({
        auctions: {
          limits: { maxActiveAuctionsPerUser: 5 },
          pricing: { minStartingBid: 1, maxStartingBid: 100000, bidIncrement: 1, reservePriceMin: 1, reservePriceMax: 100000 },
          timing: { defaultDuration: 300, minDuration: 60, maxDuration: 3600 },
          fees: { transactionFee: 0.05, cancelFee: 0.01 },
          dutchAuctions: { defaultStartPriceMultiplier: 2, defaultDecrementPercent: 30, priceFloorMultiplier: 0.1 },
          autobid: { maxAutobidsPerUser: 10, defaultIncrement: 1 }
        }
      });
    }
    return jest.requireActual('fs').readFileSync(filePath);
  })
}));

describe('Auction Service', () => {
  let mockAuctionModel: any;
  let mockBidModel: any;
  let mockNFTModel: any;
  let mockUserModel: any;
  let mockTransactionModel: any;
  let mockSession: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock models
    mockAuctionModel = require('../models/Auction').default;
    mockBidModel = require('../models/Bid').default;
    mockNFTModel = require('../models/NFT').default;
    mockUserModel = require('../models/User').UserModel;
    mockTransactionModel = require('../models/Transaction').TransactionModel;

    // Mock mongoose session
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    };

    // Mock mongoose startSession
    const mongoose = require('mongoose');
    mongoose.startSession = jest.fn().mockResolvedValue(mockSession);

    // Mock marketplace config
    const mockConfig = {
      auctions: {
        limits: { maxActiveAuctionsPerUser: 10 },
        pricing: { 
          minStartingBid: 1, 
          maxStartingBid: 10000,
          bidIncrement: 1,
          reservePriceMin: 10,
          reservePriceMax: 50000
        },
        timing: { 
          defaultDuration: 300, 
          minDuration: 60, 
          maxDuration: 3600 
        },
        dutchAuctions: {
          defaultStartPriceMultiplier: 2.0,
          defaultDecrementPercent: 30,
          priceFloorMultiplier: 0.5
        },
        autobid: {
          maxAutobidsPerUser: 5,
          defaultIncrement: 1
        },
        fees: {
          transactionFee: 0.05,
          cancelFee: 0.01
        }
      }
    };

    const fs = require('fs');
    fs.readFileSync = jest.fn().mockReturnValue(JSON.stringify(mockConfig));
  });

  describe('createAuction', () => {
    it('should create a standard auction successfully', async () => {
      const mockNFT = {
        _id: 'nft123',
        ownerId: 'user123',
        marketStatus: 'Owned',
        save: jest.fn()
      };
      
      const mockAuction = {
        _id: 'auction123',
        id: 'auction123',
        save: jest.fn(),
        auctionType: AuctionType.Standard,
        startingBid: 100,
        endTime: new Date(),
        auctionStatus: AuctionStatus.Active
      };

      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockNFT)
      });
      
      mockAuctionModel.countDocuments.mockReturnValue({
        session: jest.fn().mockResolvedValue(0)
      });

      mockAuctionModel.mockImplementation(() => mockAuction);

      const result = await createAuction(
        'nft123',
        'user123',
        AuctionType.Standard,
        100,
        300
      );

      expect(result.message).toBe('Auction created successfully');
      expect(result.auction.auctionType).toBe(AuctionType.Standard);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw error if NFT not found', async () => {
      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(null)
      });

      await expect(
        createAuction('nonexistent', 'user123', AuctionType.Standard, 100)
      ).rejects.toThrow('NFT not found');
    });

    it('should throw error if user is not NFT owner', async () => {
      const mockNFT = {
        _id: 'nft123',
        ownerId: 'otheruser',
        marketStatus: 'Owned'
      };

      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockNFT)
      });

      await expect(
        createAuction('nft123', 'user123', AuctionType.Standard, 100)
      ).rejects.toThrow('User is not the owner of this NFT');
    });

    it('should create Dutch auction with correct pricing', async () => {
      const mockNFT = {
        _id: 'nft123',
        ownerId: 'user123',
        marketStatus: 'Owned',
        save: jest.fn()
      };
      
      const mockAuction = {
        _id: 'auction123',
        id: 'auction123',
        save: jest.fn(),
        auctionType: AuctionType.Dutch,
        startingBid: 100,
        dutchStartPrice: 200, // 2x multiplier
        dutchCurrentPrice: 200,
        endTime: new Date(),
        auctionStatus: AuctionStatus.Active
      };

      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockNFT)
      });
      
      mockAuctionModel.countDocuments.mockReturnValue({
        session: jest.fn().mockResolvedValue(0)
      });

      mockAuctionModel.mockImplementation(() => mockAuction);

      const result = await createAuction(
        'nft123',
        'user123',
        AuctionType.Dutch,
        100,
        300
      );

      expect(result.message).toBe('Auction created successfully');
      expect(result.auction.auctionType).toBe(AuctionType.Dutch);
    });
  });

  describe('placeBid', () => {
    it('should place a bid successfully', async () => {
      const mockAuction = {
        _id: 'auction123',
        auctionStatus: AuctionStatus.Active,
        sellerId: 'seller123',
        currentBid: 100,
        startingBid: 50,
        auctionType: AuctionType.Standard,
        save: jest.fn()
      };

      const mockBidder = {
        _id: 'bidder123',
        balance: 1000
      };

      const mockBid = {
        _id: 'bid123',
        id: 'bid123',
        save: jest.fn(),
        bidAmount: 150,
        isWinning: true
      };

      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAuction)
      });

      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockBidder)
      });

      mockBidModel.findOne.mockReturnValue({
        session: jest.fn().mockResolvedValue(null)
      });

      mockBidModel.mockImplementation(() => mockBid);

      const result = await placeBid('auction123', 'bidder123', 150);

      expect(result.message).toBe('Bid placed successfully');
      expect(result.bid.amount).toBe(150);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw error if auction not found', async () => {
      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(null)
      });

      await expect(
        placeBid('nonexistent', 'bidder123', 150)
      ).rejects.toThrow('Auction not found');
    });

    it('should throw error if bid amount too low', async () => {
      const mockAuction = {
        _id: 'auction123',
        auctionStatus: AuctionStatus.Active,
        sellerId: 'seller123',
        currentBid: 100,
        startingBid: 50,
        auctionType: AuctionType.Standard
      };

      const mockBidder = {
        _id: 'bidder123',
        balance: 1000
      };

      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAuction)
      });

      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockBidder)
      });

      await expect(
        placeBid('auction123', 'bidder123', 90) // Below minimum
      ).rejects.toThrow('Minimum bid is 101');
    });

    it('should throw error if bidder has insufficient funds', async () => {
      const mockAuction = {
        _id: 'auction123',
        auctionStatus: AuctionStatus.Active,
        sellerId: 'seller123',
        currentBid: 100,
        startingBid: 50,
        auctionType: AuctionType.Standard
      };

      const mockBidder = {
        _id: 'bidder123',
        balance: 50 // Insufficient
      };

      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAuction)
      });

      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockBidder)
      });

      await expect(
        placeBid('auction123', 'bidder123', 150)
      ).rejects.toThrow('Insufficient funds');
    });
  });

  describe('endAuction', () => {
    it('should end auction with winner successfully', async () => {
      const mockWinner = {
        _id: 'winner123',
        username: 'winner',
        balance: 1000,
        save: jest.fn()
      };

      const mockSeller = {
        _id: 'seller123',
        balance: 500,
        save: jest.fn()
      };

      const mockNFT = {
        _id: 'nft123',
        save: jest.fn()
      };

      const mockAuction = {
        _id: 'auction123',
        auctionStatus: AuctionStatus.Active,
        winnerId: 'winner123',
        sellerId: 'seller123',
        nftId: 'nft123',
        winningBid: 200,
        save: jest.fn()
      };

      mockAuctionModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            session: jest.fn().mockResolvedValue(mockAuction)
          })
        })
      });

      mockUserModel.findById
        .mockReturnValueOnce({ session: jest.fn().mockResolvedValue(mockWinner) })
        .mockReturnValueOnce({ session: jest.fn().mockResolvedValue(mockSeller) });

      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockNFT)
      });

      mockTransactionModel.create.mockResolvedValue([{}]);

      await endAuction('auction123');

      expect(mockWinner.balance).toBe(800); // 1000 - 200
      expect(mockSeller.balance).toBe(690); // 500 + 190 (200 - 5% fee)
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should handle auction with no winner', async () => {
      const mockNFT = {
        _id: 'nft123',
        marketStatus: 'Auction',
        save: jest.fn()
      };

      const mockAuction = {
        _id: 'auction123',
        auctionStatus: AuctionStatus.Active,
        winnerId: null,
        sellerId: 'seller123',
        nftId: 'nft123',
        save: jest.fn()
      };

      mockAuctionModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            session: jest.fn().mockResolvedValue(mockAuction)
          })
        })
      });

      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockNFT)
      });

      await endAuction('auction123');

      expect(mockNFT.marketStatus).toBe('Owned');
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('getActiveAuctions', () => {
    it('should return active auctions', async () => {
      const mockAuctions = [
        { _id: 'auction1', auctionStatus: AuctionStatus.Active },
        { _id: 'auction2', auctionStatus: AuctionStatus.Active }
      ];

      mockAuctionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockAuctions)
            })
          })
        })
      });

      const result = await getActiveAuctions();

      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('auction1');
    });
  });

  describe('cancelAuction', () => {
    it('should cancel auction successfully', async () => {
      const mockSeller = {
        _id: 'seller123',
        balance: 1000,
        save: jest.fn()
      };

      const mockNFT = {
        _id: 'nft123',
        save: jest.fn()
      };

      const mockAuction = {
        _id: 'auction123',
        sellerId: 'seller123',
        auctionStatus: AuctionStatus.Active,
        nftId: 'nft123',
        save: jest.fn()
      };

      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAuction)
      });

      mockBidModel.countDocuments.mockReturnValue({
        session: jest.fn().mockResolvedValue(0)
      });

      mockUserModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockSeller)
      });

      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockNFT)
      });

      const result = await cancelAuction('auction123', 'seller123');

      expect(result.message).toBe('Auction cancelled successfully');
      expect(mockSeller.balance).toBe(999.99); // 1000 - 0.01 cancel fee
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw error if not auction owner', async () => {
      const mockAuction = {
        _id: 'auction123',
        sellerId: 'seller123',
        auctionStatus: AuctionStatus.Active
      };

      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAuction)
      });

      await expect(
        cancelAuction('auction123', 'otheruser')
      ).rejects.toThrow('Only seller can cancel auction');
    });
  });

  describe('processDutchAuctionTick', () => {
    it('should decrease Dutch auction price', async () => {
      const mockAuction = {
        _id: 'auction123',
        auctionType: AuctionType.Dutch,
        auctionStatus: AuctionStatus.Active,
        startTime: new Date(Date.now() - 60000), // 1 minute ago
        dutchStartPrice: 200,
        dutchPriceDecrement: 10,
        startingBid: 100,
        save: jest.fn()
      };

      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAuction)
      });

      await processDutchAuctionTick('auction123');

      expect(mockAuction.save).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should handle non-Dutch auctions gracefully', async () => {
      const mockAuction = {
        _id: 'auction123',
        auctionType: AuctionType.Standard,
        auctionStatus: AuctionStatus.Active
      };

      mockAuctionModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockAuction)
      });

      await processDutchAuctionTick('auction123');

      // Should not throw error, just return early
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(
        createAuction('nft123', 'user123', AuctionType.Standard, 100)
      ).rejects.toThrow('Database error');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    it('should validate auction parameters', async () => {
      const mockNFT = {
        _id: 'nft123',
        ownerId: 'user123',
        marketStatus: 'Owned'
      };

      mockNFTModel.findById.mockReturnValue({
        session: jest.fn().mockResolvedValue(mockNFT)
      });

      mockAuctionModel.countDocuments.mockReturnValue({
        session: jest.fn().mockResolvedValue(0)
      });

      // Test invalid starting bid
      await expect(
        createAuction('nft123', 'user123', AuctionType.Standard, 0) // Invalid bid
      ).rejects.toThrow('Starting bid out of range');
    });
  });
});
