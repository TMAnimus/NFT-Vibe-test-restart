// Intentionally require socketService at call time so Jest mocks are observed

export class TickService {
  private tickInterval: NodeJS.Timeout | null = null;
  private lastTickTime: Date = new Date();
  private isRunning: boolean = false;
  private emitFn: ((update: any) => void) | null = null;

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

    this.tickInterval = setInterval(() => {
      this.processTick();
    }, intervalMs);

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
   * - Trigger NPC actions
   * - Generate market events
   * - Emit real-time updates
   */
  private async processTick(): Promise<void> {
    try {
      console.log(`Processing tick at ${new Date().toISOString()}`);
      this.lastTickTime = new Date();

      // 1. Update market prices
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { updateAllListedNftPrices } = require('./marketplaceService');
      const updatedNfts = await updateAllListedNftPrices();

      // 2. Process NPC actions (scaffold)
      const npcActions = await this.processNPCActions();

      // 3. Generate market events (scaffold)
      const events = await this.generateMarketEvents();

      // 4. Emit real-time market update
      const marketUpdate = {
        type: 'tick',
        tickTime: this.lastTickTime.toISOString(),
        message: 'Market tick processed',
        marketData: {
          tickNumber: this.getTickNumber(),
          timestamp: this.lastTickTime.toISOString(),
          updatedNfts,
          npcActions,
          events
        }
      };

      try {
        if (this.emitFn) {
          this.emitFn(marketUpdate);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { emitMarketUpdate } = require('./socketService');
          emitMarketUpdate(marketUpdate);
        }
      } catch (e) {
        throw e;
      }
      console.log('Market update emitted via Socket.IO');
    } catch (error) {
      console.error('Error processing tick:', error);
    }
  }

  /**
   * Get the current tick number (for tracking)
   */
  private getTickNumber(): number {
    // Simple tick counter - in a real implementation, this would be persisted
    return Math.floor((Date.now() - this.lastTickTime.getTime()) / 10000);
  }

  /**
   * Update market prices (placeholder for future implementation)
   */
  private async updateMarketPrices(): Promise<void> {
    // TODO: Implement price update logic
    // - Fetch all listed NFTs
    // - Apply price fluctuations based on market conditions
    // - Update NFT prices in database
    console.log('Market prices updated');
  }

  // Scaffold: NPC actions
  private async processNPCActions(): Promise<any[]> {
    // Placeholder for future NPC logic
    console.log('Processing NPC actions (scaffold)');
    return [];
  }

  // Scaffold: Market events
  private async generateMarketEvents(): Promise<any[]> {
    // Placeholder for future event logic
    console.log('Generating market events (scaffold)');
    return [];
  }
}

// Export a singleton instance
export const tickService = new TickService(); 