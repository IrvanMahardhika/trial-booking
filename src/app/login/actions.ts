"use server";

import { redirect } from "next/navigation";
import { clearParentSession, setParentSession } from "@/lib/auth";
import { BookingError } from "@/lib/errors";
import {
  clearRateLimit,
  getClientIp,
  isRateLimited,
  recordRateLimitFailure,
} from "@/lib/rate-limit";
import { bookingService } from "@/lib/services";

export async function loginAsParent(formData: FormData) {
  const rateLimitKey = `login:${await getClientIp()}`;

  if (isRateLimited(rateLimitKey)) {
    redirect("/login?error=rate_limited");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const parent = await bookingService.authenticateParent(email, password);
    clearRateLimit(rateLimitKey);
    await setParentSession(parent.id);
    redirect("/");
  } catch (error) {
    if (error instanceof BookingError && error.code === "UNAUTHORIZED") {
      recordRateLimitFailure(rateLimitKey);
      redirect("/login?error=invalid");
    }
    throw error;
  }
}

export async function logoutParent() {
  await clearParentSession();
  redirect("/login");
}
