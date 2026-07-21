# Deploying AuraMail for free

Three services, no card required:

| Piece | Host | Free tier |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Hobby — no sleep |
| Backend (Go) | **Koyeb** | 1 service, sleeps after 1 h idle, 1–5 s cold start |
| Postgres | **Neon** | 0.5 GB, autosuspends after 5 min, wakes in ~1 s |
| Keep-alive | **cron-job.org** | Free scheduled GET |

The only thing that costs money is the **OpenAI API key** the summariser needs.
Everything else is $0.

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

## 2. Backend — Koyeb

Create a **Web Service** from your GitHub repo:

| Setting | Value |
|---|---|
| Builder | **Dockerfile** |
| Work directory | `backend` |
| Dockerfile location | `backend/Dockerfile` |
| Port | `8080` |
| Health check path | `/health` |
| Instance | Free |

Koyeb injects its own `PORT`, and `config.go` already reads it
(`getEnvDefault("PORT", "8080")`), so the app binds correctly with no change.

### Environment variables

Set these as **secrets** in Koyeb, not plain env vars:

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

Two more depend on URLs you do not have yet — come back and set them after
step 3:

```bash
GOOGLE_OAUTH_REDIRECT_URI=https://<koyeb-app>.koyeb.app/auth/google/callback
FRONTEND_URL=https://<vercel-app>.vercel.app
ALLOWED_ORIGINS=https://<vercel-app>.vercel.app
```

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
NEXT_PUBLIC_API_URL=https://<koyeb-app>.koyeb.app
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

Now that both URLs exist, go back to **Koyeb** and set:

```bash
GOOGLE_OAUTH_REDIRECT_URI=https://<koyeb-app>.koyeb.app/auth/google/callback
FRONTEND_URL=https://<vercel-app>.vercel.app
ALLOWED_ORIGINS=https://<vercel-app>.vercel.app
```

Then redeploy the Koyeb service.

### Google Cloud Console

In **APIs & Services → Credentials → your OAuth client**, add:

- **Authorised redirect URI**: `https://<koyeb-app>.koyeb.app/auth/google/callback`
- **Authorised JavaScript origin**: `https://<vercel-app>.vercel.app`

This must match `GOOGLE_OAUTH_REDIRECT_URI` **exactly** — scheme, host, path, no
trailing slash. A mismatch gives `redirect_uri_mismatch` at sign-in.

While you are there, make sure the Gmail and Calendar APIs are enabled and your
account is listed under **OAuth consent screen → Test users** if the app is
still in testing mode.

---

## 5. Keep-alive cron

Koyeb's free instance sleeps after 1 hour idle, which stops the background email
sync scheduler. A free ping keeps it warm.

At [cron-job.org](https://cron-job.org):

- **URL**: `https://<koyeb-app>.koyeb.app/health`
- **Schedule**: every 50 minutes

`/health` checks the database pool, so a 200 means the whole path is alive —
this doubles as uptime monitoring. Keeping the service warm is what lets
`SYNC_INTERVAL=30m` actually fire.

---

## Verifying

```bash
# backend up and talking to Neon
curl -s https://<koyeb-app>.koyeb.app/health
# -> {"status":"healthy"}

# frontend serving
curl -s -o /dev/null -w "%{http_code}\n" https://<vercel-app>.vercel.app
# -> 200

# CORS configured for your frontend origin
curl -s -I -X OPTIONS https://<koyeb-app>.koyeb.app/emails \
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

**Cold starts still happen.** The cron covers the sync window, but if a ping is
missed the next visitor waits 1–5 s. That is Koyeb's floor on the free plan.

**OpenAI is not free.** Set a spend limit in the OpenAI dashboard before going
live — a sync loop against a large mailbox can burn credit faster than expected.

---

## Cost to go always-on

If the sleeping becomes a real problem, the cheapest fix is Koyeb's paid
instance, which allows scale-to-zero to be disabled. That removes the need for
the keep-alive cron. Everything else can stay on its free tier.
