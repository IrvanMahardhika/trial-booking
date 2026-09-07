"use server";

import { redirect } from "next/navigation";
import { clearParentSession, setParentSession } from "@/lib/auth";
import { bookingService } from "@/lib/services";

export async function loginAsParent(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const parent = await bookingService.authenticateParent(email, password);
    await setParentSession(parent.id);
    redirect("/");
  } catch {
    redirect("/login?error=invalid");
  }
}

export async function logoutParent() {
  await clearParentSession();
  redirect("/login");
}
