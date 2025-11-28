# Beltche MCP Server

> MCP (Model Context Protocol) Server for [Beltche](https://beltche.com) - BJJ gym management platform.

Allows AI assistants like ChatGPT to interact with your Beltche account to manage students, trainings, and gym data.

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/gajda-w/Beltche-MCP-Server.git
cd Beltche-MCP-Server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your OAuth credentials

# Run
npm run dev
```

For ChatGPT integration, expose with ngrok: `ngrok http 3000`

## 🔧 MCP Tools

| Tool | Description |
|------|-------------|
| `authorize` | Generates OAuth URL, returns `linkToken` + `authUrl` |
| `get_students` | Fetches students (requires `linkToken`) |

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm test` | Run tests |

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OAUTH_CLIENT_ID` | ✅ | FusionAuth client ID |
| `OAUTH_CLIENT_SECRET` | ✅ | FusionAuth client secret |
| `OAUTH_AUTHORIZE_URL` | ✅ | FusionAuth authorize URL |
| `OAUTH_TOKEN_URL` | ✅ | FusionAuth token URL |
| `OAUTH_REDIRECT_BASE` | ✅ | Base URL for OAuth callback |
| `REDIS_URL` | ❌ | Redis URL (production) |

## 📚 Documentation

- [OAuth Flow](docs/oauth-flow.md) - Authentication flow details
- [Docker Setup](docs/docker.md) - Container deployment
- [Troubleshooting](docs/troubleshooting.md) - Common issues & debugging

## 📄 License

ISC
