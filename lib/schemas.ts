import { z } from "zod";

export const marketplaceSchema = z.enum([
  "shopee",
  "tokopedia",
  "tiktok",
  "general",
]);

export const generateListingRequestSchema = z.object({
  imageBase64: z.string().min(100),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  productName: z.string().max(120).optional(),
  condition: z.enum(["new", "used"]).optional(),
  marketplace: marketplaceSchema.optional(),
  notes: z.string().max(500).optional(),
});

const priceEstimateSchema = z
  .object({
    min: z.number().int().positive().max(1_000_000_000_000),
    max: z.number().int().positive().max(1_000_000_000_000),
    currency: z.literal("IDR"),
    confidence: z.enum(["low", "medium", "high"]),
    rationale: z.string().min(10).max(500),
  })
  .refine(({ min, max }) => min <= max, {
    message: "Harga minimum tidak boleh melebihi harga maksimum.",
    path: ["max"],
  });

export const listingResultSchema = z.object({
  isProductPhoto: z.boolean(),
  title: z.string().min(5).max(120),
  seoKeywords: z.array(z.string().min(1).max(60)).min(3).max(12),
  description: z.string().min(20).max(2_000),
  priceEstimate: priceEstimateSchema,
  category: z.object({
    marketplace: z.string().min(1).max(40),
    recommended: z.string().min(1).max(120),
    alternatives: z.array(z.string().min(1).max(120)).max(2),
  }),
  sellingPoints: z.array(z.string().min(1).max(240)).min(3).max(5),
  warnings: z.array(z.string().max(300)).max(6),
});

export const listingAiResponseSchema = z.union([
  z.object({ isProductPhoto: z.literal(false) }),
  listingResultSchema,
]);
