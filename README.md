# Beltche MCP Server

> MCP (Model Context Protocol) Server for Beltche - BJJ gym management platform.

Allows AI assistants like ChatGPT to interact with your Beltche account to manage students, trainings, and gym data.

## 🏗️ Architecture

```
src/
├── index.ts              # Entry point
├── server.ts             # Express + MCP server setup
├── config/
│   └── env.ts            # Environment validation (Zod)
├── auth/
│   ├── oauth.service.ts  # OAuth flow logic
│   ├── oauth.routes.ts   # Express routes for OAuth
│   ├── token.store.ts    # Token storage factory
│   ├── memory.token.store.ts  # In-memory implementation
│   └── redis.token.store.ts   # Redis implementation
├── tools/
│   ├── index.ts          # Tool registration
│   ├── authorize.tool.ts # Authorization tool
│   └── students.tool.ts  # Get students tool
├── services/
│   └── beltche.api.ts    # Beltche API client
├── middleware/
│   ├── logger.ts         # Pino logger
│   └── errors.ts         # Error handling
└── types/
    ├── student.ts        # Student types
    └── oauth.ts          # OAuth types
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- OAuth credentials from FusionAuth

### 1. Clone and install

```bash
git clone https://github.com/gajda-w/Beltche-MCP-Server.git
cd Beltche-MCP-Server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your OAuth credentials
```

### 3. Run in development

```bash
npm run dev
```

### 4. Expose with ngrok (for ChatGPT)

```bash
ngrok http 3000
```

Update `OAUTH_REDIRECT_BASE` in `.env` with your ngrok URL and restart the server.

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run docker:build` | Build Docker image |
| `npm run docker:compose` | Start with Docker Compose (includes Redis) |

## 🔧 MCP Tools

### `authorize`

Generates an OAuth authorization URL for user authentication.

**Input:** None

**Output:**
- `linkToken` - Token to use in subsequent API calls
- `authUrl` - URL to open in browser for authorization

### `get_students`

Fetches students from Beltche API.

**Input:**
- `linkToken` - The linkToken received from authorize tool

**Output:**
- `students` - Array of student objects
- `count` - Total number of students

## 🔐 OAuth Flow

```
┌──────────┐     ┌─────────────┐     ┌────────────┐
│ ChatGPT  │     │ MCP Server  │     │ FusionAuth │
└────┬─────┘     └──────┬──────┘     └─────┬──────┘
     │                  │                  │
     │ call "authorize" │                  │
     ├─────────────────>│                  │
     │                  │                  │
     │ return authUrl + │                  │
     │ linkToken        │                  │
     │<─────────────────┤                  │
     │                  │                  │
     │ user clicks URL  │                  │
     ├──────────────────┼─────────────────>│
     │                  │                  │
     │                  │  redirect with   │
     │                  │  code            │
     │                  │<─────────────────┤
     │                  │                  │
     │                  │ exchange code    │
     │                  │ for token        │
     │                  ├─────────────────>│
     │                  │                  │
     │                  │ access_token     │
     │                  │<─────────────────┤
     │                  │                  │
     │ call "get_students"                 │
     │ with linkToken   │                  │
     ├─────────────────>│                  │
     │                  │                  │
     │                  │ fetch students   │
     │                  ├─────────────────>│ Beltche API
     │                  │<─────────────────┤
     │                  │                  │
     │ students data    │                  │
     │<─────────────────┤                  │
```

## 🐳 Docker

### Development with Docker Compose

```bash
# Start server + Redis
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production build

```bash
docker build -t beltche-mcp-server .
docker run -p 3000:3000 --env-file .env beltche-mcp-server
```

## 🛡️ Security

- **Token storage:** Uses Redis in production, in-memory for development
- **Secrets redaction:** Pino logger automatically redacts sensitive fields
- **Rate limiting:** 100 requests per minute per IP
- **HTTPS:** Required in production (use ngrok for development)
- **OAuth PKCE:** Consider implementing for additional security

## 📊 Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/mcp` | POST | MCP protocol endpoint |
| `/auth/callback` | GET | OAuth callback |

## 🔍 Debugging

### Enable debug logs

```bash
NODE_ENV=development npm run dev
```

### View all logs

Logs include:
- Request/response logging
- OAuth flow events
- API calls to Beltche
- Token storage operations

### Common issues

1. **"Environment validation failed"** - Missing required env vars
2. **"invalid_client"** - Wrong OAuth credentials
3. **"Token exchange failed"** - Check FusionAuth configuration
4. **"not_authorized"** - User needs to complete OAuth flow

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OAUTH_CLIENT_ID` | ✅ | - | FusionAuth client ID |
| `OAUTH_CLIENT_SECRET` | ✅ | - | FusionAuth client secret |
| `OAUTH_AUTHORIZE_URL` | ✅ | - | FusionAuth authorize URL |
| `OAUTH_TOKEN_URL` | ✅ | - | FusionAuth token URL |
| `OAUTH_REDIRECT_BASE` | ✅ | - | Base URL for OAuth callback |
| `OAUTH_SCOPE` | ❌ | `openid profile email` | OAuth scopes |
| `PORT` | ❌ | `3000` | Server port |
| `NODE_ENV` | ❌ | `development` | Environment |
| `REDIS_URL` | ❌ | - | Redis URL for token storage |
| `BELTCHE_API_BASE_URL` | ❌ | `https://beltche.com/api/v1` | Beltche API URL |

## 📄 License

ISC
