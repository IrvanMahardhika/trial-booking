import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { PageShell } from "@/components/page-shell";
import { formatClassDate } from "@/lib/format";
import { getSessionParent } from "@/lib/auth";
import { bookingService } from "@/lib/services";

export default async function DashboardPage() {
  const parent = await getSessionParent();
  if (!parent) {
    return null;
  }

  const trialClasses = await bookingService.listTrialClasses();

  return (
    <PageShell
      title="Parent dashboard"
      description="Book a trial class for your child and track booking status."
    >
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Your children</h2>
          <Link
            href="/book"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover"
          >
            Book a trial class
          </Link>
        </div>
        <div className="mt-4 grid gap-4">
          {parent.students.map((student) => (
            <div
              key={student.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <h3 className="font-medium">{student.name}</h3>
              {student.bookings.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No bookings yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {student.bookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-3"
                    >
                      <div>
                        <p className="font-medium">{booking.trialClass.title}</p>
                        <p className="text-sm text-muted">
                          {formatClassDate(booking.trialClass.scheduledAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={booking.status} />
                        <Link
                          href={`/bookings/${booking.id}`}
                          className="text-sm font-medium text-brand hover:text-brand-hover"
                        >
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Available trial classes</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {trialClasses.map((trialClass) => (
            <div
              key={trialClass.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <p className="font-medium">{trialClass.title}</p>
              <p className="mt-1 text-sm text-muted">
                {formatClassDate(trialClass.scheduledAt)}
              </p>
              <p className="mt-2 text-sm">
                {trialClass.seatsAvailable} of {trialClass.capacity} seats left
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
