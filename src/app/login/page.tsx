import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAsParent } from "@/app/login/actions";
import { getSessionParent } from "@/lib/auth";

type LoginPageProps = PageProps<"/login">;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const parent = await getSessionParent();
  if (parent) {
    redirect("/");
  }

  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-16 right-[-4rem] h-56 w-56 rounded-full bg-accent-sky/25 blur-3xl" />
        <div className="absolute bottom-0 left-[-3rem] h-64 w-64 rounded-full bg-accent-mustard/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent-mint/15 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-border/80 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4 sm:px-6">
          <Link href="/login" className="font-display text-2xl font-bold tracking-tight text-foreground">
            Ottodot
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md otto-card border border-border p-8 sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Parent portal
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
              Sign in
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Book a trial class for your child and track your booking status.
            </p>
          </div>

          {hasError ? (
            <p className="mb-5 rounded-2xl border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
              Invalid email or password. Please try again.
            </p>
          ) : null}

          <form action={loginAsParent} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="alice@example.com"
                className="otto-input"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="otto-input"
              />
            </div>

            <button type="submit" className="otto-button-primary">
              Sign in
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
