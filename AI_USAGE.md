# AI Usage

This document describes how AI tools were used while building the Ottodot trial booking take-home.

## Tools used

- **Cursor** (Composer agent) — primary coding environment and pair programmer
- **Claude** — reasoning about booking invariants, last-seat race handling, and documentation

## What AI was used for

- Scaffolding the Next.js + Prisma + Vitest project structure
- Drafting the Prisma schema (`Parent`, `Student`, `TrialClass`, `Booking`, `PaymentAttempt`)
- Implementing `BookingService` with transactional payment confirmation
- Writing Vitest cases for duplicate booking, capacity limits, payment failure, and last-seat race
- Creating seed data for demo edge cases
- Adding API route handlers and shared error handling
- Building the parent UI (login, dashboard, booking flow, payment page, admin roster)
- Applying Ottodot brand styling (Plus Jakarta Sans, Fraunces, coral/cream palette from [ottodot.com](https://www.ottodot.com/))
- Drafting and finalizing README and this file

## Where AI helped me move faster

AI quickly produced the **last-seat race test** and the transactional `completePayment` flow: count confirmed bookings inside a DB transaction, confirm only if capacity remains, otherwise mark `payment_failed`. That saved time on boilerplate while I focused on whether the invariant was correct under SQLite's write locking.

AI also scaffolded the full page structure (parent layout, server actions, form flows) in one pass, which let me spend more time reviewing business logic than wiring React forms.

## Where I disagreed with or corrected AI output

- **Scope control** — AI initially suggested a large multi-feature admin panel. I kept the UI minimal: login, book, pay, status, roster — enough to demo the flow without distracting from backend correctness.
- **Duplicate prevention at DB layer** — AI suggested a partial unique index for active bookings. I kept application-level checks for the take-home (simpler with SQLite) and documented the tradeoff: two concurrent `createBooking` calls could both succeed for the same child until we add a constraint.
- **TypeScript in tests** — Generated `toMatchObject<BookingError>(...)` which broke `next build` typechecking. Fixed by using untyped `toMatchObject({ code: "..." })`.
- **Server actions** — `login/actions.ts` was missing `"use server"`, causing a runtime error when passing the action to `<form action={...}>`. Added the directive and moved payment actions into a proper server actions file.
- **`redirect()` inside try/catch** — Successful login called `redirect("/")` inside a catch-all block; Next.js `redirect` throws internally, so valid logins were treated as failures. Fixed by only catching `BookingError` with code `UNAUTHORIZED`.
- **Stale Prisma client** — After adding the `password` column, the running dev server still used an old generated client (`Unknown field password`). Fixed with `prisma generate` + dev server restart; added `postinstall` script to reduce recurrence.
- **Demo credentials on login page** — Moved demo account info to README only, per preference for a standard login form.

## What I would change about my AI workflow next time

1. Run `npm run build` after each major AI-generated chunk, not just `npm test` — Next.js typechecks test files by default.
2. Restart the dev server after schema changes and verify login immediately — don't assume `db:seed` alone is enough.
3. Keep a short running log of AI suggestions I rejected, so `AI_USAGE.md` stays accurate at submission time.

## How I verified the final implementation

- `npm run db:setup` — schema push and seed data load cleanly
- `npm test` — five service-level tests cover duplicate prevention, capacity, payment failure, and last-seat race
- `npm run build` — production TypeScript check passes
- **Manual UI checks** (after `npm run dev`):
  - Sign in as seed parents at `/login`
  - Book a class, pay successfully, confirm status shows `confirmed`
  - Simulate card declined, confirm status shows `payment_failed` and child is not on roster
  - View `/admin/roster` — only confirmed students listed
  - Attempt duplicate booking for Emma on Intro to Chemistry — blocked
- **Manual API checks**:
  - `GET /api/trial-classes` — lists classes with seat counts
  - `POST /api/bookings` — creates `pending_payment` booking (with session cookie)
  - `POST /api/bookings/:id/pay` — records mock payment and returns final status
  - `GET /api/trial-classes/:id/roster` — shows confirmed roster only
