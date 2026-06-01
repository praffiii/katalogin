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

export const listingResultSchema = z.object({
  isProductPhoto: z.boolean(),
  title: z.string().min(5),
  seoKeywords: z.array(z.string().min(1)).min(3).max(12),
  description: z.string().min(20),
  priceEstimate: z.object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
    currency: z.literal("IDR"),
    confidence: z.enum(["low", "medium", "high"]),
    rationale: z.string().min(10),
  }),
  category: z.object({
    marketplace: z.string().min(1),
    recommended: z.string().min(1),
    alternatives: z.array(z.string().min(1)).max(2),
  }),
  sellingPoints: z.array(z.string().min(1)).min(3).max(5),
  warnings: z.array(z.string()).max(6),
});
