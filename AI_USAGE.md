# AI Usage

This document describes how AI tools were used while building the Ottodot trial booking take-home.

## Tools used

- **Cursor** (Composer agent) — primary coding environment and pair programmer
- **Claude** — reasoning about booking invariants, last-seat race handling, auth design, and documentation

## What AI was used for

- Scaffolding the Next.js + Prisma + Vitest project structure
- Drafting the Prisma schema (`Parent`, `Student`, `TrialClass`, `Booking`, `PaymentAttempt`)
- Implementing `BookingService` with transactional payment confirmation
- Writing Vitest cases for duplicate booking, capacity limits, payment failure, and last-seat race
- Creating seed data for demo edge cases
- Adding API route handlers, shared error handling, and Zod input validation (`src/lib/schemas.ts`)
- Building the parent UI (login, dashboard, booking flow, payment page, admin roster)
- Applying Ottodot brand styling and logo (Plus Jakarta Sans, Fraunces, coral/cream palette from [ottodot.com](https://www.ottodot.com/))
- Implementing **scrypt password hashing**, **JWT session cookies** (`jose`), and **login rate limiting**
- Scoping parent API routes to the signed-in session
- Drafting and finalizing README and this file

## Where AI helped me move faster

AI quickly produced the **last-seat race test** and the transactional `completePayment` flow: count confirmed bookings inside a DB transaction, confirm only if capacity remains, otherwise mark `payment_failed`. That saved time on boilerplate while I focused on whether the invariant was correct under SQLite's write locking.

AI also scaffolded the full page structure (parent layout, server actions, form flows) in one pass, which let me spend more time reviewing business logic than wiring React forms.

For the later auth hardening pass, AI helped wire up `hashPassword` / `verifyPassword`, JWT sign/verify helpers, and rate-limit utilities with matching unit tests — work that would have been tedious to do by hand within the timebox.

## Where I disagreed with or corrected AI output

- **Scope control** — AI initially suggested a large multi-feature admin panel. I kept the UI minimal: login, book, pay, status, roster — enough to demo the flow without distracting from backend correctness.
- **Duplicate prevention at DB layer** — AI suggested a partial unique index for active bookings. I kept application-level checks for the take-home (simpler with SQLite) and documented the tradeoff: two concurrent `createBooking` calls could both succeed for the same child until we add a constraint.
- **TypeScript in tests** — Generated `toMatchObject<BookingError>(...)` which broke `next build` typechecking. Fixed by using untyped `toMatchObject({ code: "..." })`.
- **Server actions** — `login/actions.ts` was missing `"use server"`, causing a runtime error when passing the action to `<form action={...}>`. Added the directive and moved payment actions into a proper server actions file.
- **`redirect()` inside try/catch** — Successful login called `redirect("/")` inside a catch-all block; Next.js `redirect` throws internally, so valid logins were treated as failures. Fixed by only catching `BookingError` with code `UNAUTHORIZED`.
- **Stale Prisma client** — After adding the `password` column, the running dev server still used an old generated client (`Unknown field password`). Fixed with `prisma generate` + dev server restart; colocated generated client under `src/generated/prisma` and kept `postinstall` generation.
- **Demo credentials on login page** — Moved demo account info to README only, per preference for a standard login form.
- **Plain-text passwords and raw parent ID cookies** — Early demo auth stored passwords in plain text and put the database parent ID directly in the session cookie. I upgraded to scrypt hashes in seed data and JWT-signed `parent_session` cookies, while keeping the demo login UX unchanged (`demo123` still works in the UI).
- **Open parent API routes** — Initially some read endpoints were public. I tightened `GET /api/students`, `GET /api/trial-classes`, and booking routes to require a valid parent session.

## What I would change about my AI workflow next time

1. Run `npm run build` after each major AI-generated chunk, not just `npm test` — Next.js typechecks test files by default.
2. Restart the dev server after schema changes and verify login immediately — don't assume `db:seed` alone is enough.
3. Keep a short running log of AI suggestions I rejected, so `AI_USAGE.md` stays accurate at submission time.

## How I verified the final implementation

- `npm run db:setup` — schema push and seed data load cleanly
- `npm test` — **12 tests** across three files:
  - `tests/booking-service.test.ts` (5) — duplicate prevention, capacity, payment failure, last-seat race
  - `tests/auth.test.ts` (3) — JWT sign/verify, expiry, tamper rejection
  - `tests/rate-limit.test.ts` (4) — limit threshold, window reset, clear on success
- `npm run build` — production TypeScript check passes
- **Manual UI checks** (after `npm run dev`):
  - Sign in as seed parents at `/login` with `demo123`
  - Book a class, pay successfully, confirm status shows `confirmed`
  - Simulate card declined, confirm status shows `payment_failed` and child is not on roster
  - View `/admin/roster` — only confirmed students listed
  - Attempt duplicate booking for Emma on Intro to Chemistry — blocked
  - Trigger repeated failed logins to confirm rate-limit redirect (`/login?error=rate_limited`)
- **Manual API checks** (with `parent_session` cookie after login):
  - `GET /api/trial-classes` — lists classes with seat counts
  - `GET /api/students` — returns only the signed-in parent's children
  - `POST /api/bookings` — creates `pending_payment` booking
  - `POST /api/bookings/:id/pay` — records mock payment and returns final status
  - `GET /api/trial-classes/:id/roster` — shows confirmed roster only
