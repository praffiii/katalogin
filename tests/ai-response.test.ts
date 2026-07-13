import { describe, expect, it } from "vitest";
import {
  AiResponseError,
  applyListingSafetyWarnings,
  parseListingResponseText,
} from "@/lib/ai-response";

const validResult = {
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

describe("applyListingSafetyWarnings", () => {
  it("flags seller-facing output that is unlikely to be Indonesian", () => {
    const result = applyListingSafetyWarnings(
      {
        ...validResult,
        description: "Premium daily bag with durable material and modern style.",
      },
      {},
    );

    expect(result.warnings.join(" ")).toContain("bahasa Indonesia");
  });

  it("adds an uncertainty warning for an unsupported certification claim", () => {
    const result = applyListingSafetyWarnings(
      {
        ...validResult,
        description: `${validResult.description} Sudah BPOM.`,
      },
      {},
    );

    expect(result.warnings.join(" ")).toContain("BPOM");
  });
});

describe("parseListingResponseText", () => {
  it("maps a non-product response to a typed invalid-photo error", () => {
    expect(() =>
      parseListingResponseText('{"isProductPhoto":false}'),
    ).toThrow(
      expect.objectContaining({
        code: "INVALID_PRODUCT_PHOTO",
      }) as AiResponseError,
    );
  });
});
