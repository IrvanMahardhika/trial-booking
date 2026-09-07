import { cookies } from "next/headers";
import { BookingError } from "@/lib/errors";
import {
  PARENT_SESSION_MAX_AGE_SECONDS,
  signParentToken,
  verifyParentToken,
} from "@/lib/jwt";
import { bookingService } from "@/lib/services";

export { PARENT_SESSION_MAX_AGE_SECONDS };
export const PARENT_SESSION_COOKIE = "parent_session";

async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PARENT_SESSION_COOKIE)?.value ?? null;
}

export async function getSessionParentId(): Promise<string | null> {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  return verifyParentToken(token);
}

export async function getSessionParent() {
  const parentId = await getSessionParentId();
  if (!parentId) {
    return null;
  }

  try {
    return await bookingService.getParentProfile(parentId);
  } catch {
    return null;
  }
}

export async function requireSessionParent() {
  const parent = await getSessionParent();
  if (!parent) {
    throw new BookingError("Please sign in to continue", "UNAUTHORIZED");
  }
  return parent;
}

export async function setParentSession(parentId: string) {
  const token = await signParentToken(parentId);
  const cookieStore = await cookies();

  cookieStore.set(PARENT_SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: PARENT_SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearParentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PARENT_SESSION_COOKIE);
}
