# Odin

The backend API for Chore Tracker. Built with Node.js, Express, Knex, and PostgreSQL.

---

## Stack

- **Node.js** — runtime
- **Express** — HTTP server
- **Knex** — query builder and migrations
- **PostgreSQL** — database
- **Zod** — request validation

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
PORT=8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chore_tracker
DB_USER=your_db_user
DB_PASSWORD=your_db_password
SESSION_SECRET=a_long_random_string
CLIENT_URL=http://localhost:3333  # CORS origin — set to your frontend's URL
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

API is available at `http://localhost:8080`.

Health check: `http://localhost:8080/health`

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
src/
  controllers/    — HTTP request/response handling
  services/       — business logic and database queries
  middleware/     — auth, roleCheck, validate, validateQuery
  routes/         — route definitions
  validators/     — Zod schemas
  server.js       — Express entry point
  app.js          — Express app configuration
  scheduler.js    — recurring chore scheduler (node-cron)
  db.js           — Knex instance
db/
  migrations/     — database schema migrations
  seeds/          — test data
reference_docs/   — API reference and deployment guide
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
| Schedules | `/schedules` |
| Setup | `/setup` |
| Health | `/health` |

Full endpoint reference: see [`reference_docs/odin-reference.md`](reference_docs/odin-reference.md).

---

## Production

See [`reference_docs/deployment.md`](reference_docs/deployment.md) for the full deployment guide — covers PostgreSQL setup, process managers, reverse proxy configuration, automated deploys, and HTTPS.
