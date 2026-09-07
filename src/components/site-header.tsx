import Link from "next/link";
import { logoutParent } from "@/app/login/actions";

type SiteHeaderProps = {
  parentName: string;
  parentEmail: string;
};

export function SiteHeader({ parentName, parentEmail }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <Link href="/" className="font-display text-xl font-bold text-foreground">
            Ottodot
          </Link>
          <p className="text-sm text-muted">
            Signed in as {parentName} ({parentEmail})
          </p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-foreground hover:text-brand">
            Dashboard
          </Link>
          <Link href="/book" className="text-foreground hover:text-brand">
            Book trial
          </Link>
          <Link href="/admin/roster" className="text-foreground hover:text-brand">
            Admin roster
          </Link>
          <form action={logoutParent}>
            <button
              type="submit"
              className="rounded-full bg-brand px-3 py-1.5 text-white hover:bg-brand-hover"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
