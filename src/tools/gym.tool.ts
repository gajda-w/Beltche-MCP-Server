import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getOAuthService } from '../auth/oauth.service.js';
import { getBeltcheApiClient } from '../services/beltche.api.js';
import { logger } from '../middleware/index.js';
import { gymSchema } from '../types/gym.js';

/**
 * Register the create_gym tool
 * Creates a new gym in Beltche
 */
export function registerCreateGymTool(server: McpServer): void {
  server.registerTool(
    'create_gym',
    {
      title: 'Create Gym',
      description:
        'Creates a new gym/club in your Beltche account. You must authorize first using the "authorize" tool and provide the linkToken.',
      inputSchema: {
        linkToken: z
          .string()
          .describe('The linkToken received from the authorize tool'),
        name: z.string().describe('Name of the gym'),
        city: z.string().describe('City where the gym is located'),
        street: z.string().describe('Street address'),
        zipcode: z.string().describe('Postal/ZIP code'),
        email: z.string().describe('Contact email'),
        phone: z.string().describe('Contact phone number'),
        payment_day: z
          .number()
          .min(1)
          .max(31)
          .describe('Day of month for payments (1-31)'),
        description: z.string().optional().describe('Description of the gym'),
        website: z.string().optional().describe('Website URL'),
        facebook_url: z.string().optional().describe('Facebook page URL'),
        instagram_url: z.string().optional().describe('Instagram profile URL'),
        currency: z
          .string()
          .optional()
          .default('PLN')
          .describe('Currency code (e.g., PLN, EUR, USD)'),
        currency_symbol: z
          .string()
          .optional()
          .default('zł')
          .describe('Currency symbol'),
        currency_position: z
          .enum(['before', 'after'])
          .optional()
          .default('after')
          .describe('Position of currency symbol'),
      },
      outputSchema: {
        gym: gymSchema.describe('Created gym data'),
        success: z
          .boolean()
          .describe('Whether the gym was created successfully'),
      },
    },
    async ({ linkToken, ...gymData }) => {
      // Validate token
      const oauthService = getOAuthService();
      const tokenData = await oauthService.getValidToken(linkToken);

      if (!tokenData) {
        logger.warn(
          { linkToken: linkToken.slice(0, 8) + '***' },
          'Invalid or expired linkToken'
        );

        const errorMessage = [
          '❌ **Authorization Required**',
          '',
          'No valid authorization found for this linkToken.',
          '',
          'Please:',
          '1. Call the `authorize` tool to get a new authorization URL',
          '2. Complete the authorization in your browser',
          '3. Use the new linkToken to call this tool',
        ].join('\n');

        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
        };
      }

      // Create gym
      try {
        const apiClient = getBeltcheApiClient();
        const gym = await apiClient.createGym(tokenData.accessToken, gymData);

        logger.info(
          {
            linkToken: linkToken.slice(0, 8) + '***',
            gymId: gym.id,
            gymName: gym.name,
          },
          'Successfully created gym'
        );

        // Format response
        const summary = [
          `✅ **Gym "${gym.name}" created successfully!**`,
          '',
          '**Details:**',
          `- **ID:** ${gym.id}`,
          `- **Name:** ${gym.name}`,
          `- **Address:** ${gym.street}, ${gym.zipcode} ${gym.city}`,
          `- **Email:** ${gym.email}`,
          `- **Phone:** ${gym.phone}`,
          `- **Payment Day:** ${gym.payment_day}`,
          `- **Currency:** ${gym.currency_symbol} (${gym.currency})`,
        ];

        if (gym.website) {
          summary.push(`- **Website:** ${gym.website}`);
        }
        if (gym.description) {
          summary.push(`- **Description:** ${gym.description}`);
        }

        return {
          content: [{ type: 'text', text: summary.join('\n') }],
          structuredContent: {
            gym,
            success: true,
          },
        };
      } catch (error) {
        logger.error(
          { error, linkToken: linkToken.slice(0, 8) + '***' },
          'Failed to create gym'
        );

        const errorMessage = [
          '❌ **Failed to create gym**',
          '',
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          '',
          'Please check your input data and try again.',
        ].join('\n');

        return {
          content: [{ type: 'text', text: errorMessage }],
          isError: true,
        };
      }
    }
  );

  logger.debug('Registered create_gym tool');
}
