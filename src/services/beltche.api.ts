import { env } from '../config/env.js';
import { logger } from '../middleware/logger.js';
import { ExternalApiError } from '../middleware/errors.js';
import type { Student } from '../types/student.js';

/**
 * Beltche API client
 * Handles all communication with Beltche backend
 */
export class BeltcheApiClient {
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(options?: {
    baseUrl?: string;
    maxRetries?: number;
    retryDelayMs?: number;
  }) {
    this.baseUrl = options?.baseUrl ?? env.BELTCHE_API_BASE_URL;
    this.maxRetries = options?.maxRetries ?? 3;
    this.retryDelayMs = options?.retryDelayMs ?? 1000;
  }

  /**
   * Fetch students for the authenticated user
   */
  async getStudents(accessToken: string): Promise<Student[]> {
    const response = await this.request<Student[]>('/students', accessToken);
    return response;
  }

  /**
   * Make an authenticated request to Beltche API
   */
  private async request<T>(
    path: string,
    accessToken: string,
    options?: {
      method?: string;
      body?: unknown;
      retryCount?: number;
    }
  ): Promise<T> {
    const method = options?.method ?? 'GET';
    const retryCount = options?.retryCount ?? 0;
    const url = `${this.baseUrl}${path}`;

    logger.debug({ method, path }, 'Making API request to Beltche');

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      // Handle non-success responses
      if (!response.ok) {
        const errorBody = await response.text();

        logger.warn(
          {
            status: response.status,
            path,
            errorBody: errorBody.slice(0, 200),
          },
          'Beltche API error response'
        );

        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          logger.info({ retryCount: retryCount + 1 }, 'Retrying request');
          await this.delay(this.retryDelayMs * (retryCount + 1));
          return this.request(path, accessToken, {
            ...options,
            retryCount: retryCount + 1,
          });
        }

        throw new ExternalApiError(
          'Beltche',
          response.status,
          `Beltche API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      logger.debug(
        { path, recordCount: Array.isArray(data) ? data.length : 1 },
        'API request successful'
      );

      return data as T;
    } catch (error) {
      // Network errors - retry
      if (
        error instanceof TypeError &&
        error.message.includes('fetch') &&
        retryCount < this.maxRetries
      ) {
        logger.warn(
          { error, retryCount: retryCount + 1 },
          'Network error, retrying'
        );
        await this.delay(this.retryDelayMs * (retryCount + 1));
        return this.request(path, accessToken, {
          ...options,
          retryCount: retryCount + 1,
        });
      }

      // Re-throw if already an AppError
      if (error instanceof ExternalApiError) {
        throw error;
      }

      // Wrap unknown errors
      logger.error({ error, path }, 'Unexpected error during API request');
      throw new ExternalApiError(
        'Beltche',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let clientInstance: BeltcheApiClient | null = null;

/**
 * Get the Beltche API client singleton
 */
export function getBeltcheApiClient(): BeltcheApiClient {
  if (!clientInstance) {
    clientInstance = new BeltcheApiClient();
  }
  return clientInstance;
}
