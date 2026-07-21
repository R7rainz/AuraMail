# Deploying AuraMail for free

Three services, no credit card required anywhere:

| Piece | Host | Free tier |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Hobby — no sleep |
| Backend (Go) | **Render** | 750 h/month, sleeps after 15 min idle |
| Postgres | **Neon** | 0.5 GB, autosuspends after 5 min, wakes in ~1 s |
| Keep-alive | **cron-job.org** | Free scheduled GET |

The only thing that costs money is the **OpenAI API key** the summariser needs.
Everything else is $0.

**Why Render and not Koyeb or Fly.io.** Fly.io removed its permanent free tier
in 2024. Koyeb closed its free tier to new signups in 2026 after being acquired
by Mistral — existing accounts keep their plans, but new ones must pick a paid
plan. Render is what is left that needs no card.

Render's free instance sleeps after 15 minutes and takes 30–50 s to wake, which
would be painful on a login. The fix is arithmetic: **750 free hours covers a
720-hour month**, so a keep-alive ping every 10 minutes keeps one service up
continuously and still fits inside the allowance. Step 5 sets that up. Done
right, the cold start never happens and the background sync scheduler runs.

Deploy in this order — each step needs a URL from the one before it.

---

## 1. Database — Neon

1. Create a project at [neon.tech](https://neon.tech), region closest to your users.
2. Copy the connection string. It looks like:

   ```
   postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

**Neon requires TLS.** Keep `?sslmode=require` on the end — without it the
backend fails at startup with a connection error, and `goose` fails before that.

Migrations run automatically: `entrypoint.sh` executes `goose up` on every boot
whenever `GOOSE_DBSTRING` is set. Goose is idempotent, so repeated cold starts
are safe.

---

## 2. Backend — Render

The repo has a `render.yaml` blueprint, so the build settings come across
automatically.

**Dashboard → New → Blueprint → pick this repo.** Render reads `render.yaml`,
creates `auramail-backend` as a free Docker web service rooted at `backend/`,
and prompts for every secret marked `sync: false`.

Prefer clicking through it by hand? **New → Web Service**, then:

| Setting | Value |
|---|---|
| Language | **Docker** |
| Root Directory | `backend` |
| Dockerfile Path | `./Dockerfile` |
| Health Check Path | `/health` |
| Instance Type | Free |

Render injects its own `PORT`, and `config.go` already reads it
(`getEnvDefault("PORT", "8080")`), so the app binds correctly with no change.

### Environment variables

Set these under **Environment** — use **Secret** for anything with a credential
in it:

```bash
DATABASE_URL=postgresql://USER:PASS@ep-xxx.neon.tech/neondb?sslmode=require

# goose uses key=value form, not a URL
GOOSE_DBSTRING=user=USER password=PASS host=ep-xxx.neon.tech port=5432 dbname=neondb sslmode=require
GOOSE_DRIVER=postgres

JWT_SECRET=<openssl rand -base64 32>
JWT_REFRESH_SECRET=<openssl rand -base64 32>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_OAUTH_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com

OPENAI_API_KEY=sk-xxx

NODE_ENV=production
SYNC_ENABLED=true
SYNC_INTERVAL=30m
```

Three more depend on URLs you do not have yet. Set them to placeholders **now**
and correct them in step 4:

```bash
# Must be non-empty or the service will not boot — see below.
GOOGLE_OAUTH_REDIRECT_URI=https://placeholder.onrender.com/auth/google/callback
FRONTEND_URL=https://placeholder.vercel.app
ALLOWED_ORIGINS=https://placeholder.vercel.app
```

> **Do not leave `GOOGLE_OAUTH_REDIRECT_URI` blank.** `Config.Validate()` in
> `internal/config/config.go` rejects an empty value along with the client ID and
> secret, so the process exits before it binds a port and the deploy fails with
> `google OAuth client configuration is required`. The same applies to
> `DATABASE_URL` and `JWT_SECRET`. A wrong-but-present URL boots fine; only
> sign-in is broken until step 4 corrects it.

Generate both JWT secrets with:

```bash
openssl rand -base64 32
```

Use **different** values for `JWT_SECRET` and `JWT_REFRESH_SECRET`. Reusing one
means a stolen access token can mint refresh tokens.

---

## 3. Frontend — Vercel

Import the repo at [vercel.com/new](https://vercel.com/new):

| Setting | Value |
|---|---|
| Framework | Next.js (auto-detected) |
| **Root Directory** | **`frontend`** |
| Build command | default |

Setting Root Directory to `frontend` is required — this is a monorepo, and
Vercel builds from the repo root otherwise and finds no Next.js app.

### Environment variables

```bash
NEXT_PUBLIC_API_URL=https://<render-app>.onrender.com
NEXT_PUBLIC_SITE_URL=https://<vercel-app>.vercel.app
```

`NEXT_PUBLIC_*` values are **inlined into the client bundle at build time**, not
read at runtime. Changing either one requires a **redeploy** — restarting is not
enough. This is also why `frontend/Dockerfile` takes `NEXT_PUBLIC_API_URL` as a
build `ARG` rather than a runtime env var.

`NEXT_PUBLIC_SITE_URL` feeds `metadataBase`, the sitemap, and the OG image. Get
it wrong and shared links resolve their preview images against `localhost`.

---

## 4. Close the loop

Now that both URLs exist, go back to **Render** and set:

```bash
GOOGLE_OAUTH_REDIRECT_URI=https://<render-app>.onrender.com/auth/google/callback
FRONTEND_URL=https://<vercel-app>.vercel.app
ALLOWED_ORIGINS=https://<vercel-app>.vercel.app
```

Then redeploy the Render service.

### Google Cloud Console

In **APIs & Services → Credentials → your OAuth client**, add:

- **Authorised redirect URI**: `https://<render-app>.onrender.com/auth/google/callback`
- **Authorised JavaScript origin**: `https://<vercel-app>.vercel.app`

This must match `GOOGLE_OAUTH_REDIRECT_URI` **exactly** — scheme, host, path, no
trailing slash. A mismatch gives `redirect_uri_mismatch` at sign-in.

While you are there, make sure the Gmail and Calendar APIs are enabled and your
account is listed under **OAuth consent screen → Test users** if the app is
still in testing mode.

---

## 5. Keep-alive cron

This step is what makes the free plan usable. Without it, Render sleeps after 15
minutes idle, the next visitor waits 30–50 s, and the background sync scheduler
never fires.

At [cron-job.org](https://cron-job.org):

- **URL**: `https://<render-app>.onrender.com/health`
- **Schedule**: **every 10 minutes**

Ten minutes, not fifteen — the ping has to land comfortably inside the idle
window, and cron schedules drift.

The budget works out: a 30-day month is 720 hours and the free plan allows 750,
so one service can stay up continuously and still fit. That allowance is shared
across all free services in the account, so **keep this as the only one** or the
maths stops working.

`/health` checks the database pool, so a 200 means the whole path is alive —
this doubles as uptime monitoring. Keeping the service warm is also what lets
`SYNC_INTERVAL=30m` actually fire.

---

## Verifying

```bash
# backend up and talking to Neon
curl -s https://<render-app>.onrender.com/health
# -> {"status":"healthy"}

# frontend serving
curl -s -o /dev/null -w "%{http_code}\n" https://<vercel-app>.vercel.app
# -> 200

# CORS configured for your frontend origin
curl -s -I -X OPTIONS https://<render-app>.onrender.com/emails \
  -H "Origin: https://<vercel-app>.vercel.app" \
  -H "Access-Control-Request-Method: GET" | grep -i access-control-allow-origin
# -> access-control-allow-origin: https://<vercel-app>.vercel.app
```

Then sign in through the real flow. If the callback fails, the redirect URI is
almost always the cause.

---

## Known limits of this setup

**Vercel preview deployments will not reach the API.** `ALLOWED_ORIGINS` is an
exact-match list (`slices.Contains` in `internal/app/cors.go`) and previews get a
new random hostname each time. Either add specific preview URLs, or test against
production only.

**Neon free is 0.5 GB.** `email_summaries` grows with every sync. Watch it if
you onboard more than a handful of users.

**Free Postgres has no automatic backups worth relying on.** Before any
migration, take your own dump:

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%F).sql
```

**A missed ping costs 30–50 s.** If cron-job.org skips a run, or you exhaust the
750 hours, the next visitor pays a full cold start — and on this app that lands
on the sign-in redirect, which feels broken rather than slow. Watch the first
request after any quiet period.

**OpenAI is not free.** Set a spend limit in the OpenAI dashboard before going
live — a sync loop against a large mailbox can burn credit faster than expected.

---

## Cost to go always-on

If the keep-alive turns out to be too fragile, Render's Starter plan is **$7/mo**
and never sleeps, which removes the cron and the 750-hour ceiling together.
Everything else stays on its free tier, so that is the whole bill.

Google Cloud Run is the other option — 2M requests and 180k vCPU-seconds a month
stay genuinely free, and it scales to zero without penalty. The catch is that it
needs a billing account with a card on file, plus Artifact Registry and IAM
setup. Worth it if this grows past a side project.
