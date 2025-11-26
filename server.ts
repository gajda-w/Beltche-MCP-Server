import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import * as z from 'zod/v4';

// Create an MCP server
const server = new McpServer({
  name: 'demo-server',
  version: '1.0.0',
});

// Add a tool to get students
server.registerTool(
  'get_students',
  {
    title: 'Get Students',
    description: 'Returns a list of students',
    inputSchema: {},
    outputSchema: {
      students: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          age: z.number(),
          gym: z.string(),
        })
      ),
    },
  },
  async () => {
    const output = {
      students: [
        { id: 1, name: 'Jan Kowalski', age: 21, gym: 'Ipanema' },
        { id: 2, name: 'Anna Nowak', age: 22, gym: 'Ipanema' },
        { id: 3, name: 'Piotr Wiśniewski', age: 20, gym: 'Ipanema' },
        { id: 4, name: 'Maria Wójcik', age: 23, gym: 'Ipanema' },
      ],
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
      structuredContent: output,
    };
  }
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
  console.log('Incoming request:', JSON.stringify(req.body, null, 2));
  // Create a new transport for each request to prevent request ID collisions
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '3000');
app
  .listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
  })
  .on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
