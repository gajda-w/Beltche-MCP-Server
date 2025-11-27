/**
 * OAuth token data stored in token store
 */
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  createdAt: number;
}

/**
 * OAuth token response from FusionAuth
 */
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
}

/**
 * OAuth authorization result
 */
export interface AuthorizationResult {
  linkToken: string;
  authUrl: string;
}

/**
 * Token exchange result
 */
export interface TokenExchangeResult {
  success: boolean;
  tokenData?: TokenData;
  error?: string;
}
