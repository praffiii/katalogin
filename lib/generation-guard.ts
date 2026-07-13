import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type GenerationGuardEnvironment = Record<string, string | undefined>;

function readPositiveInteger(
  env: GenerationGuardEnvironment,
  key: string,
  fallback: number,
) {
  const parsed = Number.parseInt(env[key] ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export interface GenerationLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface GenerationLimiter {
  limit(identifier: string): Promise<GenerationLimitResult>;
}

export interface ConcurrencyController {
  acquire(identifier: string, requestId: string): Promise<boolean>;
  release(identifier: string, requestId: string): Promise<void>;
}

export interface GenerationGuardOptions {
  burstLimiter: GenerationLimiter;
  dailyLimiter: GenerationLimiter;
  globalLimiter: GenerationLimiter;
  concurrency: ConcurrencyController;
}

interface RedisEvaluator {
  eval<TResult>(
    script: string,
    keys: string[],
    args: string[],
  ): Promise<TResult>;
}

const ACQUIRE_CONCURRENCY_SCRIPT = `
  if redis.call("EXISTS", KEYS[1]) == 1 then
    return 0
  end

  local current = tonumber(redis.call("GET", KEYS[2]) or "0")
  local maximum = tonumber(ARGV[3])
  if current >= maximum then
    return -1
  end

  redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
  redis.call("INCR", KEYS[2])
  redis.call("EXPIRE", KEYS[2], ARGV[2])
  return 1
`;

const RELEASE_CONCURRENCY_SCRIPT = `
  if redis.call("GET", KEYS[1]) ~= ARGV[1] then
    return 0
  end

  redis.call("DEL", KEYS[1])
  local current = tonumber(redis.call("GET", KEYS[2]) or "0")
  if current <= 1 then
    redis.call("DEL", KEYS[2])
  else
    redis.call("DECR", KEYS[2])
  end
  return 1
`;

export function createRedisConcurrencyController(
  redis: RedisEvaluator,
  options: { globalLimit: number; leaseTtlSeconds: number },
): ConcurrencyController {
  const globalKey = "listify:generation:concurrency:global";

  function keys(identifier: string) {
    return [`listify:generation:concurrency:${identifier}`, globalKey];
  }

  return {
    async acquire(identifier, requestId) {
      const result = await redis.eval<number>(
        ACQUIRE_CONCURRENCY_SCRIPT,
        keys(identifier),
        [
          requestId,
          String(options.leaseTtlSeconds),
          String(options.globalLimit),
        ],
      );

      return result === 1;
    },
    async release(identifier, requestId) {
      await redis.eval<number>(
        RELEASE_CONCURRENCY_SCRIPT,
        keys(identifier),
        [requestId],
      );
    },
  };
}

export class GenerationGuardError extends Error {
  constructor(
    public readonly code: "RATE_LIMITED" | "CONCURRENCY_LIMITED",
    public readonly reset?: number,
  ) {
    super(code);
    this.name = "GenerationGuardError";
  }
}

export function createGenerationGuard(options: GenerationGuardOptions) {
  return {
    async acquire(identifier: string, requestId: string) {
      const burst = await options.burstLimiter.limit(identifier);

      if (!burst.success) {
        throw new GenerationGuardError("RATE_LIMITED", burst.reset);
      }

      const daily = await options.dailyLimiter.limit(identifier);

      if (!daily.success) {
        throw new GenerationGuardError("RATE_LIMITED", daily.reset);
      }

      const global = await options.globalLimiter.limit("global");

      if (!global.success) {
        throw new GenerationGuardError("RATE_LIMITED", global.reset);
      }

      const acquired = await options.concurrency.acquire(identifier, requestId);

      if (!acquired) {
        throw new GenerationGuardError("CONCURRENCY_LIMITED");
      }

      let released = false;

      return {
        limits: { burst, daily, global },
        async release() {
          if (released) {
            return;
          }

          released = true;
          await options.concurrency.release(identifier, requestId);
        },
      };
    },
  };
}

export function createUpstashGenerationGuard(
  env: GenerationGuardEnvironment = process.env,
  dependencies?: GenerationGuardOptions,
) {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  const hasCredentials = Boolean(url && token);

  if (!hasCredentials && env.NODE_ENV === "production") {
    throw new Error("GENERATION_GUARD_UNAVAILABLE");
  }

  if (!hasCredentials) {
    const unlimited = {
      success: true,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
      reset: 0,
    };

    return {
      mode: "development-bypass" as const,
      async acquire() {
        return {
          limits: {
            burst: unlimited,
            daily: unlimited,
            global: unlimited,
          },
          async release() {},
        };
      },
    };
  }

  if (dependencies) {
    return {
      mode: "upstash" as const,
      ...createGenerationGuard(dependencies),
    };
  }

  const redis = new Redis({ url: url!, token: token! });
  const ephemeralCache = new Map<string, number>();
  const burstLimit = readPositiveInteger(env, "AI_BURST_LIMIT", 5);
  const dailyLimit = readPositiveInteger(env, "AI_DAILY_IP_LIMIT", 20);
  const globalDailyLimit = readPositiveInteger(env, "AI_DAILY_GLOBAL_LIMIT", 500);

  return {
    mode: "upstash" as const,
    ...createGenerationGuard({
      burstLimiter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(burstLimit, "10 m"),
        analytics: true,
        ephemeralCache,
        prefix: "listify:generation:burst",
      }),
      dailyLimiter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(dailyLimit, "1 d"),
        analytics: true,
        ephemeralCache,
        prefix: "listify:generation:daily",
      }),
      globalLimiter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(globalDailyLimit, "1 d"),
        analytics: true,
        ephemeralCache,
        prefix: "listify:generation:global",
      }),
      concurrency: createRedisConcurrencyController(redis, {
        globalLimit: readPositiveInteger(env, "AI_GLOBAL_CONCURRENCY_LIMIT", 5),
        leaseTtlSeconds: readPositiveInteger(env, "AI_LEASE_TTL_SECONDS", 35),
      }),
    }),
  };
}

export function getClientIdentifier(headers: Headers) {
  const forwarded =
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-forwarded-for") ??
    headers.get("x-real-ip");
  const ip = forwarded?.split(",", 1)[0]?.trim().slice(0, 64);

  return `ip:${ip || "unknown"}`;
}
