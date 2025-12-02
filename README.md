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
| `create_gym` | Creates a new gym/club (requires `linkToken`) |

## 📊 API Coverage

Table showing which Beltche API endpoints are currently supported by MCP Server:

### Gyms

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Create gym | `POST /api/v1/gyms` | ✅ | `create_gym` |
| Get all gyms | `GET /api/v1/gyms` | ❌ | - |
| Get gym by ID | `GET /api/v1/gyms/{id}` | ❌ | - |
| Update gym | `PUT /api/v1/gyms/{id}` | ❌ | - |
| Delete gym | `DELETE /api/v1/gyms` | ❌ | - |

### Students

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Get all students | `GET /api/v1/students` | ✅ | `get_students` |
| Create student | `POST /api/v1/students` | ❌ | - |
| Update student | `PUT /api/v1/students/{studentID}` | ❌ | - |
| Delete student | `DELETE /api/v1/students` | ❌ | - |
| Get student by ID | `GET /api/v1/students/{studentID}` | ❌ | - |
| Promote student | `GET /api/v1/students/{studentID}/promote` | ❌ | - |
| Get my attendance | `GET /api/v1/students/my-attendance` | ❌ | - |

### Classes

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Get all classes | `GET /api/v1/gyms/{id}/class` | ❌ | - |
| Get class by ID | `GET /api/v1/gyms/{id}/class/{classid}` | ❌ | - |
| Get today's classes | `GET /api/v1/gyms/{id}/classes/today` | ❌ | - |
| Create class | `POST /api/v1/gyms/{id}/class` | ❌ | - |
| Update class | `PUT /api/v1/gyms/{id}/class/{classid}` | ❌ | - |
| Delete class | `DELETE /api/v1/gyms/{id}/class` | ❌ | - |
| Record attendance | `POST /api/v1/gyms/{id}/class/{classid}/presence` | ❌ | - |
| Check attendance | `GET /api/v1/gyms/{id}/class/{classid}/presence` | ❌ | - |

### Class Notes

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Create note | `POST /api/v1/gyms/{id}/class/{classid}/note` | ❌ | - |
| Get note | `GET /api/v1/gyms/{id}/class/{classid}/note` | ❌ | - |
| Update note | `PUT /api/v1/gyms/{id}/class/{classid}/note/{noteid}` | ❌ | - |
| Delete note | `DELETE /api/v1/gyms/{id}/class/{classid}/note/{noteid}` | ❌ | - |

### Sparring

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Create sparring | `POST /api/v1/gyms/{id}/class/{classid}/sparring` | ❌ | - |
| Get sparrings | `GET /api/v1/gyms/{id}/class/{classid}/sparring` | ❌ | - |
| Delete sparring | `DELETE /api/v1/gyms/{id}/class/{classid}/sparring/{sparringid}` | ❌ | - |

### Level Groups

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Get level groups | `GET /api/v1/gyms/{id}/levelgroup` | ❌ | - |
| Create level group | `POST /api/v1/gyms/{id}/levelgroup` | ❌ | - |
| Update group | `PUT /api/v1/gyms/{id}/levelgroup/{group_id}` | ❌ | - |
| Delete group | `DELETE /api/v1/gyms/{id}/levelgroup/{group_id}` | ❌ | - |
| Add students to group | `POST /api/v1/gyms/{id}/levelgroup/{group_id}/student` | ❌ | - |

### Membership Plans

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Get plans | `GET /api/v1/gyms/{id}/membership-plans` | ❌ | - |
| Get plan by ID | `GET /api/v1/gyms/{id}/membership-plans/{planId}` | ❌ | - |
| Create plan | `POST /api/v1/gyms/{id}/membership-plans` | ❌ | - |
| Update plan | `PUT /api/v1/gyms/{id}/membership-plans/{planId}` | ❌ | - |
| Delete plan | `DELETE /api/v1/gyms/{id}/membership-plans/{planId}` | ❌ | - |

### Memberships

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Get gym memberships | `GET /api/v1/gyms/{id}/memberships` | ❌ | - |
| Get student memberships | `GET /api/v1/gyms/{id}/memberships/student/{studentId}` | ❌ | - |
| Assign membership | `POST /api/v1/gyms/{id}/memberships/assign` | ❌ | - |
| Get membership by ID | `GET /api/v1/gyms/{id}/memberships/{membershipId}` | ❌ | - |
| Extend membership | `POST /api/v1/gyms/{id}/memberships/{membershipId}/extend` | ❌ | - |

### Payments

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Create payment | `POST /api/v1/gyms/{id}/payment` | ❌ | - |
| Get student payments | `GET /api/v1/gyms/{id}/student/{student_id}/payment` | ❌ | - |
| Student payment history | `GET /api/v1/gyms/{id}/payment-history/student/{studentId}` | ❌ | - |
| Handle membership payment | `GET /api/v1/gyms/{id}/memberships/{membershipId}/payment` | ❌ | - |

### Notifications

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Create notification | `POST /api/v1/gyms/{id}/notifications` | ❌ | - |
| Get gym notifications | `GET /api/v1/gyms/{id}/notifications` | ❌ | - |
| Get user notifications | `GET /api/v1/gyms/{id}/user-notifications` | ❌ | - |
| Mark as read | `PUT /api/v1/gyms/{id}/notifications/{notificationId}/read` | ❌ | - |

### Registration

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Get pending registrations | `GET /api/v1/registration/gym/{gymId}/pending` | ❌ | - |
| Approve registration | `POST /api/v1/registration/request/{requestId}/approve` | ❌ | - |
| Reject registration | `POST /api/v1/registration/request/{requestId}/reject` | ❌ | - |

### Clothing Orders

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Create campaign | `POST /api/v1/clothing-orders` | ❌ | - |
| Get campaigns | `GET /api/v1/clothing-orders` | ❌ | - |
| Get campaign orders | `GET /api/v1/clothing-orders/{id}/orders` | ❌ | - |
| Active campaigns for student | `GET /api/v1/clothing-orders/active` | ❌ | - |

### Others

| Endpoint | Method | Status | MCP Tool |
|----------|--------|--------|----------|
| Get belt rankings | `GET /api/v1/beltrank` | ❌ | - |
| Get class tags | `GET /api/v1/gyms/tags` | ❌ | - |

**Legend:**
- ✅ Supported
- ❌ Not yet supported

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
