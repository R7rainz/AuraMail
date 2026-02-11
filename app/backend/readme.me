# AuraMail Backend

A Go-based backend service for AuraMail that provides Gmail integration, AI-powered email summarization, and Google Calendar sync.

## Features

- **Google OAuth 2.0** - Secure authentication with Gmail access
- **JWT Authentication** - Access & refresh token management
- **Gmail Integration** - Read-only access to placement/job emails
- **AI Summaries** - OpenAI-powered email analysis and categorization
- **Google Calendar** - Add deadlines and events to your calendar
- **SSE Streaming** - Real-time email processing updates
- **PostgreSQL** - Persistent storage with goose migrations

## Quick Start

### Prerequisites

- Go 1.21+
- PostgreSQL 12+
- [Goose](https://github.com/pressly/goose) for migrations
- Google Cloud Console project with OAuth 2.0 credentials
- OpenAI API key (optional, enables AI features)

### Installation

```bash
# Clone and navigate to backend
cd app/backend

# Install dependencies
go mod download && go mod tidy

# Install development tools (goose, air)
make tools
```

### Environment Variables

Create a `.env` file in the project root:

```bash
# Server
PORT=8080
ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auramail
GOOSE_DBSTRING=postgresql://postgres:postgres@localhost:5432/auramail

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8080/auth/google/callback

# OpenAI (optional - enables AI summaries)
OPENAI_API_KEY=your-openai-api-key

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Email Query (optional - customize which emails to fetch)
DEFAULT_EMAIL_QUERY=from:placementoffice@vitbhopal.ac.in OR subject:placement
```

### Database Setup

```bash
# Start PostgreSQL (using Docker)
make docker-up

# Run migrations
make migrate-up

# Check migration status
make migrate-status
```

### Running the Server

```bash
# Development with hot reload (requires air)
make dev

# Or standard run
make run

# Or build and run binary
make build
./backend
```

Server starts at `http://localhost:8080`

## Database Migrations

This project uses [Goose](https://github.com/pressly/goose) for database migrations.

### Commands

| Command | Description |
|---------|-------------|
| `make migrate-up` | Apply all pending migrations |
| `make migrate-down` | Rollback the last migration |
| `make migrate-status` | Show current migration status |
| `make migrate-create` | Create a new migration file |
| `make tools` | Install goose and other dev tools |

### Migration Files

Located in `migrations/`:
- `20260108143600_create_users.sql` - Users table
- `20260108143625_add_email_summaries.sql` - Email summaries table

### Creating New Migrations

```bash
make migrate-create
# Enter migration name when prompted
# Edit the generated SQL file in migrations/
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
GET  /auth/google           # Initiate Google OAuth
GET  /auth/google/callback  # OAuth callback
POST /auth/refresh          # Refresh access token
GET  /auth/me               # Get current user (requires auth)
POST /auth/logout           # Logout (requires auth)
```

### Emails
```
GET /emails        # Get stored email summaries (requires auth)
GET /emails/sync   # Sync and process new emails (requires auth)
GET /emails/stream # SSE stream for real-time processing (requires auth)
```

### Calendar
```
GET    /calendar/events  # Get upcoming events (requires auth)
POST   /calendar/events  # Add event to calendar (requires auth)
DELETE /calendar/events  # Remove event from calendar (requires auth)
```

## Project Structure

```
app/backend/
├── cmd/
│   └── backend/
│       └── main.go           # Application entry point
├── internal/
│   ├── ai/                   # OpenAI integration
│   │   ├── ai.go            # Validation
│   │   └── summarizer.go    # Email analysis
│   ├── auth/                 # JWT authentication
│   │   ├── handler.go       # Auth endpoints
│   │   ├── jwt.go           # Token generation/validation
│   │   ├── middleware.go    # Auth middleware
│   │   └── google/          # Google OAuth
│   ├── calendar/            # Google Calendar integration
│   ├── cache/               # Email caching
│   ├── config/              # Configuration loading
│   ├── gmail/               # Gmail API integration
│   │   ├── handler.go       # Email endpoints
│   │   └── service.go       # Email sync logic
│   ├── middleware/          # Rate limiting, validation
│   ├── response/            # HTTP response helpers
│   ├── scheduler/           # Background jobs
│   ├── server/              # HTTP server setup
│   ├── user/                # User repository
│   └── utils/               # Gmail parsing utilities
├── migrations/              # Goose SQL migrations
├── doc/                     # API documentation
├── Makefile                 # Build and dev commands
└── go.mod                   # Go module definition
```

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make build` | Build the backend binary |
| `make run` | Run the backend |
| `make dev` | Run with hot reload (requires air) |
| `make test` | Run all tests |
| `make test-coverage` | Run tests with coverage report |
| `make clean` | Remove build artifacts |
| `make migrate-up` | Run database migrations |
| `make migrate-down` | Rollback last migration |
| `make migrate-status` | Show migration status |
| `make migrate-create` | Create a new migration |
| `make tools` | Install dev tools (air, goose) |
| `make tidy` | Tidy go.mod |
| `make docker-up` | Start Docker containers |
| `make docker-down` | Stop Docker containers |
| `make fmt` | Format code |
| `make lint` | Run linter |

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `USER_NOT_FOUND` | User doesn't exist |
| `INVALID_REFRESH_TOKEN` | Refresh token expired or invalid |
| `GMAIL_API_ERROR` | Failed to fetch from Gmail |
| `GMAIL_AUTH_FAILED` | Gmail authorization expired |
| `NO_EMAILS_FOUND` | No emails match the query |

## Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API and Google Calendar API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URI: `http://localhost:8080/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### OpenAI Setup (Optional)

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add `OPENAI_API_KEY` to `.env`
3. The AI features will automatically activate

Without OpenAI key, the sync endpoint will return an error prompting configuration.

## Documentation

See the `doc/` folder for detailed documentation:
- `README.md` - Project overview
- `ARCHITECTURE.md` - System design
- `API_ENDPOINTS.md` - Complete API reference
- `AUTHENTICATION.md` - Auth flows
- `SETUP.md` - Development setup
- `GOOGLE_OAUTH.md` - OAuth configuration
- `DATABASE.md` - Database schema

## License

MIT
