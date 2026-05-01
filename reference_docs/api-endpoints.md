# Odin — API Endpoints

Quick-reference for all Odin API endpoints. For database schema, business logic, and architecture details, see [`odin-reference.md`](odin-reference.md). For deployment, see [`deployment.md`](deployment.md).

**Base URL:** `http://localhost:8080` (dev) — no `/api` prefix. In production, the reverse proxy strips its own prefix before forwarding to Odin.

---

## Authentication

Session-based auth (Thor/kiosk) and JWT-based auth (Valkyrie/mobile) are both supported. The `auth` middleware accepts either a valid session cookie or an `Authorization: Bearer <token>` header.

### Session (Thor)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /auth/profiles | No | Returns id, name, nick_name, avatar, role only — never pin_hash |
| POST | /auth/login | No | Accepts `{ user_id, pin }`. Rate-limited per user. Sets session cookie |
| POST | /auth/logout | Yes | Destroys session. Does not affect JWT tokens |
| GET | /auth/session | Yes | Returns current session user info |

### JWT (Valkyrie)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | /auth/token | No | Accepts `{ user_id, pin }`. Rate-limited per user. Returns `{ accessToken, refreshToken }`. Access: 15m, Refresh: 30d |
| POST | /auth/token/refresh | No | Accepts `{ refreshToken }`. Rotates: old token revoked, new pair issued. Returns `{ accessToken, refreshToken }` |
| POST | /auth/token/revoke | Yes | Increments user's `token_version`, invalidating all outstanding JWTs for that user |

Rate limiting: 3 failed attempts → 30-second lockout per profile (not global).

---

## Users

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| GET | /users | Yes | parent | List all household users |
| POST | /users | Yes | parent | Create a new user in the household |
| GET | /users/pin_changes | Yes | parent | Users who changed PIN in last 5 days |
| PATCH | /users/me | Yes | any | Update own nick_name, avatar, or PIN |
| GET | /users/:id | Yes | any | Get user details |
| PATCH | /users/:id | Yes | parent | Update name, nick_name, avatar, role, or PIN |
| DELETE | /users/:id | Yes | parent | Deactivate user (soft delete — sets status, preserves history) |
| GET | /users/:id/transactions | Yes | parent | Transaction history for a specific user |

---

## Chores

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| GET | /chores | Yes | any | List chore templates for the household |
| POST | /chores | Yes | parent | Create a new chore template |
| PATCH | /chores/:id | Yes | parent | Update title, points, description, or emoji |

---

## Schedules

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| POST | /schedules | Yes | parent | Create a recurring schedule (+ first assignment). 409 if duplicate |
| GET | /schedules | Yes | parent | List all schedules for the household |
| GET | /schedules/chore/:chore_id | Yes | parent | List schedules for a specific chore |
| PATCH | /schedules/:id | Yes | parent | Update frequency, day, or active status |
| DELETE | /schedules/:id | Yes | parent | Remove a schedule. Existing assignments continue normally |

---

## Assignments

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| GET | /assignments | Yes | parent | List all assignments for the household |
| GET | /assignments/mine | Yes | child | Assignments for the logged-in child |
| GET | /assignments/available | Yes | child | List unassigned assignments available to claim |
| GET | /assignments/missed | Yes | parent | Missed chores (dismissed + never started), paginated. Query: `page`, `limit`, `child_id` |
| POST | /assignments | Yes | parent | Assign a chore (child_id optional — creates unassigned) |
| POST | /assignments/start-ahead | Yes | child | Start a future-scheduled chore early. Body: `{chore_id}`. Creates an `in_progress` row immediately. Rejects if a daily schedule, or if an assignment already exists for the current period (week/month). |
| PATCH | /assignments/pause-all-active | Yes | parent | Parent-pause all in_progress assignments household-wide |
| PATCH | /assignments/:id/start | Yes | child | Start an assigned chore |
| PATCH | /assignments/:id/submit | Yes | child | Submit for review, optional comment |
| PATCH | /assignments/:id/pause | Yes | child | Pause in_progress |
| PATCH | /assignments/:id/resume | Yes | child | Resume paused or parent_paused |
| PATCH | /assignments/:id/resume-rejected | Yes | child | Resume after rejection (preserves started_at and pause data) |
| PATCH | /assignments/:id/claim | Yes | child | Claim an unassigned assignment (race-safe with FOR UPDATE) |
| PATCH | /assignments/:id/approve | Yes | parent | Approve submitted, award points via transaction |
| PATCH | /assignments/:id/reject | Yes | parent | Reject submitted, requires comment |
| PATCH | /assignments/:id/dismiss | Yes | parent | Dismiss without awarding points, optional comment |
| PATCH | /assignments/:id/cancel | Yes | parent | Cancel unassigned, assigned, or rejected assignment, optional comment |
| PATCH | /assignments/:id/reassign | Yes | parent | Reassign to a different child |
| PATCH | /assignments/:id/assign | Yes | parent | Assign an unassigned task to a specific child |
| PATCH | /assignments/:id/unassign | Yes | parent | Return assigned/rejected/paused task to unassigned pool, optional comment |
| PATCH | /assignments/:id/parent-start | Yes | parent | Start a chore on behalf of the child |
| PATCH | /assignments/:id/parent-pause | Yes | parent | Parent-pause a single in_progress assignment, optional comment |
| PATCH | /assignments/:id/unstart | Yes | parent | Reset in_progress/paused/parent_paused back to assigned. Clears progress fields except assigned_at |
| GET | /assignments/:id/comments | Yes | any | Get comments for an assignment |
| POST | /assignments/:id/comments | Yes | any | Add a comment to an assignment |

---

## Rewards

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| GET | /rewards | Yes | any | List all rewards. Query: `sort` (e.g., `progress`) |
| POST | /rewards | Yes | any | Create reward request (starts as pending) |
| GET | /rewards/refund-requests | Yes | parent | List pending refund requests, grouped by reward + child |
| GET | /rewards/:id | Yes | any | Get reward details |
| PATCH | /rewards/:id | Yes | parent | Update reward details |
| PATCH | /rewards/:id/approve | Yes | parent | Approve pending reward, set points_required |
| PATCH | /rewards/:id/reject | Yes | parent | Reject pending reward (→ archived) |
| PATCH | /rewards/:id/cancel | Yes | parent | Cancel active reward, auto-refund all contributions |
| PATCH | /rewards/:id/archive | Yes | parent | Archive redeemed reward |
| POST | /rewards/:id/contribute | Yes | child | Contribute points (clamped to remaining + balance) |
| GET | /rewards/:id/progress | Yes | parent | Per-child contribution breakdown |
| POST | /rewards/:id/redeem | Yes | parent | Mark funded reward as redeemed |
| PATCH | /rewards/:id/request-refund | Yes | child | Flag all own contributions for refund |
| PATCH | /rewards/:id/approve-refund/:childId | Yes | parent | Approve refund, return points to child |
| PATCH | /rewards/:id/reject-refund/:childId | Yes | parent | Reject refund request, reset flags |

---

## Transactions

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| GET | /transactions/ | Yes | parent | All household transactions, paginated |
| GET | /transactions/mine | Yes | child | Logged-in child's transactions, paginated |
| GET | /transactions/:id | Yes | parent | All transactions for a specific child, paginated |

Query params (all optional): `page`, `limit`, `source`

Valid source values: `chore_approved`, `reward_contribution`, `reward_refund`, `reward_redemption`, `manual_adjustment`

Response shape:

```json
{
  "data": [...],
  "pagination": { "total": 42, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

## Dashboard

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| GET | /dashboard/parent | Yes | parent | Pending approvals, children summaries |
| GET | /dashboard/child | Yes | child | Active chores, balance, reward progress |
| GET | /dashboard/child/summary | Yes | child | `{missed, today, thisWeek, thisMonth, recentlyCompleted (cap 4), chorePoolOldest (cap 3), closestMine, closestShared}`. `thisWeek`/`thisMonth` are upcoming schedule previews — filtered to days not yet passed AND no assignment generated this period |
| GET | /dashboard/child/:child_id | Yes | parent | View a child's dashboard as the parent (read-only) |

Aggregated endpoints — one call returns everything needed to render a dashboard screen.

---

## Parent Tasks

Parent-only to-do list with notes. Not visible to children.

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| GET | /parent-tasks | Yes | parent | List active and in_progress tasks (sorted by sort_order) |
| GET | /parent-tasks/recent | Yes | parent | Recently completed/archived tasks |
| POST | /parent-tasks | Yes | parent | Create a new task |
| PATCH | /parent-tasks/reorder | Yes | parent | Reorder tasks (array of id + sort_order) |
| PATCH | /parent-tasks/:id | Yes | parent | Update task title or status |
| PATCH | /parent-tasks/:id/start | Yes | parent | Start a task (active → in_progress) |
| PATCH | /parent-tasks/:id/pause | Yes | parent | Pause a task (in_progress → active) |
| PATCH | /parent-tasks/:id/archive | Yes | parent | Archive a task |
| GET | /parent-tasks/:id/notes | Yes | parent | Get notes for a task |
| POST | /parent-tasks/:id/notes | Yes | parent | Add a note to a task |

---

## Point Adjustments

Parent-issued rewards and penalties with child notification.

| Method | Path | Auth | Role | Notes |
|---|---|---|---|---|
| POST | /adjustments | Yes | parent | Create a point adjustment (reward or penalty). Creates a transaction row |
| GET | /adjustments/unseen | Yes | child | Get unseen adjustments for the logged-in child (login notification modal) |
| PATCH | /adjustments/seen | Yes | child | Mark all adjustments as seen |

---

## Setup

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /setup | No | Returns `{ complete: true/false }` based on whether a parent user exists |
| POST | /setup | No | First-time setup: creates household + first parent user. 403 if already complete |

POST body:

```json
{
  "household": { "name": "Family Name" },
  "user": { "name": "Parent Name", "nick_name": "Nick", "avatar": { "style": "pixel-art", "seed": "Homer" }, "pin": "12345678" }
}
```

---

## System

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /health | No | Health check — returns `{ status, db }`. 503 if DB unreachable |
