/**
 * Beltche MCP Server - Entry Point
 *
 * This is the main entry point for the Beltche MCP Server.
 * It initializes the environment, creates the server, and starts listening.
 */

import 'dotenv/config';

// Load environment first (validates all required env vars)
import { env, isDev } from './config/env.js';
import { logger } from './middleware/logger.js';
import { createMcpServer, createApp, startServer } from './server.js';
import { getTokenStore } from './auth/token.store.js';

// Log startup
logger.info({ env: env.NODE_ENV }, 'Starting Beltche MCP Server...');

// Initialize token store (validates Redis connection if configured)
const tokenStore = getTokenStore();

// Create MCP server and Express app
const mcpServer = createMcpServer();
const app = createApp(mcpServer);

// Start server
startServer(app);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Promise Rejection');
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

// Periodic cleanup of expired tokens (every hour)
if (!isDev) {
  setInterval(async () => {
    try {
      const cleared = await tokenStore.clearExpired();
      if (cleared > 0) {
        logger.info({ cleared }, 'Cleared expired tokens');
      }
    } catch (error) {
      logger.error({ error }, 'Error clearing expired tokens');
    }
  }, 60 * 60 * 1000);
}
