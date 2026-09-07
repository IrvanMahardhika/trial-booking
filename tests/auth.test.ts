import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PARENT_SESSION_MAX_AGE_SECONDS,
  signParentToken,
  verifyParentToken,
} from "@/lib/jwt";

describe("parent JWT", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("signs a token that verifies to the parent id", async () => {
    const parentId = "parent_123";

    const token = await signParentToken(parentId);
    const verifiedParentId = await verifyParentToken(token);

    expect(verifiedParentId).toBe(parentId);
    expect(token).not.toBe(parentId);
    expect(token.split(".")).toHaveLength(3);
  });

  it("rejects expired tokens", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const token = await signParentToken("parent_456");

    vi.setSystemTime(
      new Date(Date.now() + PARENT_SESSION_MAX_AGE_SECONDS * 1000 + 1),
    );

    await expect(verifyParentToken(token)).resolves.toBeNull();
  });

  it("rejects tampered tokens", async () => {
    const token = await signParentToken("parent_789");

    await expect(verifyParentToken(`${token}invalid`)).resolves.toBeNull();
  });
});
