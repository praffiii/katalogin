import { describe, expect, it, vi } from "vitest";
import {
  GenerationGuardError,
  createGenerationGuard,
  createRedisConcurrencyController,
  createUpstashGenerationGuard,
  getClientIdentifier,
  type GenerationLimiter,
} from "@/lib/generation-guard";

function limiter(success: boolean): GenerationLimiter {
  return {
    limit: vi.fn().mockResolvedValue({
      success,
      limit: 5,
      remaining: success ? 4 : 0,
      reset: 1_800_000_000_000,
    }),
  };
}

describe("createRedisConcurrencyController", () => {
  it("acquires and releases a distributed concurrency lease", async () => {
    const redis = {
      eval: vi.fn().mockResolvedValue(1),
    };
    const concurrency = createRedisConcurrencyController(redis, {
      globalLimit: 5,
      leaseTtlSeconds: 35,
    });

    await expect(
      concurrency.acquire("ip:203.0.113.1", "request-lease"),
    ).resolves.toBe(true);
    await concurrency.release("ip:203.0.113.1", "request-lease");

    expect(redis.eval).toHaveBeenCalledTimes(2);
    expect(redis.eval.mock.calls[0]?.[1]).toEqual([
      "listify:generation:concurrency:ip:203.0.113.1",
      "listify:generation:concurrency:global",
    ]);
  });
});

describe("createUpstashGenerationGuard", () => {
  it("fails closed in production when Upstash credentials are missing", () => {
    expect(() =>
      createUpstashGenerationGuard({ NODE_ENV: "production" }),
    ).toThrow("GENERATION_GUARD_UNAVAILABLE");
  });

  it("uses an explicit no-op guard in development without credentials", async () => {
    const guard = createUpstashGenerationGuard({ NODE_ENV: "development" });

    const lease = await guard.acquire("ip:127.0.0.1", "request-dev");

    expect(lease.limits.burst.remaining).toBe(Number.POSITIVE_INFINITY);
    await expect(lease.release()).resolves.toBeUndefined();
  });

  it("creates the real Upstash guard when credentials exist", () => {
    const guard = createUpstashGenerationGuard({
      NODE_ENV: "production",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "token",
    });

    expect(guard.mode).toBe("upstash");
  });

  it("uses supplied production guard dependencies when credentials exist", async () => {
    const concurrency = {
      acquire: vi.fn().mockResolvedValue(true),
      release: vi.fn().mockResolvedValue(undefined),
    };
    const guard = createUpstashGenerationGuard(
      {
        NODE_ENV: "production",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
        UPSTASH_REDIS_REST_TOKEN: "token",
      },
      {
        burstLimiter: limiter(true),
        dailyLimiter: limiter(true),
        globalLimiter: limiter(true),
        concurrency,
      },
    );

    const lease = await guard.acquire("ip:203.0.113.1", "request-production");

    expect(concurrency.acquire).toHaveBeenCalledOnce();
    await lease.release();
  });
});

describe("getClientIdentifier", () => {
  it("uses the first forwarded IP address", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.8, 10.0.0.1",
    });

    expect(getClientIdentifier(headers)).toBe("ip:203.0.113.8");
  });

  it("falls back to one shared anonymous bucket", () => {
    expect(getClientIdentifier(new Headers())).toBe("ip:unknown");
  });
});

describe("createGenerationGuard", () => {
  it("rejects requests when the burst limit is exhausted", async () => {
    const concurrency = {
      acquire: vi.fn(),
      release: vi.fn(),
    };
    const guard = createGenerationGuard({
      burstLimiter: limiter(false),
      dailyLimiter: limiter(true),
      globalLimiter: limiter(true),
      concurrency,
    });

    await expect(
      guard.acquire("ip:203.0.113.1", "request-1"),
    ).rejects.toMatchObject({
      code: "RATE_LIMITED",
    } satisfies Partial<GenerationGuardError>);
    expect(concurrency.acquire).not.toHaveBeenCalled();
  });

  it("rejects requests when the daily limit is exhausted", async () => {
    const concurrency = {
      acquire: vi.fn(),
      release: vi.fn(),
    };
    const guard = createGenerationGuard({
      burstLimiter: limiter(true),
      dailyLimiter: limiter(false),
      globalLimiter: limiter(true),
      concurrency,
    });

    await expect(
      guard.acquire("ip:203.0.113.1", "request-2"),
    ).rejects.toMatchObject({
      code: "RATE_LIMITED",
    } satisfies Partial<GenerationGuardError>);
    expect(concurrency.acquire).not.toHaveBeenCalled();
  });

  it("rejects requests when the global daily quota is exhausted", async () => {
    const concurrency = {
      acquire: vi.fn(),
      release: vi.fn(),
    };
    const guard = createGenerationGuard({
      burstLimiter: limiter(true),
      dailyLimiter: limiter(true),
      globalLimiter: limiter(false),
      concurrency,
    });

    await expect(
      guard.acquire("ip:203.0.113.1", "request-3"),
    ).rejects.toMatchObject({
      code: "RATE_LIMITED",
    } satisfies Partial<GenerationGuardError>);
    expect(concurrency.acquire).not.toHaveBeenCalled();
  });

  it("rejects requests when a concurrency lease is unavailable", async () => {
    const concurrency = {
      acquire: vi.fn().mockResolvedValue(false),
      release: vi.fn(),
    };
    const guard = createGenerationGuard({
      burstLimiter: limiter(true),
      dailyLimiter: limiter(true),
      globalLimiter: limiter(true),
      concurrency,
    });

    await expect(
      guard.acquire("ip:203.0.113.1", "request-4"),
    ).rejects.toMatchObject({
      code: "CONCURRENCY_LIMITED",
    } satisfies Partial<GenerationGuardError>);
    expect(concurrency.acquire).toHaveBeenCalledWith(
      "ip:203.0.113.1",
      "request-4",
    );
  });

  it("returns an idempotent lease after all guards pass", async () => {
    const concurrency = {
      acquire: vi.fn().mockResolvedValue(true),
      release: vi.fn().mockResolvedValue(undefined),
    };
    const guard = createGenerationGuard({
      burstLimiter: limiter(true),
      dailyLimiter: limiter(true),
      globalLimiter: limiter(true),
      concurrency,
    });

    const lease = await guard.acquire("ip:203.0.113.1", "request-5");

    expect(lease.limits.burst.remaining).toBe(4);
    expect(lease.limits.daily.remaining).toBe(4);
    expect(lease.limits.global.remaining).toBe(4);
    await lease.release();
    await lease.release();
    expect(concurrency.release).toHaveBeenCalledTimes(1);
    expect(concurrency.release).toHaveBeenCalledWith(
      "ip:203.0.113.1",
      "request-5",
    );
  });
});
