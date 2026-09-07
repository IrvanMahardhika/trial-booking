# Ottodot Trial Booking

A minimal TypeScript full-stack slice for Ottodot's trial booking take-home. Parents can book and pay for a trial class; teachers can view the confirmed roster. The focus is on booking invariants, payment edge cases, and the last-seat race.

**Repo:** https://github.com/IrvanMahardhika/trial-booking

## Stack

- Next.js (App Router)
- TypeScript
- Prisma + SQLite
- JWT auth (`jose`)
- Vitest

## Setup

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

Set `JWT_SECRET` in `.env` to a long random string before running locally (`.env.example` includes a dev placeholder).

Open `http://localhost:3000/login` (use the port shown in your terminal if 3000 is taken).

`db:setup` generates the Prisma client, applies the schema, and runs the seed script.

If login fails after a schema change, regenerate the client and restart the dev server:

```bash
npm run db:generate
# stop any running `npm run dev`, then start it again
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Generate Prisma client and start the Next.js dev server |
| `npm test` | Run service, auth, and rate-limit tests |
| `npm run build` | Production build + typecheck |
| `npm run db:setup` | Generate client, push schema, seed data |
| `npm run db:seed` | Re-run seed only |

## What is implemented

- **Data model** — parents, students, trial classes, bookings, payment attempts
- **`BookingService`** — booking creation, mock payment, roster lookup, parent auth
- **Parent UI** — login, dashboard, book flow, booking status + mock payment
- **Auth** — scrypt password hashing, JWT session cookies, and per-IP login rate limiting
- **Admin roster** — confirmed students per class (UI + API)
- **REST API** — same booking operations for curl/script verification
- **Seed data** — all required demo edge cases
- **Tests** — duplicate prevention, capacity, payment failure, last-seat race, JWT auth, login rate limiting

## Demo walkthrough (UI)

### Parent accounts

| Email | Password | Children |
|---|---|---|
| `alice@example.com` | `demo123` | Linh Nguyen, Minh Nguyen |
| `bob@example.com` | `demo123` | Sofia Santos, Diego Santos |
| `carla@example.com` | `demo123` | Emma Ortiz |

### Pages

| Path | Description |
|---|---|
| `/login` | Sign in with email and password |
| `/` | Parent dashboard — children, bookings, available classes |
| `/book` | Book a trial class for a child |
| `/bookings/:id` | Booking status and mock payment (success / card declined) |
| `/admin/roster` | Teacher/admin view of confirmed rosters (no login required) |

### Suggested demo flow

1. Sign in as `alice@example.com`
2. Book a class for one of Alice's children
3. On the booking page, try **Pay successfully** and **Simulate card declined**
4. Open `/admin/roster` and confirm only `confirmed` bookings appear
5. Sign in as `carla@example.com` and try booking Intro to Chemistry for Emma (duplicate — already has a pending booking)

## Seed highlights

After seeding:

- **Intro to Chemistry** — empty class with 4 available seats
- **Fractions Fun** — exactly 3 confirmed students (1 seat left)
- **Space Science** — 3 confirmed students (1 seat left) for last-seat race demos
- **Intro to Chemistry** — Emma Ortiz already has a `pending_payment` booking (duplicate demo)
- **Plant Biology** — Minh Nguyen has a `payment_failed` booking not on the roster

## Architecture and backend design

### Data model

```
Parent ──< Student ──< Booking >── TrialClass
                         │
                         └──< PaymentAttempt
```

- **Parent / Student** — who is booking for whom
- **TrialClass** — scheduled class with `capacity` (default 4)
- **Booking** — links a student to a class with a status
- **PaymentAttempt** — audit log of each mock payment try

### Booking statuses

| Status | Meaning |
|---|---|
| `pending_payment` | Booking created, awaiting payment |
| `confirmed` | Paid and counted on roster |
| `payment_failed` | Card declined, or seat lost at payment time |
| `cancelled` | Reserved for future use (not implemented) |

### Key backend functions

| Function | Purpose |
|---|---|
| `createBooking` / `createBookingForParent` | Create `pending_payment` booking with duplicate + capacity checks |
| `completePayment` | Record payment attempt and confirm or fail inside a transaction |
| `getClassRoster` | Return confirmed students for a class |
| `authenticateParent` | Parent login (email + password, verified against scrypt hash) |

### API routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/trial-classes` | List classes with seat availability (requires `parent_session` cookie) |
| `GET` | `/api/students` | List signed-in parent's children (requires `parent_session` cookie) |
| `POST` | `/api/bookings` | Create booking (requires `parent_session` cookie) |
| `GET` | `/api/bookings/:id` | Get booking status (requires `parent_session` cookie) |
| `POST` | `/api/bookings/:id/pay` | Submit mock payment (requires `parent_session` cookie) |
| `GET` | `/api/trial-classes/:id/roster` | Confirmed roster |

### How duplicate bookings are prevented

On `createBooking`, the service checks for an existing booking with the same `studentId` + `trialClassId` in `pending_payment` or `confirmed` status. If found, it throws `DUPLICATE_BOOKING`.

This is an application-level guard, not a DB unique constraint. Two concurrent requests could theoretically both pass the check before either inserts — acceptable for this take-home; production would add a partial unique index or serializable isolation.

### How payment failure is handled

Inside `completePayment` (transaction):

1. Record the `PaymentAttempt`
2. If payment failed → set booking to `payment_failed` (not on roster)
3. If payment succeeded → re-count confirmed bookings; confirm only if capacity remains, otherwise set `payment_failed` (seat lost)

### Last-seat race

**Scenario:** User A and User B both reach `pending_payment` for the last seat. User B pays first and confirms. User A then pays.

**Approach:** Allow both to hold `pending_payment`, but confirm only inside a transaction that re-counts `confirmed` bookings at payment time.

**Why this approach:**

- Matches real payment flows — a user can be "in checkout" while the seat is not yet committed
- Keeps the invariant at the point that matters: confirmation, not selection
- Simple to implement with Prisma `$transaction` on SQLite

**Tradeoffs accepted:**

- Two users can both see "1 seat left" in the UI until one pays (UI is a hint, not the source of truth)
- SQLite serializes writes, which handles the race for this demo; Postgres would need `SELECT … FOR UPDATE` or equivalent
- Loser gets `payment_failed` rather than a distinct status like `seat_lost` — fine for scope, but production might differentiate

### Where checks live

| Concern | Layer |
|---|---|
| Duplicate child + class | Service query guard |
| Capacity at booking time | Service (blocks if class already full) |
| Capacity at payment time | Service transaction (last-seat race) |
| Payment failure handling | Service transaction |
| Class appears full in UI | UI disables full classes in dropdown |
| Roster accuracy | Service — only `confirmed` bookings returned |

### Auth and security

**Password hashing**

- Demo parent passwords are hashed with Node's built-in `scrypt` before storage (`src/lib/password.ts`)
- Seed data stores hashes, not plain text; parents still sign in with `demo123` in the UI
- `authenticateParent` compares submitted passwords with `verifyPassword` using constant-time comparison

**Login rate limiting**

- `loginAsParent` limits failed sign-in attempts per client IP
- **5 failed attempts per 15 minutes** → redirects to `/login?error=rate_limited`
- Successful login clears the counter for that IP
- In-memory store (`src/lib/rate-limit.ts`) — fine for this demo/single-server setup; production would use a shared store such as Redis

**JWT session cookie (`parent_session`)**

- On login, `src/lib/jwt.ts` signs a JWT with **HS256** using `JWT_SECRET`
- Payload uses `sub` for the parent ID and `exp` for a **24-hour** expiry
- The cookie stores the signed JWT — not the parent’s database ID
- Each request verifies the JWT in `src/lib/auth.ts` before loading the parent profile
- **Logout** clears the cookie; tokens are stateless (no server-side session table)
- Cookie flags: `httpOnly`, `sameSite: lax`, `path: /`, `maxAge` aligned with JWT expiry

**JWT tradeoffs accepted for this demo**

- Tokens cannot be revoked before expiry without a blocklist or server-side session store
- `JWT_SECRET` must be kept private and rotated carefully in production

## Assumptions

- Trial classes only — no regular enrollment, refunds, or cancellations
- One parent account per login; children belong to exactly one parent
- Mock payment with a boolean success/fail — no real payment gateway
- Parent passwords are hashed with scrypt; sessions use signed JWT cookies — still demo-grade, not production OAuth or token revocation
- Login rate limiting is in-memory per server process — not suitable for multi-instance production
- Admin roster is open (no auth) for easy demo access
- Singapore timezone formatting for display (`en-SG`)

## What I deliberately cut

- Real auth (OAuth, refresh tokens, JWT revocation/blocklist, shared rate-limit store)
- Email notifications and payment webhooks
- Cancellation, rescheduling, waitlists
- DB-level unique constraints and migration files (used `db push` for speed)
- E2E browser tests (service-level tests cover invariants)
- Regular enrollment, billing plans, teacher assignment

## What I would monitor after release

- **Overbooking incidents** — alert if any class has more than 4 `confirmed` bookings
- **Payment failure rate** — spike may indicate gateway issues or last-seat races
- **`pending_payment` staleness** — bookings stuck awaiting payment beyond N minutes
- **Duplicate booking attempts** — count of `DUPLICATE_BOOKING` errors (UX friction signal)
- **Roster vs capacity** — daily check that confirmed count ≤ capacity per class

## What I would do next

- Add a partial unique index for active bookings per student + class
- Use `seat_lost` vs `payment_failed` for clearer parent messaging
- Move login rate limits to Redis and add JWT revocation / sign-out-all-devices
- Protect admin routes with role-based auth
- Add E2E tests for the parent booking flow
- Move to Postgres with row-level locking for payment confirmation

## Verification

```bash
npm run db:setup
npm test        # 12 tests
npm run build
```

## Time spent

~4 hours (within the suggested 3–4 hour timebox):

- ~1.5h — schema, `BookingService`, seed data, edge-case tests
- ~1h — API routes and error handling
- ~1h — parent UI, login, admin roster, Ottodot styling
- ~0.5h — login/debug fixes, README, and verification
