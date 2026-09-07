# Ottodot Trial Booking

**This directory is the project root.** Clone or submit this repo as-is (`trial-booking/`); the parent `ottodot/` folder is only a local workspace wrapper.

A minimal TypeScript full-stack slice for Ottodot's trial booking take-home. Focus is on booking invariants, payment edge cases, and the last-seat race.

## Stack

- Next.js (App Router)
- TypeScript
- Prisma + SQLite
- Vitest

## Setup

```bash
npm install
npm run db:setup
```

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
| `npm run dev` | Start the Next.js dev server |
| `npm test` | Run booking service tests |
| `npm run db:setup` | Generate client, push schema, seed data |
| `npm run db:seed` | Re-run seed only |

## What is implemented

- Prisma schema for parents, students, trial classes, bookings, and payment attempts
- `BookingService` with booking creation, mock payment completion, and roster lookup
- Seed data covering available seats, nearly-full class, duplicate scenario, and payment failure
- Vitest coverage for duplicate prevention, capacity limits, payment failure, and last-seat race

## Seed highlights

After seeding:

- **Intro to Chemistry** — empty class with 4 available seats
- **Fractions Fun** — exactly 3 confirmed students (1 seat left)
- **Space Science** — 3 confirmed students (1 seat left) for last-seat race demos
- **Intro to Chemistry** — Emma Ortiz already has a `pending_payment` booking for duplicate-booking demos
- **Plant Biology** — Minh Nguyen has a `payment_failed` booking not on the roster

## Backend notes (summary)

### Booking statuses

- `pending_payment` — created, awaiting payment
- `confirmed` — paid and counted on roster
- `payment_failed` — payment declined or seat lost at payment time
- `cancelled` — reserved for future use

### Last-seat race approach

Both users may reach `pending_payment` for the final seat. Confirmation happens inside a database transaction that:

1. records the payment attempt
2. counts current `confirmed` bookings for the class
3. confirms only if capacity remains

SQLite serializes concurrent transactions, so only one late payer can win the last seat.

### Where checks live

| Concern | Layer |
|---|---|
| Duplicate child + class | Service + query guard |
| Capacity at payment time | Service transaction |
| Payment failure handling | Service transaction |
| Class appears full in UI | UI hint only (not implemented yet) |

## Pages

After `npm run dev`, open `http://localhost:3000/login`.

| Path | Description |
|---|---|
| `/login` | Sign in with email and password |
| `/` | Parent dashboard — children, bookings, available classes |
| `/book` | Book a trial class for a child |
| `/bookings/:id` | Booking status and mock payment |
| `/admin/roster` | Teacher/admin view of confirmed rosters |

### Demo parent accounts

Sign in at `/login` with any of these seed parent accounts:

| Email | Password | Children |
|---|---|---|
| `alice@example.com` | `demo123` | Linh Nguyen, Minh Nguyen |
| `bob@example.com` | `demo123` | Sofia Santos, Diego Santos |
| `carla@example.com` | `demo123` | Emma Ortiz |

### Admin roster

Open `/admin/roster` to view confirmed students per trial class. This page is intended for teachers or ops staff and does not require parent login. It shows only `confirmed` bookings — pending or failed payments are excluded.

You can also reach the admin roster from the parent app header after signing in.

## API routes

After `npm run dev`, the booking flow can be exercised via HTTP:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/trial-classes` | List trial classes with seat availability |
| `GET` | `/api/students` | List students (children) |
| `POST` | `/api/bookings` | Create booking (`{ "studentId", "trialClassId" }`) |
| `GET` | `/api/bookings/:id` | Get booking status |
| `POST` | `/api/bookings/:id/pay` | Submit mock payment (`{ "shouldSucceed": true \| false }`) |
| `GET` | `/api/trial-classes/:id/roster` | Admin/teacher confirmed roster |

Copy `.env.example` to `.env` before running setup.

### Example flow

```bash
# List classes and students
curl http://localhost:3000/api/trial-classes
curl http://localhost:3000/api/students

# Book and pay
curl -X POST http://localhost:3000/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{"studentId":"<student-id>","trialClassId":"<class-id>"}'

curl -X POST http://localhost:3000/api/bookings/<booking-id>/pay \
  -H 'Content-Type: application/json' \
  -d '{"shouldSucceed":true}'

curl http://localhost:3000/api/bookings/<booking-id>
curl http://localhost:3000/api/trial-classes/<class-id>/roster
```

## Next steps

- README design section expansion (assumptions, monitoring, time spent)

## Time spent

_Scaffold only — update before submission._
