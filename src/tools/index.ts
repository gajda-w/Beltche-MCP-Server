import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAuthorizeTool } from './authorize.tool.js';
import { registerStudentsTool } from './students.tool.js';
import { registerCreateGymTool } from './gym.tool.js';
import { logger } from '../middleware/index.js';

/**
 * Register all MCP tools with the server
 */
export function registerAllTools(server: McpServer): void {
  logger.info('Registering MCP tools...');

  registerAuthorizeTool(server);
  registerStudentsTool(server);
  registerCreateGymTool(server);

  logger.info('All MCP tools registered');
}

export { registerAuthorizeTool } from './authorize.tool.js';
export { registerStudentsTool } from './students.tool.js';
export { registerCreateGymTool } from './gym.tool.js';
