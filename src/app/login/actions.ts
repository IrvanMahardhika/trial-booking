"use server";

import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { clearParentSession, setParentSession } from "@/lib/auth";
import { BookingError } from "@/lib/errors";
import {
  clearRateLimit,
  getClientIp,
  isRateLimited,
  recordRateLimitFailure,
} from "@/lib/rate-limit";
import { loginSchema } from "@/lib/schemas";
import { bookingService } from "@/lib/services";

export async function loginAsParent(formData: FormData) {
  const rateLimitKey = `login:${await getClientIp()}`;

  if (isRateLimited(rateLimitKey)) {
    redirect("/login?error=rate_limited");
  }

  let email: string;
  let password: string;

  try {
    ({ email, password } = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    }));
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/login?error=invalid");
    }
    throw error;
  }

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
