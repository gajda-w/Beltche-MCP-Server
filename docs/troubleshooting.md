# Troubleshooting

## Enable Debug Logs

```bash
NODE_ENV=development npm run dev
```

Logs include:
- Request/response logging
- OAuth flow events
- API calls to Beltche
- Token storage operations

## Common Issues

### "Environment validation failed"

**Cause:** Missing required environment variables.

**Solution:** Check that all required variables are set in `.env`:
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`
- `OAUTH_AUTHORIZE_URL`
- `OAUTH_TOKEN_URL`
- `OAUTH_REDIRECT_BASE`

### "invalid_client"

**Cause:** Wrong OAuth credentials.

**Solution:** Verify `OAUTH_CLIENT_ID` and `OAUTH_CLIENT_SECRET` match your FusionAuth application.

### "Token exchange failed"

**Cause:** FusionAuth configuration issue.

**Solution:** 
- Check that redirect URI is correctly configured in FusionAuth
- Verify `OAUTH_TOKEN_URL` is correct
- Ensure client secret is valid

### "not_authorized"

**Cause:** User hasn't completed OAuth flow.

**Solution:** Call the `authorize` tool first and complete the login flow before calling other tools.

## Getting Help

If you encounter other issues, please [open an issue](https://github.com/gajda-w/Beltche-MCP-Server/issues) on GitHub.
