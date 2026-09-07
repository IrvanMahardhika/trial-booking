import { cookies } from "next/headers";
import { BookingError } from "@/lib/errors";
import { bookingService } from "@/lib/services";

export const PARENT_SESSION_COOKIE = "parent_session";

export async function getSessionParentId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(PARENT_SESSION_COOKIE)?.value ?? null;
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
  const cookieStore = await cookies();
  cookieStore.set(PARENT_SESSION_COOKIE, parentId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}

export async function clearParentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PARENT_SESSION_COOKIE);
}
