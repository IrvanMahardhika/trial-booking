import { redirect } from "next/navigation";
import { getSessionParent } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

export default async function ParentLayout({
  children,
}: LayoutProps<"/">) {
  const parent = await getSessionParent();

  if (!parent) {
    redirect("/login");
  }

  return (
    <>
      <SiteHeader parentName={parent.name} parentEmail={parent.email} />
      <main className="flex-1">{children}</main>
    </>
  );
}
