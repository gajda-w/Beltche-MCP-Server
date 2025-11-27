import { Redis } from 'ioredis';
import type { TokenData } from '../types/index.js';
import type { TokenStore } from './token.store.interface.js';
import { logger } from '../middleware/logger.js';

/**
 * Redis token store implementation
 * Use for production - tokens persist across restarts
 */
export class RedisTokenStore implements TokenStore {
  private client: Redis;
  private readonly keyPrefix = 'beltche:token:';
  private readonly defaultTtlSeconds: number;

  constructor(redisUrl: string, options?: { defaultTtlSeconds?: number }) {
    this.client = new Redis(redisUrl);
    this.defaultTtlSeconds = options?.defaultTtlSeconds ?? 24 * 60 * 60; // 24 hours

    this.client.on('error', (err: Error) => {
      logger.error({ err }, 'Redis connection error');
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  private getKey(linkToken: string): string {
    return `${this.keyPrefix}${linkToken}`;
  }

  async get(linkToken: string): Promise<TokenData | null> {
    try {
      const data = await this.client.get(this.getKey(linkToken));

      if (!data) {
        return null;
      }

      return JSON.parse(data) as TokenData;
    } catch (error) {
      logger.error(
        { error, linkToken: linkToken.slice(0, 8) + '***' },
        'Failed to get token from Redis'
      );
      return null;
    }
  }

  async set(linkToken: string, data: TokenData): Promise<void> {
    try {
      const ttl = data.expiresAt
        ? Math.ceil((data.expiresAt - Date.now()) / 1000)
        : this.defaultTtlSeconds;

      await this.client.setex(
        this.getKey(linkToken),
        Math.max(ttl, 60), // Minimum 60 seconds
        JSON.stringify(data)
      );

      logger.debug(
        { linkToken: linkToken.slice(0, 8) + '***' },
        'Token stored in Redis'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to store token in Redis');
      throw error;
    }
  }

  async delete(linkToken: string): Promise<void> {
    try {
      await this.client.del(this.getKey(linkToken));
      logger.debug(
        { linkToken: linkToken.slice(0, 8) + '***' },
        'Token deleted from Redis'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to delete token from Redis');
    }
  }

  async has(linkToken: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(this.getKey(linkToken));
      return exists === 1;
    } catch (error) {
      logger.error({ error }, 'Failed to check token existence in Redis');
      return false;
    }
  }

  async clearExpired(): Promise<number> {
    // Redis handles expiration automatically via TTL
    // This method is a no-op for Redis
    return 0;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.client.quit();
  }
}
