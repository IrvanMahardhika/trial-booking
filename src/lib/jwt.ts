import { SignJWT, jwtVerify } from "jose";

export const PARENT_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signParentToken(parentId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(parentId)
    .setIssuedAt()
    .setExpirationTime(`${PARENT_SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyParentToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
