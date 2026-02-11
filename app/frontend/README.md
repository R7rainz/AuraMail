# AuraMail Frontend

Next.js frontend for AuraMail - the AI-powered placement email analyzer.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - UI components
- **Lucide Icons** - Icon library

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features and pricing |
| `/auth` | Google OAuth login |
| `/auth/callback` | OAuth callback handler |
| `/dashboard` | Main email dashboard |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running at `http://localhost:8080`

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   ├── page.tsx          # Login page
│   │   └── callback/
│   │       └── page.tsx      # OAuth callback
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard
│   └── lib/
│       ├── auth.ts           # Auth utilities
│       └── authContext.tsx   # Auth provider
├── components/
│   └── ui/                   # shadcn/ui components
└── middleware.ts             # Auth page caching
```

## Features

### Landing Page
- Animated light beams background
- Feature cards with spotlight hover effects
- Pricing section
- Responsive design

### Dashboard
- Email list with category filtering
- Sort by date, priority, company, deadline
- Search functionality
- Email detail view with:
  - AI-generated summary
  - Key details grid (deadline, location, salary, eligibility)
  - Quick actions (Apply, Add to Calendar)
  - Related links extraction

### Authentication
- Google OAuth integration
- JWT token management
- Auto-refresh on token expiry
- Protected routes with middleware

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Styling

The app uses a dark theme with Catppuccin-inspired colors:

```typescript
const colors = {
  bg: "#0a0a0f",
  bgSurface: "#12121a",
  fg: "#e4e4e7",
  fgDim: "#71717a",
  blue: "#60a5fa",
  green: "#4ade80",
  yellow: "#fbbf24",
  red: "#f87171",
  // ...
}
```

## License

MIT
