import type { TokenData } from '../types/index.js';
import type { TokenStore } from './token.store.interface.js';
import { logger } from '../middleware/logger.js';

/**
 * In-memory token store implementation
 * Use for development only - tokens are lost on restart
 */
export class MemoryTokenStore implements TokenStore {
  private store = new Map<string, TokenData>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;

  constructor(options?: { maxSize?: number; defaultTtlMs?: number }) {
    this.maxSize = options?.maxSize ?? 10000;
    this.defaultTtlMs = options?.defaultTtlMs ?? 24 * 60 * 60 * 1000; // 24 hours
  }

  async get(linkToken: string): Promise<TokenData | null> {
    const data = this.store.get(linkToken);

    if (!data) {
      return null;
    }

    // Check if expired
    if (data.expiresAt && Date.now() > data.expiresAt) {
      await this.delete(linkToken);
      return null;
    }

    return data;
  }

  async set(linkToken: string, data: TokenData): Promise<void> {
    // Enforce max size - remove oldest entries if needed
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
        logger.warn(
          { removedLinkToken: '***' },
          'Token store full, removed oldest entry'
        );
      }
    }

    this.store.set(linkToken, {
      ...data,
      // Set default expiry if not provided
      expiresAt: data.expiresAt ?? Date.now() + this.defaultTtlMs,
    });

    logger.debug({ linkToken: linkToken.slice(0, 8) + '***' }, 'Token stored');
  }

  async delete(linkToken: string): Promise<void> {
    this.store.delete(linkToken);
    logger.debug({ linkToken: linkToken.slice(0, 8) + '***' }, 'Token deleted');
  }

  async has(linkToken: string): Promise<boolean> {
    const data = await this.get(linkToken);
    return data !== null;
  }

  async clearExpired(): Promise<number> {
    const now = Date.now();
    let cleared = 0;

    for (const [linkToken, data] of this.store.entries()) {
      if (data.expiresAt && now > data.expiresAt) {
        this.store.delete(linkToken);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info({ clearedCount: cleared }, 'Cleared expired tokens');
    }

    return cleared;
  }

  /**
   * Get store statistics (for monitoring)
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
    };
  }
}
