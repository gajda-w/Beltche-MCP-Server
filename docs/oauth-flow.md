# OAuth Flow

## Overview

The MCP server uses OAuth 2.0 with FusionAuth for user authentication.

## Flow Diagram

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

## Step-by-step

1. **User calls `authorize` tool** - MCP server generates a unique `linkToken` and authorization URL
2. **User opens URL** - Redirected to FusionAuth login page
3. **User authenticates** - FusionAuth redirects back with authorization code
4. **Token exchange** - MCP server exchanges code for access token
5. **Token stored** - Access token is stored with `linkToken` as key
6. **Subsequent calls** - User provides `linkToken` to authenticate API calls

## Security Considerations

- Consider implementing PKCE for additional security
- Tokens are stored in Redis (production) or memory (development)
- All sensitive fields are automatically redacted in logs
