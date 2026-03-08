# Odin

The backend API for Chore Tracker. Built with Node.js, Express, Knex, and PostgreSQL.

---

## Stack

- **Node.js** — runtime
- **Express** — HTTP server
- **Knex** — query builder and migrations
- **PostgreSQL** — database
- **Zod** — request validation
- **systemd** — process manager (production)
- **Nginx** — reverse proxy (production)

---

## Prerequisites

- Node.js (LTS)
- PostgreSQL running locally
- A `.env` file (see below)

---

## Environment Variables

Create a `.env` file in the root of this directory:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chore_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password
SESSION_SECRET=a_long_random_string
CLIENT_URL=http://localhost:5173
```

---

## Local Setup

```bash
# Install dependencies
npm install

# Create the database (run in psql or your DB tool)
# CREATE DATABASE chore_tracker;

# Run migrations
npx knex migrate:latest

# Seed with test data
npx knex seed:run

# Start the development server
node src/server.js
```

API is available at `http://localhost:3000`.

Health check: `http://localhost:3000/health`

---

## Database

Migrations live in `db/migrations/`. Seeds live in `db/seeds/`.

```bash
# Run all pending migrations
npx knex migrate:latest

# Roll back the last migration
npx knex migrate:rollback

# Run seeds
npx knex seed:run
```

---

## Project Structure

```
ODIN/
  src/
    controllers/    — HTTP request/response handling
    services/       — business logic and database queries
    middleware/     — auth, roleCheck, validate, validateQuery
    routes/         — route definitions
    validators/     — Zod schemas
    server.js       — Express app entry point
    db.js           — Knex instance
  db/
    migrations/     — database schema migrations
    seeds/          — test data
  knexfile.js       — Knex configuration
```

---

## API Overview

| Resource | Base Path |
|---|---|
| Auth | `/auth` |
| Users | `/users` |
| Chores | `/chores` |
| Assignments | `/assignments` |
| Rewards | `/rewards` |
| Transactions | `/transactions` |
| Dashboard | `/dashboard` |
| Health | `/health` |

Full endpoint reference: see `odin-reference.md` in the project docs.

---

## Production

Odin runs on a Raspberry Pi 4 (4GB) with systemd managing the Node process and Nginx as a reverse proxy.

See `odin-deployment.md` in the project docs for the full setup guide.
