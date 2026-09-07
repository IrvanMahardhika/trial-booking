# AI Usage

This document describes how AI tools were used while building the Ottodot trial booking take-home.

## Tools used

- **Cursor** (Composer agent) — primary coding environment and pair programmer
- **Claude** — reasoning about booking invariants, last-seat race handling, and README structure

## What AI was used for

- Scaffolding the Next.js + Prisma + Vitest project structure
- Drafting the Prisma schema (`Parent`, `Student`, `TrialClass`, `Booking`, `PaymentAttempt`)
- Implementing `BookingService` with transactional payment confirmation
- Writing Vitest cases for duplicate booking, capacity limits, payment failure, and last-seat race
- Creating seed data for demo edge cases
- Adding minimal API route handlers and shared error handling
- Drafting README sections (setup, backend notes, tradeoffs)

## Where AI helped me move faster

AI quickly produced the **last-seat race test** and the transactional `completePayment` flow: count confirmed bookings inside a DB transaction, confirm only if capacity remains, otherwise mark `payment_failed`. That saved time on boilerplate while I focused on whether the invariant was actually correct under SQLite's write locking.

## Where I disagreed with or corrected AI output

- **Over-eager UI scope** — Early suggestions included multi-page React forms and admin dashboards. I cut that back to API routes only; the assignment prioritizes backend correctness over frontend polish.
- **Duplicate prevention at DB layer** — AI suggested a partial unique index for active bookings. I kept application-level checks for the take-home (simpler with SQLite) and documented the tradeoff: two concurrent `createBooking` calls could both succeed for the same child until we add a constraint or serializable isolation.
- **TypeScript in tests** — Generated `toMatchObject<BookingError>(...)` which broke `next build` typechecking. Fixed by using untyped `toMatchObject({ code: "..." })`.

## What I would change about my AI workflow next time

1. Run `npm run build` after each major AI-generated chunk, not just `npm test` — Next.js typechecks test files by default.
2. Ask AI to produce a **curl-based demo script** alongside API routes so reviewers can verify the flow without a UI.
3. Keep a short running log of AI suggestions I rejected, so `AI_USAGE.md` is accurate at submission time rather than reconstructed from memory.

## How I verified the final implementation

- `npm run db:setup` — schema push and seed data load cleanly
- `npm test` — five service-level tests cover duplicate prevention, capacity, payment failure, and last-seat race
- `npm run build` — production TypeScript check passes
- Manual API checks (after `npm run dev`):
  - `GET /api/trial-classes` — lists classes with seat counts
  - `GET /api/students` — lists children for booking
  - `POST /api/bookings` — creates `pending_payment` booking
  - `POST /api/bookings/:id/pay` — records mock payment and returns final status
  - `GET /api/bookings/:id` — shows booking status after submission
  - `GET /api/trial-classes/:id/roster` — shows confirmed roster only
