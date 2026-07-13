import { NextResponse } from "next/server";
import { z } from "zod";
import { AiResponseError } from "@/lib/ai-response";
import { createRequestDeadline, GenerationTimeoutError } from "@/lib/deadline";
import { apiError } from "@/lib/errors";
import {
  GeminiProviderError,
  generateListingWithGemini,
} from "@/lib/gemini";
import {
  GenerationGuardError,
  createUpstashGenerationGuard,
  getClientIdentifier,
  type GenerationLimitResult,
} from "@/lib/generation-guard";
import { decodeImageDataUrl, ImageValidationError } from "@/lib/image";
import { generateListingRequestSchema } from "@/lib/schemas";
import type { GenerateListingResponse } from "@/types/listing";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_REQUEST_BYTES = 4_250_000;

type GenerationLease = {
  limits: Partial<
    Record<"burst" | "daily" | "global", GenerationLimitResult>
  >;
  release(): Promise<void>;
};

function rateLimitHeaders(lease: GenerationLease | undefined) {
  const headers: Record<string, string> = {};
  if (lease?.limits.burst) {
    headers["ratelimit-limit"] = String(lease.limits.burst.limit);
    headers["ratelimit-remaining"] = String(lease.limits.burst.remaining);
    headers["ratelimit-reset"] = String(
      Math.ceil(lease.limits.burst.reset / 1_000),
    );
  }
  if (lease?.limits.daily) {
    headers["x-ratelimit-daily-remaining"] = String(
      lease.limits.daily.remaining,
    );
  }
  if (lease?.limits.global) {
    headers["x-ratelimit-global-remaining"] = String(
      lease.limits.global.remaining,
    );
  }
  return headers;
}

type GenerateListingHandlerDependencies = {
  guard: {
    mode: "upstash" | "development-bypass";
    acquire(identifier: string, requestId: string): Promise<GenerationLease>;
  };
  generateListing: typeof generateListingWithGemini;
  timeoutMs?: number;
  logger?: Pick<Console, "info" | "warn" | "error">;
  now?: () => number;
};

export function createGenerateListingHandler(
  dependencies: GenerateListingHandlerDependencies,
) {
  return async function handleGenerateListing(request: Request) {
    const requestId =
      request.headers.get("x-request-id")?.slice(0, 64) ?? crypto.randomUUID();
    const logger =
      dependencies.logger ??
      (process.env.NODE_ENV === "test"
        ? { info() {}, warn() {}, error() {} }
        : console);
    const now = dependencies.now ?? Date.now;
    const startedAt = now();
    const errorResponse = (
      code: Parameters<typeof apiError>[0],
      status: number,
      fields?: Record<string, string[]>,
    ) => {
      const entry = {
        event: "generation_request",
        requestId,
        status,
        durationMs: now() - startedAt,
        guardMode: dependencies.guard.mode,
        errorCode: code,
      };
      if (status >= 500) {
        logger.error(entry);
      } else {
        logger.info(entry);
      }

      return NextResponse.json<GenerateListingResponse>(
        apiError(code, { requestId, fields }),
        {
          status,
          headers: { "x-request-id": requestId },
        },
      );
    };
    const contentLength = Number.parseInt(
      request.headers.get("content-length") ?? "",
      10,
    );

    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return errorResponse("IMAGE_TOO_LARGE", 413);
    }

    let lease: GenerationLease | undefined;

    try {
      lease = await dependencies.guard.acquire(
        getClientIdentifier(request.headers),
        requestId,
      );

      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return errorResponse("INVALID_REQUEST", 400);
      }

      const parsed = generateListingRequestSchema.safeParse(body);

      if (!parsed.success) {
        return errorResponse(
          "INVALID_REQUEST",
          400,
          z.flattenError(parsed.error).fieldErrors,
        );
      }

      let decodedImage: ReturnType<typeof decodeImageDataUrl>;
      try {
        decodedImage = decodeImageDataUrl(
          parsed.data.imageBase64,
          parsed.data.mimeType,
        );
      } catch (error) {
        if (error instanceof ImageValidationError) {
          const status =
            error.code === "IMAGE_TOO_LARGE"
              ? 413
              : error.code === "UNSUPPORTED_MEDIA_TYPE"
                ? 415
                : 400;
          return errorResponse(error.code, status);
        }
        throw error;
      }

      const deadline = createRequestDeadline(
        request.signal,
        dependencies.timeoutMs ?? 25_000,
      );

      try {
        const data = await dependencies.generateListing(
          {
            ...parsed.data,
            imageBase64: decodedImage.base64,
          },
          deadline.signal,
        );

        logger.info({
          event: "generation_request",
          requestId,
          status: 200,
          durationMs: now() - startedAt,
          guardMode: dependencies.guard.mode,
        });
        const globalLimit = lease.limits.global;
        if (
          globalLimit &&
          globalLimit.remaining <= Math.max(1, Math.floor(globalLimit.limit * 0.1))
        ) {
          logger.warn({
            event: "generation_quota_warning",
            requestId,
            remaining: globalLimit.remaining,
            limit: globalLimit.limit,
          });
        }

        return NextResponse.json<GenerateListingResponse>(
          { ok: true, data },
          {
            headers: {
              "x-request-id": requestId,
              ...rateLimitHeaders(lease),
            },
          },
        );
      } finally {
        deadline.dispose();
      }
    } catch (error) {
      if (error instanceof GenerationTimeoutError) {
        return errorResponse("AI_TIMEOUT", 504);
      }
      if (
        request.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      ) {
        logger.info({
          event: "generation_request",
          requestId,
          status: 499,
          durationMs: now() - startedAt,
          guardMode: dependencies.guard.mode,
          errorCode: "CLIENT_ABORTED",
        });
        return new Response(null, {
          status: 499,
          headers: { "x-request-id": requestId },
        });
      }
      if (error instanceof AiResponseError) {
        return errorResponse(
          error.code,
          error.code === "INVALID_PRODUCT_PHOTO" ? 422 : 502,
        );
      }
      if (error instanceof GeminiProviderError) {
        if (error.code === "RATE_LIMITED") {
          return errorResponse("RATE_LIMITED", 429);
        }
        return errorResponse(
          "SERVICE_UNAVAILABLE",
          error.code === "CONFIGURATION_ERROR" ? 500 : 503,
        );
      }
      if (error instanceof GenerationGuardError) {
        return errorResponse(
          error.code,
          error.code === "RATE_LIMITED" ? 429 : 503,
        );
      }
      if (!lease) {
        return errorResponse("SERVICE_UNAVAILABLE", 503);
      }
      return errorResponse("UNKNOWN", 500);
    } finally {
      await lease?.release();
    }
  };
}

let defaultGuard: ReturnType<typeof createUpstashGenerationGuard> | undefined;

function getDefaultGuard() {
  defaultGuard ??= createUpstashGenerationGuard();
  return defaultGuard;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let guard: ReturnType<typeof createUpstashGenerationGuard>;
  try {
    guard = getDefaultGuard();
  } catch {
    const requestId =
      request.headers.get("x-request-id")?.slice(0, 64) ?? crypto.randomUUID();
    console.error({
      event: "generation_request",
      requestId,
      status: 503,
      durationMs: Date.now() - startedAt,
      guardMode: "unavailable",
      errorCode: "SERVICE_UNAVAILABLE",
    });
    return NextResponse.json<GenerateListingResponse>(
      apiError("SERVICE_UNAVAILABLE", { requestId }),
      {
        status: 503,
        headers: { "x-request-id": requestId },
      },
    );
  }

  return createGenerateListingHandler({
    guard,
    generateListing: generateListingWithGemini,
  })(request);
}
