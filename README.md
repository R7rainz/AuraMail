# AuraMail

AI-powered placement email analyzer for students. Syncs with Gmail, summarizes emails with OpenAI, and helps you never miss a deadline.

## Features

- **Gmail Integration** - Securely sync placement emails via Google OAuth
- **AI Summaries** - GPT-4 powered email analysis and categorization
- **Smart Extraction** - Automatically extracts company, role, deadline, salary, eligibility
- **Google Calendar** - One-click deadline sync to your calendar
- **Real-time Updates** - SSE streaming for live email processing
- **Beautiful Dashboard** - Modern UI with category filters, priority sorting, and detailed views

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Go 1.21+, Chi router, PostgreSQL |
| **AI** | OpenAI GPT-4 Mini |
| **Auth** | Google OAuth 2.0, JWT |
| **Database** | PostgreSQL with Goose migrations |

## Project Structure

```
AuraMail/
├── app/
│   ├── backend/          # Go backend API
│   │   ├── cmd/          # Entry point
│   │   ├── internal/     # Core logic (auth, gmail, ai, calendar)
│   │   └── migrations/   # Database migrations
│   └── frontend/         # Next.js frontend
│       └── src/app/      # App router pages
└── packages/
    └── database/         # Shared database package
```

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 12+
- Google Cloud project with OAuth credentials
- OpenAI API key

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/auramail.git
cd auramail
```

### 2. Configure Environment

**Backend** (`app/backend/.env`):
```bash
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auramail
JWT_SECRET=your-jwt-secret
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8080/auth/google/callback
OPENAI_API_KEY=your-openai-key
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend** (`app/frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Start Database

```bash
cd app/backend
make docker-up      # Start PostgreSQL
make migrate-up     # Run migrations
```

### 4. Run the App

**Terminal 1 - Backend:**
```bash
cd app/backend
make dev
```

**Terminal 2 - Frontend:**
```bash
cd app/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/auth/google` | Start OAuth flow |
| `GET` | `/auth/google/callback` | OAuth callback |
| `POST` | `/auth/refresh` | Refresh access token |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/emails` | Get email summaries |
| `GET` | `/emails/sync` | Sync new emails |
| `GET` | `/emails/stream` | SSE stream for processing |
| `POST` | `/calendar/events` | Add event to calendar |

## Email Categories

AuraMail automatically categorizes emails into:

- Internships
- Job Offers
- PPT (Pre-Placement Talks)
- Workshops
- Exams
- Interviews
- Results
- Reminders
- Announcements
- Registration

## Development

### Backend Commands

```bash
make dev            # Run with hot reload
make build          # Build binary
make test           # Run tests
make migrate-up     # Apply migrations
make migrate-down   # Rollback migration
make lint           # Run linter
```

### Frontend Commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm run lint        # Run ESLint
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Gmail API + Calendar API
3. Configure OAuth consent screen (External, test users)
4. Create OAuth 2.0 credentials (Web application)
5. Add redirect URI: `http://localhost:8080/auth/google/callback`
6. Copy credentials to `.env`

## Screenshots

### Landing Page
Modern landing page with animated light beams and feature highlights.

### Dashboard
Email list with category sidebar, priority indicators, and quick actions.

### Email Detail
Expanded view with AI summary, key details grid, and calendar integration.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request
