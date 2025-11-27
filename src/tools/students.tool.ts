import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getOAuthService } from '../auth/oauth.service.js';
import { getBeltcheApiClient } from '../services/beltche.api.js';
import { logger } from '../middleware/index.js';
import { studentSchema } from '../types/student.js';

/**
 * Register the get_students tool
 * Fetches students from Beltche API for authenticated user
 */
export function registerStudentsTool(server: McpServer): void {
  server.registerTool(
    'get_students',
    {
      title: 'Get Students',
      description:
        'Returns a list of students from your Beltche account. You must authorize first using the "authorize" tool and provide the linkToken.',
      inputSchema: {
        linkToken: z
          .string()
          .describe('The linkToken received from the authorize tool'),
      },
      outputSchema: {
        students: z.array(studentSchema).describe('List of students'),
        count: z.number().describe('Total number of students'),
      },
    },
    async ({ linkToken }) => {
      // Validate token
      const oauthService = getOAuthService();
      const tokenData = await oauthService.getValidToken(linkToken);

      console.log('token data::::', tokenData);

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

      // Fetch students
      try {
        const apiClient = getBeltcheApiClient();
        const students = await apiClient.getStudents(tokenData.accessToken);

        console.log('students', students);

        logger.info(
          { linkToken: linkToken.slice(0, 8) + '***', count: students.length },
          'Successfully fetched students'
        );

        // Format response
        const summary = [
          `✅ **Found ${students.length} students**`,
          '',
          ...students
            .slice(0, 10)
            .map(
              (s, i) =>
                `${i + 1}. **${s.first_name} ${s.last_name}** - ${
                  s.email
                } (Belt: ${s.belt_id})`
            ),
          '',
          students.length > 10 ? `_...and ${students.length - 10} more_` : '',
        ].join('\n');

        return {
          content: [{ type: 'text', text: summary }],
          structuredContent: {
            students,
            count: students.length,
          },
        };
      } catch (error) {
        logger.error({ error }, 'Failed to fetch students');

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        return {
          content: [
            {
              type: 'text',
              text: `❌ **Failed to fetch students**\n\nError: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
