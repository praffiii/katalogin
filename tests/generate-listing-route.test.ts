import { afterEach, describe, expect, it, vi } from "vitest";
import { createGenerateListingHandler } from "@/app/api/generate-listing/route";
import { AiResponseError } from "@/lib/ai-response";
import { GeminiProviderError } from "@/lib/gemini";
import { GenerationGuardError } from "@/lib/generation-guard";

const tinyPng =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const listingResult = {
  isProductPhoto: true,
  title: "Produk contoh untuk kebutuhan harian",
  seoKeywords: ["produk", "contoh", "harian"],
  description: "Produk ini cocok untuk kebutuhan harian dan mudah digunakan.",
  priceEstimate: {
    min: 10_000,
    max: 20_000,
    currency: "IDR" as const,
    confidence: "low" as const,
    rationale: "Estimasi kasar berdasarkan informasi visual yang tersedia.",
  },
  category: {
    marketplace: "general",
    recommended: "Kategori contoh",
    alternatives: [],
  },
  sellingPoints: ["Mudah digunakan", "Cocok untuk harian", "Dapat diedit"],
  warnings: [],
};

afterEach(() => {
  vi.useRealTimers();
});

describe("generate listing route", () => {
  it("returns a request ID and normalized image data on success", async () => {
    const release = vi.fn();
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockResolvedValue({
        limits: {
          burst: { limit: 5, remaining: 4, reset: 1_800_000_000_000 },
          daily: { limit: 20, remaining: 19, reset: 1_800_000_000_000 },
          global: { limit: 500, remaining: 49, reset: 1_800_000_000_000 },
        },
        release,
      }),
    };
    const generateListing = vi.fn().mockResolvedValue(listingResult);
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const now = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(250);
    const handler = createGenerateListingHandler({
      guard,
      generateListing,
      logger,
      now,
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-request-id": "request-success",
      },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${tinyPng}`,
        mimeType: "image/png",
      }),
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("request-success");
    expect(response.headers.get("ratelimit-limit")).toBe("5");
    expect(response.headers.get("ratelimit-remaining")).toBe("4");
    expect(response.headers.get("x-ratelimit-daily-remaining")).toBe("19");
    expect(payload).toEqual({ ok: true, data: listingResult });
    expect(generateListing.mock.calls[0]?.[0].imageBase64).toBe(tinyPng);
    expect(release).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith({
      event: "generation_request",
      requestId: "request-success",
      status: 200,
      durationMs: 150,
      guardMode: "upstash",
    });
    expect(logger.warn).toHaveBeenCalledWith({
      event: "generation_quota_warning",
      requestId: "request-success",
      remaining: 49,
      limit: 500,
    });
    expect(JSON.stringify([logger.info.mock.calls, logger.warn.mock.calls])).not.toContain(
      tinyPng,
    );
  });
  it.each([
    ["INVALID_PRODUCT_PHOTO", 422],
    ["AI_INVALID_RESPONSE", 502],
  ] as const)("maps typed AI response error %s", async (code, status) => {
    const release = vi.fn();
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockResolvedValue({ limits: {}, release }),
    };
    const handler = createGenerateListingHandler({
      guard,
      generateListing: vi.fn().mockRejectedValue(new AiResponseError(code)),
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${tinyPng}`,
        mimeType: "image/png",
      }),
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(status);
    expect(payload.error.code).toBe(code);
  });

  it("returns a stable unknown error contract without exposing internals", async () => {
    const release = vi.fn();
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockResolvedValue({ limits: {}, release }),
    };
    const handler = createGenerateListingHandler({
      guard,
      generateListing: vi.fn().mockRejectedValue(new Error("secret detail")),
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${tinyPng}`,
        mimeType: "image/png",
      }),
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error.code).toBe("UNKNOWN");
    expect(JSON.stringify(payload)).not.toContain("secret detail");
  });

  it("maps typed provider rate-limit errors", async () => {
    const release = vi.fn();
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockResolvedValue({ limits: {}, release }),
    };
    const handler = createGenerateListingHandler({
      guard,
      generateListing: vi
        .fn()
        .mockRejectedValue(new GeminiProviderError("RATE_LIMITED", 429)),
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${tinyPng}`,
        mimeType: "image/png",
      }),
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error.code).toBe("RATE_LIMITED");
    expect(release).toHaveBeenCalledOnce();
  });

  it("maps the application deadline to the AI timeout contract", async () => {
    vi.useFakeTimers();
    const release = vi.fn();
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockResolvedValue({ limits: {}, release }),
    };
    const generateListing = vi.fn(
      (_input, signal?: AbortSignal) =>
        new Promise<never>((_resolve, reject) => {
          if (!signal) {
            reject(new Error("Missing abort signal"));
            return;
          }
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        }),
    );
    const handler = createGenerateListingHandler({
      guard,
      generateListing,
      timeoutMs: 25,
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${tinyPng}`,
        mimeType: "image/png",
      }),
    });

    const responsePromise = handler(request);
    await vi.advanceTimersByTimeAsync(25);
    const response = await responsePromise;
    const payload = await response.json();

    expect(response.status).toBe(504);
    expect(payload.error.code).toBe("AI_TIMEOUT");
    expect(release).toHaveBeenCalledOnce();
  });

  it("fails closed when the distributed guard is unavailable", async () => {
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockRejectedValue(new Error("redis unavailable")),
    };
    const handler = createGenerateListingHandler({
      guard,
      generateListing: vi.fn(),
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      body: "{}",
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("maps a rate-limit denial without parsing the request body", async () => {
    const guard = {
      mode: "upstash" as const,
      acquire: vi
        .fn()
        .mockRejectedValue(new GenerationGuardError("RATE_LIMITED", 123456)),
    };
    const handler = createGenerateListingHandler({
      guard,
      generateListing: vi.fn(),
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      body: "not-json",
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.error.code).toBe("RATE_LIMITED");
  });

  it("rejects malformed image data before calling Gemini", async () => {
    const release = vi.fn();
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockResolvedValue({ limits: {}, release }),
    };
    const generateListing = vi.fn();
    const handler = createGenerateListingHandler({ guard, generateListing });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: `data:image/png;base64,${"A".repeat(100)}`,
        mimeType: "image/png",
      }),
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error.code).toBe("INVALID_IMAGE");
    expect(generateListing).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
  });

  it("returns field-specific validation errors", async () => {
    const release = vi.fn();
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn().mockResolvedValue({
        limits: {},
        release,
      }),
    };
    const generateListing = vi.fn();
    const handler = createGenerateListingHandler({ guard, generateListing });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: "x".repeat(100),
        mimeType: "image/png",
        productName: "x".repeat(121),
      }),
    });

    const response = await handler(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toMatchObject({
      ok: false,
      error: {
        code: "INVALID_REQUEST",
        fields: {
          productName: expect.any(Array),
        },
      },
    });
    expect(generateListing).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
  });

  it("rejects an oversized declared body before acquiring an AI lease", async () => {
    const guard = {
      mode: "upstash" as const,
      acquire: vi.fn(),
    };
    const handler = createGenerateListingHandler({
      guard,
      generateListing: vi.fn(),
    });
    const request = new Request("http://localhost/api/generate-listing", {
      method: "POST",
      headers: {
        "content-length": "4250001",
      },
      body: "{}",
    });

    const response = await handler(request);

    expect(response.status).toBe(413);
    expect(guard.acquire).not.toHaveBeenCalled();
  });
});
