import { describe, expect, it } from "vitest";
import { listingResultSchema } from "@/lib/schemas";

const validResult = {
  isProductPhoto: true,
  title: "Produk contoh berkualitas",
  seoKeywords: ["produk", "contoh", "marketplace"],
  description: "Deskripsi produk contoh yang cukup panjang untuk divalidasi.",
  priceEstimate: {
    min: 10_000,
    max: 20_000,
    currency: "IDR" as const,
    confidence: "medium" as const,
    rationale: "Estimasi berdasarkan informasi visual yang tersedia.",
  },
  category: {
    marketplace: "general",
    recommended: "Kategori contoh",
    alternatives: ["Alternatif"],
  },
  sellingPoints: ["Poin satu", "Poin dua", "Poin tiga"],
  warnings: [],
};

describe("listingResultSchema", () => {
  it("rejects generated fields that exceed their output budget", () => {
    const result = listingResultSchema.safeParse({
      ...validResult,
      title: "x".repeat(121),
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ["description", { description: "x".repeat(2_001) }],
    ["keyword", { seoKeywords: ["x".repeat(61), "dua", "tiga"] }],
    [
      "rationale",
      {
        priceEstimate: {
          ...validResult.priceEstimate,
          rationale: "x".repeat(501),
        },
      },
    ],
    [
      "category",
      {
        category: {
          ...validResult.category,
          recommended: "x".repeat(121),
        },
      },
    ],
    ["selling point", { sellingPoints: ["x".repeat(241), "dua", "tiga"] }],
    ["warning", { warnings: ["x".repeat(301)] }],
  ])("rejects an overlong %s", (_label, override) => {
    expect(
      listingResultSchema.safeParse({ ...validResult, ...override }).success,
    ).toBe(false);
  });

  it("rejects an empty zero-value price range", () => {
    const result = listingResultSchema.safeParse({
      ...validResult,
      priceEstimate: {
        ...validResult.priceEstimate,
        min: 0,
        max: 0,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects a reversed price range", () => {
    const result = listingResultSchema.safeParse({
      ...validResult,
      priceEstimate: {
        ...validResult.priceEstimate,
        min: 30_000,
        max: 20_000,
      },
    });

    expect(result.success).toBe(false);
  });
});
