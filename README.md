# AuraMail

AuraMail is a placement-email assistant for students. It connects to Gmail with read-only access, finds internship and job announcements, extracts the important details, and presents them in a focused opportunity inbox.

**Live app:** [aura-mail-dun.vercel.app](https://aura-mail-dun.vercel.app/)

[Privacy Policy](https://aura-mail-dun.vercel.app/privacy) · [Terms of Service](https://aura-mail-dun.vercel.app/terms) · [Deployment guide](DEPLOY.md)

## What it does

- Authenticates with Google OAuth and keeps sessions alive with access/refresh tokens.
- Syncs relevant Gmail messages in the background and groups related messages into threads.
- Produces detailed AI-assisted summaries instead of reducing long opportunities to a single paragraph.
- Extracts roles, companies, locations, experience, eligibility, deadlines, compensation, and application instructions.
- Keeps useful links from the main email body as clickable links while filtering known promotional/footer links.
- Shows attachment metadata and opens Gmail attachments in a new browser tab.
- Organizes messages by category, priority, deadline, sender, and search terms.
- Lets users add opportunity deadlines to Google Calendar.

## Deployed architecture

| Part | Service | Technology |
|---|---|---|
| Web app | Vercel | Next.js 16, React, TypeScript, Tailwind CSS |
| API and background sync | Render | Go, Chi, Docker |
| Database | Neon | PostgreSQL and Goose migrations |
| AI summaries | OpenAI | GPT-4o mini |
| Authentication | Google | OAuth 2.0, JWT access and refresh tokens |

The frontend is deployed from `frontend/`. The backend is deployed from `backend/` using the repository's `render.yaml` blueprint. See [DEPLOY.md](DEPLOY.md) for the complete production setup.

## Repository layout

```text
AuraMail/
├── backend/       # Go API, Gmail sync, AI processing, auth, and migrations
├── frontend/      # Next.js web application
├── DEPLOY.md      # Production deployment instructions
└── LICENSE        # MIT license
```

## Run locally

### Prerequisites

- Go 1.25+
- Node.js 18+
- pnpm
- PostgreSQL 12+
- A Google Cloud project with Gmail and Calendar APIs enabled
- Google OAuth credentials
- An OpenAI API key for AI summaries

### 1. Clone the repository

```bash
git clone https://github.com/R7rainz/AuraMail.git
cd AuraMail
```

### 2. Configure the backend

Create `backend/.env`:

```bash
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auramail?sslmode=disable
GOOSE_DBSTRING=postgresql://postgres:postgres@localhost:5432/auramail?sslmode=disable
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8080/auth/google/callback
OPENAI_API_KEY=your-openai-key
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000
SYNC_ENABLED=true
SYNC_INTERVAL=30m
SYNC_MAX_RESULTS=25
SYNC_INCLUDE_THREADS=true
```

For the full environment-variable reference, see [backend/README.md](backend/README.md).

### 3. Start the database and backend

```bash
cd backend
make docker-up
make migrate-up
make run
```

The API runs at `http://localhost:8080`.

### 4. Start the frontend

In another terminal:

```bash
cd frontend
pnpm install
printf 'NEXT_PUBLIC_API_URL=http://localhost:8080\n' > .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Common commands

### Backend

```bash
cd backend
make test
make build
make migrate-status
```

### Frontend

```bash
cd frontend
pnpm test
pnpm lint
pnpm build
```

## Google OAuth setup

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the Gmail API and Google Calendar API.
3. Configure the OAuth consent screen and add test users while the app is in testing mode.
4. Create a Web application OAuth client.
5. Add `http://localhost:8080/auth/google/callback` as a local redirect URI.
6. Add the production backend callback URL to the OAuth client before deploying.

AuraMail requests Gmail read access for syncing messages and Calendar access when a user chooses to add an event. Users can review the public [Privacy Policy](https://aura-mail-dun.vercel.app/privacy) and [Terms of Service](https://aura-mail-dun.vercel.app/terms).

## License

AuraMail is released under the [MIT License](LICENSE).

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-change`.
3. Run the relevant backend and frontend checks.
4. Open a pull request with a short description of the change.
