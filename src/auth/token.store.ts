import { env } from '../config/env.js';
import type { TokenStore } from './token.store.interface.js';
import { MemoryTokenStore } from './memory.token.store.js';
import { RedisTokenStore } from './redis.token.store.js';
import { logger } from '../middleware/logger.js';

/**
 * Create token store based on environment configuration
 * Uses Redis if REDIS_URL is provided, otherwise falls back to memory
 */
export function createTokenStore(): TokenStore {
  if (env.REDIS_URL) {
    logger.info('Using Redis token store');
    return new RedisTokenStore(env.REDIS_URL);
  }

  logger.warn('Using in-memory token store (tokens will be lost on restart)');
  return new MemoryTokenStore();
}

// Singleton instance
let tokenStoreInstance: TokenStore | null = null;

/**
 * Get the token store singleton
 */
export function getTokenStore(): TokenStore {
  if (!tokenStoreInstance) {
    tokenStoreInstance = createTokenStore();
  }
  return tokenStoreInstance;
}

export type { TokenStore };
export { MemoryTokenStore } from './memory.token.store.js';
export { RedisTokenStore } from './redis.token.store.js';
