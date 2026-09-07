"use server";

import { redirect } from "next/navigation";
import { clearParentSession, setParentSession } from "@/lib/auth";
import { BookingError } from "@/lib/errors";
import { bookingService } from "@/lib/services";

export async function loginAsParent(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const parent = await bookingService.authenticateParent(email, password);
    await setParentSession(parent.id);
    redirect("/");
  } catch (error) {
    if (error instanceof BookingError && error.code === "UNAUTHORIZED") {
      redirect("/login?error=invalid");
    }
    throw error;
  }
}

export async function logoutParent() {
  await clearParentSession();
  redirect("/login");
}
