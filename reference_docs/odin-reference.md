# Odin — Backend Reference

Reference document for the Odin backend. Covers database schema, business logic, security model, and architecture decisions. For API endpoints, see [`api-endpoints.md`](api-endpoints.md). For deployment, see [`deployment.md`](deployment.md).

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Query builder | Knex |
| Validation | Zod |
| Database | PostgreSQL |

Responsibilities:
- Business logic and state machine enforcement
- Authentication and session management
- Database interaction via Knex
- Input validation via Zod schemas
- Transaction safety for all point operations

---

## Database Schema

### households

Groups users into a family unit. Future-proofs multi-family support at near-zero cost.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| name | string | e.g., "Smith Family" |
| created_at | timestamp | Default now() |

---

### users

Stores both parents and children.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| household_id | FK | → households.id, NOT NULL |
| name | string | NOT NULL. Display name |
| nick_name | string | Nullable. Informal display name |
| avatar | jsonb | NOT NULL. DiceBear pixel-art options object e.g. `{"style":"pixel-art","seed":"Bart"}` |
| role | enum | 'parent' or 'child' |
| pin_hash | string | NOT NULL. bcrypt hash of PIN. Minimum 8 digits for parents, 4–8 for children |
| status | string | NOT NULL. Default 'active'. Soft delete support |
| token_version | integer | NOT NULL. Default 1. Incremented on PIN change or mobile logout — invalidates all outstanding JWTs for that user |
| pin_last_changed | timestamp | Nullable. Set when PIN is updated |
| points_balance | integer | Default 0. Only meaningful for children |
| created_at | timestamp | Default now() |

Status values: `active`, `inactive`, `removed`

Notes:
- `points_balance` is a cached value for fast lookup — **not** the source of truth
- `transactions` is the authoritative record of all point activity
- `avatar` is a jsonb object passed to DiceBear to render the user's pixel-art avatar. Used on the profile selection screen and throughout the UI
- Users are never deleted from the database — `status` is set to `inactive` or `removed` to preserve transaction and assignment history

---

### refresh_tokens

Stores hashed refresh tokens for JWT-based mobile auth. One row per active refresh token. Tokens are rotated on each refresh — the old token is revoked and a new one is issued.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| user_id | FK | → users.id, NOT NULL, CASCADE on delete |
| token_hash | string | NOT NULL, UNIQUE. bcrypt hash of the refresh token |
| expires_at | timestamp | NOT NULL. 30-day expiry |
| revoked | boolean | NOT NULL, default false. Set true on rotation or explicit revocation |
| created_at | timestamp | Default now() |

---

### chores

Defines chore templates.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| household_id | FK | → households.id |
| title | string | e.g., "Clean room" |
| description | text | Nullable |
| emoji | string | NOT NULL. Emoji icon for the chore e.g. `"🍽️"`. Defaults to `"🦺"` if omitted |
| points | integer | Awarded on approval |
| created_by | FK | → users.id |
| created_at | timestamp | Default now() |

---

### chore_schedules

Defines recurring assignment rules. One row per chore per child. The daily scheduler checks this table and generates new assignments when the previous one reaches a terminal state.

Household scoping via JOIN to `chores` on `chore_schedules.chore_id = chores.id`.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| chore_id | FK | → chores.id, NOT NULL, CASCADE on delete |
| child_id | FK | → users.id, NOT NULL, RESTRICT on delete |
| frequency | string | NOT NULL. 'daily', 'weekly', or 'monthly' |
| day_of_week | integer | 0=Sun, 1=Mon, ..., 6=Sat. Required for weekly, null otherwise |
| day_of_month | integer | 1-28. Required for monthly, null otherwise |
| active | boolean | NOT NULL, default true. Scheduler skips inactive schedules |
| last_generated_at | timestamp | When the scheduler last created an assignment |
| created_at | timestamp | Default now() |

**Unique constraint:** `(chore_id, child_id)` — prevents duplicate schedules for the same chore and child.

**Scheduler:** Runs daily at 3:00am via `node-cron` (`src/scheduler.js`). Two-phase process:

1. **Auto-dismiss:** Finds all `assigned` chores where `assigned_at < yesterday midnight` and sets them to `dismissed` with a system comment (`"Missed — not completed"`).
2. **Generate assignments:** For each active schedule, checks if today matches the frequency/day and if the most recent assignment for that (chore_id, child_id) pair is in a terminal state (approved, dismissed, canceled). If both conditions are met, creates a new assignment. Includes a **catch-up mechanism** with a 7-day lookback cap: if `last_generated_at` is older than today, backfills missing days with `assigned_at` set to each missed date (not today). Gaps older than 7 days are accepted as lost. On a normal day with no gaps, behavior is identical to creating a single assignment for today.

**Deploy note:** When the catch-up mechanism is first deployed, update all `last_generated_at` values to the current date to prevent historical backfill.

---

### chore_assignments

Links chores to children with full status tracking.

`chore_assignments` has NO `household_id` column. Household scoping is done via JOIN to `chores` on `chore_assignments.chore_id = chores.id`.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| chore_id | FK | → chores.id, NOT NULL, CASCADE on delete |
| child_id | FK | → users.id. Nullable (unassigned) |
| status | string | See state machine below |
| assigned_at | timestamp | Default now() |
| started_at | timestamp | Nullable |
| paused_at | timestamp | Nullable |
| time_paused | integer | Default 0. Accumulated pause seconds |
| pause_count | integer | Default 0. Times paused by child |
| submitted_at | timestamp | Nullable. Set when child submits for review |
| reviewed_by | FK | → users.id. Nullable |
| reviewed_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |

**Status values:** `assigned`, `in_progress`, `paused`, `parent_paused`, `submitted`, `rejected`, `approved`, `dismissed`, `canceled`, `unassigned`

**State machine (enforced in `assignmentService.js`):**

```
unassigned      → assigned       (child — claim; or parent — reassign)
unassigned      → canceled       (parent — cancel)
assigned        → in_progress    (child — start)
assigned        → submitted      (child — submit, optional comment)
assigned        → canceled       (parent — cancel)
assigned        → dismissed      (parent — dismiss)
assigned        → reassigned     (parent — reassign; resets to assigned for new child)
in_progress     → submitted      (child — submit, optional comment)
in_progress     → paused         (child — pause, optional comment)
in_progress     → parent_paused  (parent — parent-pause, optional comment)
in_progress     → dismissed      (parent — dismiss)
paused          → in_progress    (child — resume; accumulates time_paused)
paused          → submitted      (child — submit)
paused          → dismissed      (parent — dismiss)
parent_paused   → in_progress    (child — resume; does NOT accumulate time_paused)
submitted       → approved       (parent — approve; awards points via transaction)
submitted       → rejected       (parent — reject, required comment)
rejected        → in_progress    (child — resume-rejected; preserves started_at and pause data)
rejected        → dismissed      (parent — dismiss)
(none)          → in_progress    (child — start-ahead; creates a new row directly in_progress for a non-daily scheduled chore not yet generated this period)
```

Any invalid transition returns 400. The service checks both current status and requesting user's role before applying any transition.

---

### user_devices

Stores FCM push tokens per device. One row per device — a user with both a phone and a tablet gets two rows. Used to fan out push notifications to all of a user's devices.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| user_id | FK | → users.id, NOT NULL, CASCADE on delete |
| device_token | string | NOT NULL. FCM registration token |
| platform | string | NOT NULL. Default 'android'. Future-proofs iOS |
| label | string | Nullable. e.g., 'Phone', 'Tablet' |
| last_seen_at | timestamp | Nullable. Updated on each app open |
| created_at | timestamp | Default now() |

Registration is an upsert: if the token already exists for this user, update `last_seen_at`; if new, insert. Old/rotated tokens are replaced when the device re-registers.

---

### assignment_comments

Feedback and notes on assignments.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| assignment_id | FK | → chore_assignments.id, CASCADE on delete |
| user_id | FK | → users.id |
| comment | string | Max 500 characters |
| created_at | timestamp | Default now() |

Notes:
- Required when parent rejects a submission
- Optional for other transitions
- Children can also comment (e.g., "I couldn't find the cleaning spray")

---

### rewards

Items or activities children want to earn.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| household_id | FK | → households.id |
| created_by | FK | → users.id |
| name | string | e.g., "Lego set" |
| description | text | Nullable |
| link | string | Nullable. URL to product |
| points_required | integer | Nullable. Set by parent on approval |
| is_shared | boolean | Default false. Multiple children can contribute |
| status | string | Default 'pending'. See lifecycle below |
| created_at | timestamp | Default now() |

**Status lifecycle:**

```
pending  → active    (parent approves, sets points_required)
pending  → archived  (parent rejects)
active   → funded    (automatic when contributions reach points_required)
active   → archived  (parent cancels; auto-refunds all contributions)
funded   → redeemed  (parent confirms)
redeemed → archived  (parent archives after fulfillment)
```

Any user (parent or child) can create a reward request. It starts as `pending` until a parent approves it.

---

### reward_contributions

Tracks points contributed to rewards.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| reward_id | FK | → rewards.id, CASCADE on delete |
| child_id | FK | → users.id |
| points | integer | Clamped on insert |
| refund_requested | boolean | Default false. Set by child to request refund |
| created_at | timestamp | Default now() |

Clamping rule: `actual = min(requested, remaining_on_reward, child_balance)`

If actual is 0 (reward fully funded or child has no balance), request is rejected — a zero-point record is never inserted.

---

### transactions

Ledger of all point activity. This is the source of truth for point history.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| child_id | FK | → users.id |
| amount | integer | Positive = earned, Negative = spent |
| source | string | See source values below |
| reference_id | integer | ID of related record |
| created_at | timestamp | Default now() |

| Source | Amount | Reference |
|---|---|---|
| chore_approved | + | chore_assignments.id |
| reward_contribution | - | rewards.id |
| reward_refund | + | rewards.id |
| reward_redemption | - | rewards.id |
| manual_adjustment | +/- | point_adjustments.id |

---

### point_adjustments

Parent-issued point rewards and penalties with child notification support.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| household_id | FK | → households.id, NOT NULL, CASCADE on delete |
| child_id | FK | → users.id, NOT NULL, CASCADE on delete |
| parent_id | FK | → users.id, NOT NULL, RESTRICT on delete |
| points | integer | NOT NULL. Positive = reward, negative = penalty |
| reason | text | NOT NULL. Parent-provided explanation shown to the child |
| seen | boolean | NOT NULL, default false. Child marks seen via unseen modal on login |
| created_at | timestamp | Default now() |

Notes:

- Creates a corresponding `transactions` row with `source = 'manual_adjustment'` and `reference_id = point_adjustments.id`
- `seen` flag drives the child login notification modal — unseen adjustments are shown immediately after login

---

### parent_tasks

Parent-only to-do list. Not visible to children. Supports ordering, status tracking, and notes.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| household_id | FK | → households.id, NOT NULL, CASCADE on delete |
| created_by | FK | → users.id, NOT NULL, RESTRICT on delete |
| title | string | NOT NULL, max 255 |
| status | string | NOT NULL, default 'active'. Values: active, in_progress, archived |
| started_by | FK | → users.id, nullable, RESTRICT on delete |
| sort_order | integer | NOT NULL, default 0. Used for drag-and-drop reordering |
| archived_at | timestamp | Nullable. Set when task is archived |
| created_at | timestamp | Default now() |
| updated_at | timestamp | Default now() |

---

### parent_task_notes

Notes attached to parent tasks. Similar to assignment_comments but for parent tasks.

| Field | Type | Notes |
|---|---|---|
| id | PK | Auto-increment |
| parent_task_id | FK | → parent_tasks.id, NOT NULL, CASCADE on delete |
| created_by | FK | → users.id, NOT NULL, RESTRICT on delete |
| content | text | NOT NULL |
| created_at | timestamp | Default now() |

---

## Business Logic

### Reward Contribution Transaction Steps

Points must never be duplicated, lost, over-contributed, or spent beyond a child's available balance. A database transaction with row-level locking guarantees this.

1. Begin transaction
2. Lock reward row: `SELECT * FROM rewards WHERE id = ? FOR UPDATE`
3. Verify reward status is `active` — abort if not
4. Calculate current contributions: `SELECT COALESCE(SUM(points), 0) FROM reward_contributions WHERE reward_id = ?`
5. Determine remaining: `remaining = points_required - contributed_total`
6. Lock child row: `SELECT points_balance FROM users WHERE id = ? FOR UPDATE`
7. Clamp: `actual = min(requested, remaining, child_balance)`
8. If actual is 0, rollback with appropriate error
9. Insert contribution record
10. Insert transaction record (`amount = -actual`, `source = 'reward_contribution'`)
11. Update `users.points_balance -= actual`
12. If `contributed_total + actual >= points_required`: set reward status to `funded`
13. Commit

**Why locking matters:** Without `FOR UPDATE`, two simultaneous requests could both read the same remaining balance and both contribute, resulting in over-contribution. Row locking serializes concurrent requests.

### Refund Logic

- Child flags all their contributions on a reward: `refund_requested = true`
- Parent approves: all flagged contribution rows deleted, points returned, single `reward_refund` transaction inserted
- If refund drops a `funded` reward below `points_required`, reward reverts to `active`
- Parent rejects: `refund_requested` reset to `false`, no transaction inserted
- When parent cancels a reward (`active → archived`): all contributions from all children auto-refunded without child request

### Chore Approval Points Award

1. Begin transaction
2. Verify assignment status is `submitted`
3. Update assignment: `status = 'approved'`, set `reviewed_by`, `reviewed_at`
4. Look up chore `points` value
5. Insert transaction (`amount = +points`, `source = 'chore_approved'`)
6. Update `users.points_balance += points`
7. Commit

---

## API Structure

```
src/
  controllers/          — HTTP request/response only, no business logic
  services/             — business logic, DB queries, state machine enforcement
  middleware/
    auth.js             — validates session, returns 401 if not authenticated
    roleCheck.js        — roleCheck('parent') checks req.session.user.role, returns 403
    validate.js         — validates req.body against Zod schema, returns 400
    validateQuery.js    — validates req.query against Zod schema, returns 400
  routes/               — wires middleware chain: auth → roleCheck → validate → controller
  validators/           — Zod schemas for all route inputs
  db/
    migrations/
    seeds/
```

Route middleware chain: `auth` → `roleCheck` → `validate` / `validateQuery` → controller

Controllers are thin: parse params/body, call service, return response with correct status code. All business logic lives in services.

---

## API Endpoints

Full endpoint reference: see [`api-endpoints.md`](api-endpoints.md).

---

## Security Model

**Authentication:** PIN-based login. PINs stored as bcrypt hashes. Profile list is unauthenticated but returns only `id`, `name`, `avatar`, `role` — never `pin_hash`. `avatar` is the jsonb DiceBear options object.

**Sessions:** `express-session` with `connect-pg-simple` PostgreSQL session store. Sessions persisted to the `session` table — survive restarts. `rolling: true` with `maxAge: 5min` — every authenticated request extends cookie expiry by 5 more minutes; 5+ minutes of no activity (tab closed, idle laptop) lets the cookie expire on the browser side. Aligns with Thor's 5-minute client-side `useIdleTimer`. `household_id` and `id` always sourced from `req.session.user`, never from request body or params.

**JWT (mobile):** `jsonwebtoken` (HS256). Access tokens (15m) + refresh tokens (30d, rotation on use, stored hashed in `refresh_tokens` table). Login via `POST /auth/token` returns `{ accessToken, refreshToken }`. The `auth` middleware accepts either a valid session or an `Authorization: Bearer <token>` header — on valid JWT it populates `req.session.user` from the payload so all downstream middleware and controllers are unchanged. On JWT auth, the middleware does a single DB lookup to verify `token_version` matches the current value in `users` — mismatches return 401. `token_version` is incremented on PIN change or explicit token revocation (`POST /auth/token/revoke`), immediately invalidating all outstanding tokens for that user. Thor logout never touches `token_version`, so mobile sessions survive kiosk logouts and timeouts.

**Rate limiting:** Per-user lockout — 3 failed login attempts → 30-second cooldown per profile. Not global (one child's mistakes don't lock out parents). Implemented via `express-rate-limit` keyed on `user_id`, with `skipSuccessfulRequests: true`.

**PIN length policy:** Parents require a minimum 8-digit PIN (enforced in validation middleware). Children use 4–8 digits. Parent accounts are the only ones exposed to internet-facing auth when DuckDNS is enabled — longer PINs are the primary brute-force mitigation. Note: existing parent PINs shorter than 8 digits must be updated when this policy is deployed.

**Household scoping:** Every query is filtered by `household_id` from the session. `chore_assignments` has no `household_id` column — scoping goes through a JOIN to `chores`: `.join('chores', 'chore_assignments.chore_id', 'chores.id').where({'chores.household_id': household_id})`.

**Validation:** Zod schemas on all route inputs via middleware. Runs before controllers on every route.

**Hardening (in place):**
- `helmet` middleware — active, sets security headers
- `cors({ origin: CLIENT_URL, credentials: true })` — restricts to known frontend origin
- `cookie.httpOnly: true` — prevents JS from reading session cookie
- `cookie.sameSite: 'lax'` — blocks cross-origin POST/PATCH/DELETE with session cookie
- `morgan('combined')` — HTTP request logging to journalctl
- Graceful shutdown on `SIGTERM` — allows in-flight requests to complete before process exit

**Production hardening (pending):**
- `cookie.secure: true` — enable when HTTPS is in place (Caddy migration)

---

## Architecture Decisions

### ADR-001: Monorepo Strategy

Single Git repository with subdirectories per service (`ODIN/`, `THOR/`, `VALKYRIE/`) rather than separate repos. Solo developer — no team coordination benefit to splitting. One clone gets the entire stack. Deployment repos (`odin`, `thor`, `valkyrie`) are synced from this monorepo as a separate step. Path-based CI triggers can scope per-service work if needed.

### ADR-002: PIN-Based Authentication

PIN login over password/OAuth. Primary users are children on a touchscreen kiosk — PINs are fast, low friction, and appropriate for a household-only app. Mitigated by bcrypt hashing and per-user rate limiting.

### ADR-003: Points Balance Caching

`points_balance` stored on `users` as a cached value. Eliminates expensive SUM queries on the transactions table for every dashboard load. Trade-off: balance must be updated atomically within every point-affecting transaction. Transactions table remains source of truth.

### ADR-004: Clamping Over Rejection

When a contribution exceeds what's allowed, clamp to the maximum valid amount instead of rejecting. Better UX for children who may not know the exact remaining amount. Exception: if clamping would result in 0, reject with a clear error.

### ADR-005: Knex Over Raw SQL or ORM

Knex provides migration/seed management and an expressive query builder without hiding SQL intent. Lighter than a full ORM (Sequelize, TypeORM). Maintains explicit control over transactions and locking. Raw SQL has no migration management; Prisma is heavier with less transaction control.

### ADR-006: Explicit State Machine for Chore Assignments

Explicit state machine enforced in `assignmentService.js`. Prevents invalid transitions, makes role-based access auditable, and documents business rules in a single place. Open-ended status fields with role middleware only are too easy to misuse.

### ADR-008: JWT Auth + Token Versioning

JWT added as a parallel auth method for Valkyrie (mobile). Sessions/cookies are unreliable in React Native; JWT in SecureStore is the standard mobile pattern. Sessions remain the auth mechanism for Thor — no migration needed.

Access tokens (15m, HS256) + refresh tokens (30d, rotation on use). Refresh tokens stored as bcrypt hashes in the `refresh_tokens` table — old token is revoked on each refresh and a new pair is issued. Short-lived access tokens limit the window if a token is compromised; refresh rotation ensures stolen refresh tokens are single-use.

Token revocation via `token_version` column on `users` rather than a token blacklist. Blacklists require storage and lookups that grow unbounded; version checking is a single indexed primary-key lookup per request. Version is incremented on PIN change or explicit revocation (`POST /auth/token/revoke`) — both represent a deliberate "sign out everywhere" intent.

Thor logout deliberately does not increment `token_version`. Thor auto-logs out on inactivity; invalidating mobile tokens on every kiosk timeout would be a poor UX. The two clients have independent session lifecycles.

### ADR-007: Household Entity

`households` table added even though the app initially supports one family. Costs almost nothing, avoids a painful retrofit if multi-family support is ever needed, and keeps all data properly scoped from day one.

---

## Future Enhancements (Backend)

- **Edit reward info** — `PATCH /rewards/:id`, parent-only. Editable fields: title, description, points_required. No status restrictions — parent can edit at any time regardless of funding state. The parent has decision power, not the app. **TBD:** behavior when `points_required` is lowered below the current contributed total — likely auto-flip reward to `funded` status, but confirm with frontend whether to warn the parent on save.
- **Refund All (without canceling)** — new action on rewards endpoint. Returns all contributed points to children via transactions but keeps the reward in active status. Contributions can restart from zero.
- **Set to Funded** — new action on rewards endpoint. Parent manually marks reward as funded. Does NOT refund children's contributed points — they keep their points spent. Moves reward to funded status ready for redemption.
- **Parent-only reward notes** — new `reward_notes` field or related table. Parent-only visibility. Stores links, purchase notes, price tracking. Future: kiosk link viewer (deferred). **TBD:** single text field vs. structured `reward_notes` table — table allows multi-entry/timestamped notes; field is simpler if parent only needs one running note. Decision drives the frontend UX shape.
- **Notifications table + login badge** — new `notifications` table (id, user_id, household_id, type, reference_id, seen, created_at). No FK constraints — reference columns only for clean joins and easy pruning. Events that write a notification row: chore approved, chore rejected, reward approved/funded/canceled, one-time assignment given, points awarded/penalized (existing `point_adjustments.seen` remains separate — standalone modal). Login badge endpoint: `SELECT EXISTS(...)` for unseen notifications per user. Scheduler prunes seen rows daily.
- **In-app bug reports** — new `bug_reports` table (id, reporter_name varchar, reporter_role varchar, description text, status varchar default 'open', created_at). No FK constraints — fully standalone. Endpoints: `POST /bugs` (any authenticated user), `GET /bugs` (parent-only, for developer review), `PATCH /bugs/:id` (parent-only, update status to 'open'/'fixed').
- **Missed assignments query expansion** — update `getMissedAssignments` to include overdue chores not yet auto-dismissed: add `assigned + assigned_at < today + started_at IS NULL` alongside existing `dismissed + started_at IS NULL`. Closes the one-day visibility gap where parents can't see missed chores until the scheduler auto-dismisses them. Frontend-only impact — parent History Missed Chores column shows missed chores a day earlier. No schema changes.
- **Child dashboard stats** — new query or endpoint for 7-day performance stats: completed count, missed count, points earned, points missed. Data exists in assignments + transactions tables — needs time-bucketed aggregation.
- **Pool chore recurrence + inline status + team flag** — scheduler support for recurring pool assignments. Dedup rule for non-team chores: if any unassigned instance of that chore exists in the pool, skip scheduling (no stacking). Once claimed, assignment attaches to the child and tracking begins. One-time pool assignments persist until claimed or parent clears them. Schema: `chore_schedules.child_id` becomes nullable to support pool-targeted schedules (currently `NOT NULL`); new `team_chore` boolean column on `chores`. Pool + child recurrence can coexist on the same chore. **Team chore behavior:** when `chores.team_chore = true`, `claimAssignment` inserts a NEW assignment row for the claimant (status `assigned`, child_id set) instead of updating the pool entry — pool entry stays available for siblings. Each claim is an independent assignment with its own submit/approve lifecycle. Points unchanged on chore — chore form labels "X pts each" in the UI when flag is on. Pool entry expires/regenerates with the recurrence period (daily team chore replaces every morning). No backend dedup against same child claiming the same team chore multiple times — parent approval catches it.
- **Funded rewards in parent dashboard payload** — add `fundedRewards` to `getParentDashboard` response. Query: `rewards WHERE status = 'funded' AND household_id = ?`, joined with `reward_contributions` + `users` to surface contributing children (id, name, avatar) for the stacked-avatar UI. Mirrors the existing `pendingRewards` query shape in [`dashboardService.js`](../src/services/dashboardService.js) — same join pattern, just a different status filter and an extra join for contributors. No new endpoint or schema changes needed. Frontend usage: parent dashboard Requests panel surfaces these as ready-to-redeem cards (see thor-reference.md).
- **Child-focused overlay stats** — per-child 7-day stats (completed/missed counts, points earned/missed, streak). Reuses the same aggregation as child dashboard stats but filtered to a single child. May extend the existing child dashboard stats endpoint with a `child_id` param or be a separate query.
- **Child recall refund request** — `PATCH /rewards/:id/cancel-refund`, child-only. Returns reward from refund-pending back to its prior state. Reverses the refund request without parent involvement.
- **Push notifications** — webhook or SSE endpoint for real-time chore approval/rejection alerts
- **Child leaderboard endpoint** — new aggregation endpoint (e.g., `GET /dashboard/leaderboard`) that queries the `transactions` table to return points earned per child for today, yesterday, this week, and this month. Data already exists — no new tables needed, just time-bucketed aggregation queries
- **Gamification — badges & achievements** — new schema (`badges`, `child_badges`), logic to check/award badges on chore completion (e.g., first chore, 10th chore, 7-day streak). Parked until leaderboard ships and engagement is evaluated. Start with simple count-based badges before tackling streaks or time-based achievements
- **Database table indexing** — audit Knex migrations for missing indexes. Postgres does not auto-index foreign keys. Likely candidates: `chore_assignments.chore_id` (JOIN target for household scoping), `chore_assignments.status` (filtered on nearly every query), `chores.household_id` (filtered on every scoped query). Not urgent at current scale but sound practice — first optimization lever if query performance degrades as assignment history grows
- **MFA for parent accounts** — optional second factor
- **Session TTL by context** — kiosk (15min inactivity), mobile (longer, configurable)
