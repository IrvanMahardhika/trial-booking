import Link from "next/link";
import { OttodotLogo } from "@/components/ottodot-logo";
import { PageShell } from "@/components/page-shell";
import { formatClassDate } from "@/lib/format";
import { bookingService } from "@/lib/services";

export default async function AdminRosterPage() {
  const trialClasses = await bookingService.listTrialClasses();
  const rosters = await Promise.all(
    trialClasses.map(async (trialClass) => ({
      trialClass,
      roster: await bookingService.getClassRoster(trialClass.id),
    })),
  );

  return (
    <div className="min-h-full">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <OttodotLogo href="/admin/roster" />
            <p className="mt-1 text-sm text-muted">Admin roster · confirmed students per trial class</p>
          </div>
          <Link
            href="/login"
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-background"
          >
            Parent login
          </Link>
        </div>
      </header>

      <PageShell
        title="Trial class rosters"
        description="Only confirmed bookings appear here."
      >
        <div className="grid gap-6">
          {rosters.map(({ trialClass, roster }) => (
            <section
              key={trialClass.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium">{trialClass.title}</h2>
                  <p className="text-sm text-muted">
                    {formatClassDate(trialClass.scheduledAt)}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {roster.confirmedStudents.length} / {trialClass.capacity} confirmed
                </p>
              </div>

              {roster.confirmedStudents.length === 0 ? (
                <p className="mt-4 text-sm text-muted">No confirmed students yet.</p>
              ) : (
                <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                  {roster.confirmedStudents.map((entry) => (
                    <li
                      key={entry.bookingId}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{entry.studentName}</p>
                        <p className="text-muted">
                          Parent: {entry.parentName} ({entry.parentEmail})
                        </p>
                      </div>
                      <p className="text-muted">
                        Confirmed {formatClassDate(entry.confirmedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </PageShell>
    </div>
  );
}
