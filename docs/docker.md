# Docker Setup

## Development with Docker Compose

Docker Compose starts the MCP server with Redis for token storage.

```bash
# Start server + Redis
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Production Build

```bash
# Build image
docker build -t beltche-mcp-server .

# Run container
docker run -p 3000:3000 --env-file .env beltche-mcp-server
```

## Environment Variables

Make sure to set all required environment variables. See [Environment Variables](../README.md#-environment-variables) in the main README.

## Redis Configuration

In production, set `REDIS_URL` to use Redis for token storage:

```bash
REDIS_URL=redis://localhost:6379
```

Without Redis, tokens are stored in memory (suitable for development only).
