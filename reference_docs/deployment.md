# Odin — Deployment Guide

How to deploy Odin to a production environment. This guide is system-agnostic — adapt paths, service managers, and reverse proxy configs to your platform.

---

## Prerequisites

- Node.js (LTS)
- PostgreSQL
- A reverse proxy (Nginx, Caddy, etc.) — recommended but optional
- A process manager (systemd, PM2, Docker, etc.)

---

## 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/odin.git /path/to/odin
cd /path/to/odin
npm install --production
```

---

## 2. Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=production
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chore_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password
SESSION_SECRET=your_generated_secret_here
CLIENT_URL=http://your-frontend-url
JWT_SECRET=your_generated_jwt_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
```

Generate secrets:

```bash
openssl rand -base64 48  # Use once for SESSION_SECRET, once for JWT_SECRET
```

`CLIENT_URL` is the origin of your frontend application — used for CORS. Set this to whatever URL your frontend is served from.

`JWT_SECRET` is required for mobile (JWT) auth. `JWT_ACCESS_EXPIRY` and `JWT_REFRESH_EXPIRY` are optional — defaults shown above.

---

## 3. PostgreSQL Setup

Create a database user and database:

```bash
sudo -i -u postgres

createuser --interactive --pwprompt
# name: your_db_user
# password: (match DB_PASSWORD in .env)
# superuser: no

createdb chore_tracker --owner=your_db_user

exit
```

---

## 4. Run Migrations

```bash
npx knex migrate:latest
```

Migrations live in `db/migrations/` and are safe to re-run — Knex tracks which have already been applied.

---

## 5. Start the Server

```bash
node src/server.js
```

The API listens on the port defined in `.env` (default `8080`).

Health check: `GET /health` — returns `200` and pings the database.

---

## 6. Process Manager

Use a process manager to keep Odin running across restarts and crashes. Examples:

**systemd (Linux):**

```ini
[Unit]
Description=Odin API
After=network.target postgresql.service

[Service]
User=your_user
WorkingDirectory=/path/to/odin
ExecStartPre=/usr/bin/npx knex migrate:latest
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**PM2:**

```bash
pm2 start src/server.js --name odin
pm2 save
pm2 startup
```

Odin handles `SIGTERM` gracefully — it waits for in-flight requests to complete before exiting.

---

## 7. Reverse Proxy (Recommended)

A reverse proxy handles TLS, static file serving, and URL routing. Below are minimal examples that proxy requests to Odin.

**Nginx:**

```nginx
location /api/ {
    rewrite ^/api(/.*)$ $1 break;
    proxy_pass http://localhost:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

**Caddy:**

```caddy
handle_path /api/* {
    reverse_proxy localhost:8080
}
```

Adjust the path prefix (`/api/`) to match your frontend's `API_URL` configuration. Odin's Express routes have no prefix — they expect the proxy to strip it.

---

## 8. Automated Deploys (Optional)

A simple deploy script that pulls changes and restarts only when needed:

```bash
#!/bin/bash
cd /path/to/odin

BEFORE=$(git rev-parse HEAD)
git pull origin main
AFTER=$(git rev-parse HEAD)

if [ "$BEFORE" != "$AFTER" ]; then
  echo "Changes detected. Deploying..."
  npm install --production
  npx knex migrate:latest
  # Restart using your process manager, e.g.:
  # sudo systemctl restart odin
  # pm2 restart odin
  echo "Deployed at $(date)"
else
  echo "No changes."
fi
```

Run this on a schedule (cron, systemd timer, etc.) or trigger it from a CI/CD webhook.

---

## 9. HTTPS

Once TLS is configured on your reverse proxy:

- Set `cookie.secure: true` in the Express session config (`src/app.js`)
- Update `CLIENT_URL` in `.env` to the HTTPS origin

---

## Notes

- Odin supports two auth methods: cookie-based sessions (kiosk/web) stored in PostgreSQL (`connect-pg-simple`, 5-minute rolling expiry — extended on each request, expires after 5 minutes of inactivity), and JWT auth (mobile) with access tokens (15m) + refresh tokens (30d, rotation on use).
- CORS is configured to allow requests from `CLIENT_URL` only.
- `sameSite` is set to `lax` — appropriate for same-site or subdomain deployments. If your frontend and API are on different domains, you may need to change this to `none` (requires `secure: true`).
- Rate limiting is enabled on the login endpoint (3 attempts per user, 30-second cooldown).
- See [`odin-reference.md`](odin-reference.md) for database schema, business logic, and architecture documentation.
- See [`api-endpoints.md`](api-endpoints.md) for the full API endpoint reference.
