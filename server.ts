import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import * as z from 'zod/v4';
import crypto from 'crypto';
import 'dotenv/config';

// In-memory token storage (use database + encryption in production)
interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}
const tokenStore = new Map<string, TokenData>();

// Helper to generate unique link tokens
function generateLinkToken(): string {
  return crypto.randomUUID();
}

// Create an MCP server
const server = new McpServer({
  name: 'beltche-mcp-server',
  version: '1.0.0',
});

// Tool: Authorize - Returns OAuth URL for user to authenticate
server.registerTool(
  'authorize',
  {
    title: 'Authorize',
    description: 'Get authorization URL to connect your Beltche account',
    inputSchema: {},
    outputSchema: {
      linkToken: z.string(),
      authUrl: z.string(),
      instructions: z.string(),
    },
  },
  async () => {
    const linkToken = generateLinkToken();
    const redirectUri = `${process.env.OAUTH_REDIRECT_BASE}/auth/callback`;
    const authUrl = `${
      process.env.OAUTH_AUTHORIZE_URL
    }?response_type=code&client_id=${encodeURIComponent(
      process.env.OAUTH_CLIENT_ID!
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${encodeURIComponent(linkToken)}&scope=${encodeURIComponent(
      'openid profile email'
    )}`;

    const output = {
      linkToken,
      authUrl,
      instructions: `Click this URL to authorize: ${authUrl}\n\nAfter authorizing, use this linkToken in get_students: ${linkToken}`,
    };

    return {
      content: [{ type: 'text', text: output.instructions }],
      structuredContent: output,
    };
  }
);

// Add a tool to get students
server.registerTool(
  'get_students',
  {
    title: 'Get Students',
    description:
      'Returns a list of students from Beltche. You must authorize first and provide the linkToken.',
    inputSchema: { linkToken: z.string() },
    outputSchema: {
      students: z.array(
        z.object({
          id: z.string(),
          first_name: z.string(),
          last_name: z.string(),
          email: z.string(),
          user_id: z.string(),
          year_of_birth: z.string(),
          belt_id: z.number(),
          image: z.string(),
          is_injured: z.boolean(),
          is_competitor: z.boolean(),
        })
      ),
    },
  },
  async ({ linkToken }) => {
    // Check if token exists
    const tokenData = tokenStore.get(linkToken);
    if (!tokenData) {
      return {
        content: [
          {
            type: 'text',
            text: 'No authorization found for this linkToken. Please call the "authorize" tool first and complete the OAuth flow.',
          },
        ],
        structuredContent: { error: 'not_authorized' },
      };
    }

    // Fetch students from Beltche API
    try {
      const response = await fetch('https://beltche.com/api/v1/students', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch students:', response.status, errorText);
        return {
          content: [
            {
              type: 'text',
              text: `Failed to fetch students: ${response.status} ${response.statusText}`,
            },
          ],
          structuredContent: { error: 'fetch_failed', status: response.status },
        };
      }

      const students = await response.json();
      return {
        content: [
          { type: 'text', text: JSON.stringify({ students }, null, 2) },
        ],
        structuredContent: { students },
      };
    } catch (error) {
      console.error('Error fetching students:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching students: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          },
        ],
        structuredContent: { error: 'exception' },
      };
    }
  }
);

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

// OAuth Callback endpoint - receives authorization code and exchanges for token
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    console.error('Missing code or state in callback');
    return res.status(400).send('Missing code or state parameter');
  }

  const linkToken = String(state);

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(process.env.OAUTH_TOKEN_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: `${process.env.OAUTH_REDIRECT_BASE}/auth/callback`,
        client_id: process.env.OAUTH_CLIENT_ID!,
        client_secret: process.env.OAUTH_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorBody);
      return res.status(500).send(`Token exchange failed: ${errorBody}`);
    }

    const tokenJson: any = await tokenResponse.json();
    const accessToken = tokenJson.access_token;
    const refreshToken = tokenJson.refresh_token;
    const expiresIn = tokenJson.expires_in;

    if (!accessToken) {
      console.error('No access_token in response:', tokenJson);
      return res.status(500).send('No access token received');
    }

    // Store token with linkToken
    tokenStore.set(linkToken, {
      accessToken,
      refreshToken,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
    });

    console.log(`✅ Authorization successful for linkToken: ${linkToken}`);

    // Success page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Complete</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          h1 { color: #4CAF50; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>✅ Authorization Complete!</h1>
        <p>You can now close this page and return to ChatGPT.</p>
        <p>Your linkToken: <code>${linkToken}</code></p>
        <p>Use this linkToken when calling <strong>get_students</strong>.</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error during token exchange:', error);
    res
      .status(500)
      .send(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
  }
});

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
