import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getOAuthService } from '../auth/oauth.service.js';
import { logger } from '../middleware/index.js';

/**
 * Register the authorize tool
 * Generates OAuth authorization URL for user authentication
 */
export function registerAuthorizeTool(server: McpServer): void {
  server.registerTool(
    'authorize',
    {
      title: 'Authorize',
      description:
        'Get authorization URL to connect your Beltche account. Call this first before using other tools.',
      inputSchema: {},
      outputSchema: {
        linkToken: z.string().describe('Token to use in subsequent API calls'),
        authUrl: z
          .string()
          .describe('URL to open in browser for authorization'),
        instructions: z.string().describe('Instructions for the user'),
      },
    },
    async () => {
      const oauthService = getOAuthService();
      const linkToken = oauthService.generateLinkToken();
      const { authUrl } = oauthService.createAuthorizationUrl(linkToken);

      logger.info(
        { linkToken: linkToken.slice(0, 8) + '***' },
        'Generated authorization URL'
      );

      const instructions = [
        '🔐 **Authorization Required**',
        '',
        '1. Click this link to authorize:',
        `   ${authUrl}`,
        '',
        '2. Log in to your Beltche account',
        '',
        '3. After authorization, use this linkToken for subsequent requests:',
        `   \`${linkToken}\``,
        '',
        '_You can now call get_students with this linkToken._',
      ].join('\n');

      return {
        content: [{ type: 'text', text: instructions }],
        structuredContent: {
          linkToken,
          authUrl,
          instructions,
        },
      };
    }
  );
}
