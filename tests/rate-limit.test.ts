import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearRateLimit,
  isRateLimited,
  LOGIN_RATE_LIMIT,
  LOGIN_RATE_WINDOW_MS,
  recordRateLimitFailure,
} from "@/lib/rate-limit";

describe("rate-limit", () => {
  afterEach(() => {
    vi.useRealTimers();
    clearRateLimit("test-key");
  });

  it("allows attempts below the limit", () => {
    for (let attempt = 0; attempt < LOGIN_RATE_LIMIT; attempt += 1) {
      expect(isRateLimited("test-key")).toBe(false);
      recordRateLimitFailure("test-key");
    }
  });

  it("blocks after the limit is reached", () => {
    for (let attempt = 0; attempt < LOGIN_RATE_LIMIT; attempt += 1) {
      recordRateLimitFailure("test-key");
    }

    expect(isRateLimited("test-key")).toBe(true);
  });

  it("resets after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    for (let attempt = 0; attempt < LOGIN_RATE_LIMIT; attempt += 1) {
      recordRateLimitFailure("test-key");
    }

    expect(isRateLimited("test-key")).toBe(true);

    vi.setSystemTime(
      new Date(Date.now() + LOGIN_RATE_WINDOW_MS + 1),
    );

    expect(isRateLimited("test-key")).toBe(false);
  });

  it("clears recorded failures", () => {
    recordRateLimitFailure("test-key");
    clearRateLimit("test-key");

    expect(isRateLimited("test-key")).toBe(false);
  });
});
