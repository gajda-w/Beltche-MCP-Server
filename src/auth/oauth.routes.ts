import { Router } from 'express';
import { getOAuthService } from './oauth.service.js';
import { asyncHandler } from '../middleware/errors.js';
import { logger } from '../middleware/logger.js';

/**
 * Create Express router for OAuth endpoints
 */
export function createOAuthRouter(): Router {
  const router = Router();
  const oauthService = getOAuthService();

  /**
   * OAuth callback endpoint
   * Receives authorization code from FusionAuth and exchanges for token
   */
  router.get(
    '/callback',
    asyncHandler(async (req, res): Promise<void> => {
      const { code, state } = req.query;

      if (!code || typeof code !== 'string') {
        logger.warn('OAuth callback missing code parameter');
        res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
            <h1 style="color: #e74c3c;">❌ Authorization Failed</h1>
            <p>Missing authorization code. Please try again.</p>
          </body>
          </html>
        `);
        return;
      }

      if (!state || typeof state !== 'string') {
        logger.warn('OAuth callback missing state parameter');
        res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
            <h1 style="color: #e74c3c;">❌ Authorization Failed</h1>
            <p>Missing state parameter. Please try again.</p>
          </body>
          </html>
        `);
        return;
      }

      const linkToken = state;

      // Exchange code for token
      const tokenData = await oauthService.exchangeCodeForToken(
        code,
        linkToken
      );

      if (!tokenData) {
        res.status(500).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
            <h1 style="color: #e74c3c;">❌ Authorization Failed</h1>
            <p>Failed to exchange authorization code for token.</p>
            <p>Please check the server logs and try again.</p>
          </body>
          </html>
        `);
        return;
      }

      // Success page
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Complete</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
              background: #f5f5f5;
            }
            .card {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #27ae60; margin-bottom: 20px; }
            code {
              background: #f4f4f4;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              display: inline-block;
              margin: 10px 0;
              word-break: break-all;
            }
            .info { color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>✅ Authorization Complete!</h1>
            <p>You can now close this page and return to ChatGPT.</p>
            <p><strong>Your linkToken:</strong></p>
            <code>${linkToken}</code>
            <p class="info">Use this linkToken when calling <strong>get_students</strong>.</p>
          </div>
        </body>
        </html>
      `);
    })
  );

  return router;
}
