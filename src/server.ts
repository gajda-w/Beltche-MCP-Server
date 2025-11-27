import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { createOAuthRouter } from './auth/oauth.routes.js';
import { registerAllTools } from './tools/index.js';
import { logger, requestLogger, errorHandler } from './middleware/index.js';

/**
 * Create and configure the MCP server
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'beltche-mcp-server',
    version: '1.0.0',
  });

  // Register all tools
  registerAllTools(server);

  return server;
}

/**
 * Create and configure the Express app
 */
export function createApp(mcpServer: McpServer): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(requestLogger());

  // Trust proxy (needed for rate limiting behind ngrok/reverse proxy)
  app.set('trust proxy', 1);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
      error: 'RATE_LIMITED',
      message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/mcp', limiter);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // OAuth routes
  app.use('/auth', createOAuthRouter());

  // MCP endpoint
  app.post('/mcp', async (req, res) => {
    logger.debug({ body: req.body }, 'Incoming MCP request');

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    res.on('close', () => {
      transport.close();
    });

    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error({ error }, 'Error handling MCP request');
      if (!res.headersSent) {
        res.status(500).json({
          error: 'INTERNAL_ERROR',
          message: 'Failed to process MCP request',
        });
      }
    }
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
export function startServer(app: Express): void {
  const port = env.PORT;

  app
    .listen(port, () => {
      logger.info(
        { port, env: env.NODE_ENV },
        '🚀 Beltche MCP Server is running'
      );
      logger.info(`   MCP endpoint: http://localhost:${port}/mcp`);
      logger.info(`   Health check: http://localhost:${port}/health`);
      logger.info(`   OAuth callback: http://localhost:${port}/auth/callback`);
    })
    .on('error', (error) => {
      logger.error({ error }, 'Failed to start server');
      process.exit(1);
    });
}
