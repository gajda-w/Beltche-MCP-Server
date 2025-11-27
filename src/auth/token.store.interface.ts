import type { TokenData } from '../types/index.js';

/**
 * Token store interface - abstraction for storing OAuth tokens
 * Allows swapping implementations (memory, redis, database)
 */
export interface TokenStore {
  /**
   * Get token data by link token
   */
  get(linkToken: string): Promise<TokenData | null>;

  /**
   * Store token data with link token
   */
  set(linkToken: string, data: TokenData): Promise<void>;

  /**
   * Delete token by link token
   */
  delete(linkToken: string): Promise<void>;

  /**
   * Check if token exists
   */
  has(linkToken: string): Promise<boolean>;

  /**
   * Clear expired tokens (maintenance)
   */
  clearExpired(): Promise<number>;
}
