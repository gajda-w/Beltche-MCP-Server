import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../middleware/logger.js';
import { getTokenStore } from './token.store.js';
import type {
  AuthorizationResult,
  OAuthTokenResponse,
  TokenData,
} from '../types/index.js';

/**
 * OAuth service - handles FusionAuth OAuth flow
 */
export class OAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly authorizeUrl: string;
  private readonly tokenUrl: string;
  private readonly redirectUri: string;
  private readonly scope: string;

  constructor() {
    this.clientId = env.OAUTH_CLIENT_ID;
    this.clientSecret = env.OAUTH_CLIENT_SECRET;
    this.authorizeUrl = env.OAUTH_AUTHORIZE_URL;
    this.tokenUrl = env.OAUTH_TOKEN_URL;
    this.redirectUri = env.OAUTH_REDIRECT_URI;
    this.scope = env.OAUTH_SCOPE;
  }

  /**
   * Generate a unique link token for OAuth flow
   */
  generateLinkToken(): string {
    return crypto.randomUUID();
  }

  /**
   * Get redirect URI for OAuth callback
   */
  getRedirectUri(): string {
    return this.redirectUri;
  }

  /**
   * Create authorization URL for user to authenticate
   */
  createAuthorizationUrl(linkToken: string): AuthorizationResult {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.getRedirectUri(),
      state: linkToken,
      scope: this.scope,
    });

    const authUrl = `${this.authorizeUrl}?${params.toString()}`;

    logger.debug(
      { linkToken: linkToken.slice(0, 8) + '***' },
      'Created authorization URL'
    );

    return { linkToken, authUrl };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
    linkToken: string
  ): Promise<TokenData | null> {
    logger.info(
      { linkToken: linkToken.slice(0, 8) + '***' },
      'Exchanging authorization code for token'
    );

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.getRedirectUri(),
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(
          {
            status: response.status,
            error: errorBody.slice(0, 200),
          },
          'Token exchange failed'
        );
        return null;
      }

      const tokenResponse = (await response.json()) as OAuthTokenResponse;

      if (!tokenResponse.access_token) {
        logger.error('No access_token in token response');
        return null;
      }

      const tokenData: TokenData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: tokenResponse.expires_in
          ? Date.now() + tokenResponse.expires_in * 1000
          : undefined,
        createdAt: Date.now(),
      };

      // Store token
      const tokenStore = getTokenStore();
      await tokenStore.set(linkToken, tokenData);

      logger.info(
        { linkToken: linkToken.slice(0, 8) + '***' },
        'Token exchange successful'
      );

      return tokenData;
    } catch (error) {
      logger.error({ error }, 'Error during token exchange');
      return null;
    }
  }

  /**
   * Refresh an expired token
   */
  async refreshToken(linkToken: string): Promise<TokenData | null> {
    const tokenStore = getTokenStore();
    const existingToken = await tokenStore.get(linkToken);

    if (!existingToken?.refreshToken) {
      logger.warn(
        { linkToken: linkToken.slice(0, 8) + '***' },
        'No refresh token available'
      );
      return null;
    }

    logger.info(
      { linkToken: linkToken.slice(0, 8) + '***' },
      'Refreshing token'
    );

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: existingToken.refreshToken,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(
          {
            status: response.status,
            error: errorBody.slice(0, 200),
          },
          'Token refresh failed'
        );

        // Remove invalid token
        await tokenStore.delete(linkToken);
        return null;
      }

      const tokenResponse = (await response.json()) as OAuthTokenResponse;

      const tokenData: TokenData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token ?? existingToken.refreshToken,
        expiresAt: tokenResponse.expires_in
          ? Date.now() + tokenResponse.expires_in * 1000
          : undefined,
        createdAt: Date.now(),
      };

      await tokenStore.set(linkToken, tokenData);

      logger.info(
        { linkToken: linkToken.slice(0, 8) + '***' },
        'Token refresh successful'
      );

      return tokenData;
    } catch (error) {
      logger.error({ error }, 'Error during token refresh');
      return null;
    }
  }

  /**
   * Get valid token, refreshing if necessary
   */
  async getValidToken(linkToken: string): Promise<TokenData | null> {
    const tokenStore = getTokenStore();
    const tokenData = await tokenStore.get(linkToken);

    if (!tokenData) {
      return null;
    }

    // Check if token is expired or about to expire (5 minute buffer)
    const bufferMs = 5 * 60 * 1000;
    if (tokenData.expiresAt && Date.now() > tokenData.expiresAt - bufferMs) {
      logger.debug(
        { linkToken: linkToken.slice(0, 8) + '***' },
        'Token expired, attempting refresh'
      );
      return this.refreshToken(linkToken);
    }

    return tokenData;
  }
}

// Singleton instance
let oauthServiceInstance: OAuthService | null = null;

/**
 * Get the OAuth service singleton
 */
export function getOAuthService(): OAuthService {
  if (!oauthServiceInstance) {
    oauthServiceInstance = new OAuthService();
  }
  return oauthServiceInstance;
}
