// Intentionally require socketService at call time so Jest mocks are observed

import { MarketSentiment } from './marketplaceService';
import NFTModel from '../models/NFT';
import { updateAllListedNftPrices } from './marketplaceService';

export class TickService {
  private tickInterval: NodeJS.Timeout | null = null;
  private lastTickTime: Date = new Date();
  private isRunning: boolean = false;
  private emitFn: ((update: any) => void) | null = null;
  
  // Enhanced market sentiment tracking
  private marketSentiment: MarketSentiment = {
    globalSentiment: 0, // Start neutral
    collectionSentiment: {},
    npcActivityLevel: 0.5, // Medium activity
    activeEvents: []
  };

  private tickCount: number = 0;
  private eventCooldowns: { [event: string]: number } = {};

  /**
   * Allow tests (or alternative environments) to inject a custom emitter.
   */
  public setEmitFunction(emitFunction: (update: any) => void): void {
    this.emitFn = emitFunction;
  }

  /**
   * Start the tick system with configurable interval
   * @param intervalMs - Tick interval in milliseconds (default 10 seconds for dev)
   */
  startTickSystem(intervalMs: number = 10000): void {
    if (this.isRunning) {
      console.log('Tick system is already running');
      return;
    }

    console.log(`Starting tick system with ${intervalMs}ms interval`);
    this.isRunning = true;
    this.lastTickTime = new Date();
    this.tickCount = 0;

    this.tickInterval = setInterval(() => {
      this.processTick();
    }, intervalMs);
    
    // Use unref() to prevent the timer from keeping the process alive during tests
    this.tickInterval.unref();

    // Process initial tick immediately
    this.processTick();
  }

  /**
   * Stop the tick system cleanly
   */
  stopTickSystem(): void {
    if (!this.isRunning) {
      console.log('Tick system is not running');
      return;
    }

    console.log('Stopping tick system');
    this.isRunning = false;

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Get the current tick system status
   */
  getStatus(): { isRunning: boolean; lastTickTime: Date; interval: number | null } {
    return {
      isRunning: this.isRunning,
      lastTickTime: this.lastTickTime,
      interval: this.tickInterval ? 10000 : null // Default interval for now
    };
  }

  /**
   * Core tick processing logic
   * - Update market prices
   * - Process auctions (Dutch price decreases, end expired auctions)
   * - Trigger NPC actions
   * - Generate market events
   * - Emit real-time updates
   */
  private async processTick(): Promise<void> {
    try {
      console.log(`Processing tick at ${new Date().toISOString()}`);
      this.lastTickTime = new Date();
      this.tickCount++;

      // Update market sentiment before price updates
      await this.updateMarketSentiment();

      // 1. Update market prices with sentiment data
      const updatedNfts = await updateAllListedNftPrices(this.marketSentiment);

      // 2. Process auction updates
      await this.processAuctions();

      // 3. Emit real-time market update
      if (this.emitFn) {
        const marketUpdate = {
          type: 'tick',
          message: 'Market tick processed',
          marketData: {
            tickNumber: this.tickCount,
            timestamp: new Date().toISOString(),
            marketSentiment: this.marketSentiment,
            updatedNfts: updatedNfts,
            activeEvents: this.marketSentiment.activeEvents
          }
        };
        this.emitFn(marketUpdate);
        console.log('Market update emitted via Socket.IO');
      }
    } catch (error) {
      console.error('Error processing tick:', error);
    }
  }

  /**
   * Process auction-related updates during ticks
   */
  private async processAuctions(): Promise<void> {
    try {
      // Import auction service dynamically to avoid circular dependencies
      const auctionService = await import('./auctionService');
      const AuctionModel = (await import('../models/Auction')).default;
      
      // Get all active auctions - handle both real and mocked models
      let activeAuctions: any[] = [];
      try {
        const result = await AuctionModel.find({ 
          auctionStatus: 'active' 
        });
        activeAuctions = Array.isArray(result) ? result : [];
      } catch (error) {
        // In test environment, model might be mocked differently
        console.log('Auction model query failed, skipping auction processing');
        return;
      }

      for (const auction of activeAuctions) {
        // Check if auction has expired
        if (auction.endTime && new Date() >= new Date(auction.endTime)) {
          console.log(`Ending expired auction: ${auction.id}`);
          await auctionService.endAuction(auction._id.toString());
        } 
        // Process Dutch auction price decreases
        else if (auction.auctionType === 'dutch') {
          await auctionService.processDutchAuctionTick(auction._id.toString());
        }
      }
    } catch (error) {
      console.error('Error processing auctions:', error);
    }
  }

  /**
   * Update market sentiment and generate events
   */
  private async updateMarketSentiment(): Promise<void> {
    try {
      // Update global sentiment with momentum
      this.updateGlobalSentiment();

      // Update collection sentiment
      await this.updateCollectionSentiment();

      // Update active events
      this.updateActiveEvents();

      // Generate new events occasionally
      if (Math.random() < 0.02) { // 2% chance per tick
        const newEvent = this.generateMarketEvent();
        if (newEvent) {
          this.marketSentiment.activeEvents.push(newEvent.type);
          this.eventCooldowns[newEvent.type] = newEvent.duration;
          console.log(`New market event: ${newEvent.type} (duration: ${newEvent.duration} ticks)`);
        }
      }
    } catch (error) {
      console.warn('Error updating market sentiment:', error);
    }
  }

  /**
   * Update global market sentiment with momentum
   */
  private updateGlobalSentiment(): void {
    // Add some momentum to prevent wild swings
    const momentumFactor = 0.3; // Higher = more momentum, less volatility
    const randomChange = (Math.random() - 0.5) * 0.1; // -0.05 to +0.05

    const newSentiment = this.marketSentiment.globalSentiment * momentumFactor +
                        randomChange * (1 - momentumFactor);

    // Clamp between -1 and 1
    this.marketSentiment.globalSentiment = Math.max(-1, Math.min(1, newSentiment));

    // Update NPC activity level based on market conditions
    const volatility = Math.abs(this.marketSentiment.globalSentiment);
    this.marketSentiment.npcActivityLevel = 0.3 + (volatility * 0.7); // 0.3 to 1.0
  }

  /**
   * Update collection-specific sentiment based on market activity
   */
  private async updateCollectionSentiment(): Promise<void> {
    try {
      // Get all collections with recent activity
      const collections = await NFTModel.distinct('collectionName');

      // Limit the number of collections to prevent memory issues
      const maxCollections = 100;
      if (collections.length > maxCollections) {
        collections.splice(maxCollections);
      }

      for (const collection of collections) {
        if (!this.marketSentiment.collectionSentiment[collection]) {
          this.marketSentiment.collectionSentiment[collection] = (Math.random() - 0.5) * 0.2; // Initialize randomly
        } else {
          // Gradual evolution with global sentiment influence
          const change = (Math.random() - 0.5) * 0.03;
          const globalInfluence = this.marketSentiment.globalSentiment * 0.05;
          this.marketSentiment.collectionSentiment[collection] = Math.max(-1, Math.min(1,
            this.marketSentiment.collectionSentiment[collection] + change + globalInfluence));
        }
      }

      // Clean up old collections (remove if not in recent activity)
      const activeCollectionSet = new Set(collections);
      const currentCollections = Object.keys(this.marketSentiment.collectionSentiment);

      for (const collection of currentCollections) {
        if (!activeCollectionSet.has(collection)) {
          // Gradually fade out sentiment for inactive collections
          this.marketSentiment.collectionSentiment[collection] *= 0.95;

          // Remove if sentiment becomes negligible
          if (Math.abs(this.marketSentiment.collectionSentiment[collection]) < 0.01) {
            delete this.marketSentiment.collectionSentiment[collection];
          }
        }
      }
    } catch (error) {
      console.warn('Error updating collection sentiment:', error);
    }
  }

  /**
   * Update active events and remove expired ones
   */
  private updateActiveEvents(): void {
    const expiredEvents: string[] = [];

    for (const event of this.marketSentiment.activeEvents) {
      if (this.eventCooldowns[event] > 0) {
        this.eventCooldowns[event]--;
      } else {
        expiredEvents.push(event);
      }
    }

    // Remove expired events
    this.marketSentiment.activeEvents = this.marketSentiment.activeEvents.filter(
      event => !expiredEvents.includes(event));

    // Clean up cooldowns
    for (const expired of expiredEvents) {
      delete this.eventCooldowns[expired];
    }

    if (expiredEvents.length > 0) {
      console.log(`Events expired: ${expiredEvents.join(', ')}`);
    }
  }

  /**
   * Generate a new market event
   */
  private generateMarketEvent(): { type: string; duration: number } | null {
    const possibleEvents = [
      { type: 'cryptoMarketCrash', duration: 3, probability: 0.1 },
      { type: 'celebrityEndorsement', duration: 5, probability: 0.15 },
      { type: 'environmentalBacklash', duration: 4, probability: 0.12 },
      { type: 'techBoom', duration: 6, probability: 0.1 },
      { type: 'regulatoryCrackdown', duration: 4, probability: 0.08 },
      { type: 'institutionalAdoption', duration: 7, probability: 0.09 }
    ];

    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const event of possibleEvents) {
      cumulativeProbability += event.probability;
      if (rand <= cumulativeProbability) {
        return { type: event.type, duration: event.duration };
      }
    }

    return null;
  }

  /**
   * Manually trigger a tick (for testing purposes)
   */
  public triggerTick(): Promise<void> {
    return this.processTick();
  }
}

// Export singleton instance for backward compatibility
export const tickService = new TickService(); 