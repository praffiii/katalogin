import { z } from "zod";
import { listingResultSchema } from "./schemas.ts";
import type { GenerateListingRequest, ListingResult } from "@/types/listing";

export class AiResponseError extends Error {
  constructor(
    public readonly code: "INVALID_PRODUCT_PHOTO" | "AI_INVALID_RESPONSE",
  ) {
    super(code);
    this.name = "AiResponseError";
  }
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(withoutFence);
}

const productPhotoFlagSchema = z.object({
  isProductPhoto: z.boolean(),
});

const riskyClaims = [
  { label: "BPOM", pattern: /\bbpom\b/i },
  { label: "halal", pattern: /\bhalal\b/i },
  { label: "SNI", pattern: /\bsni\b/i },
  { label: "garansi", pattern: /\bgaransi\b/i },
  { label: "100%", pattern: /100\s*%/i },
  { label: "nomor 1", pattern: /\bnomor\s*1\b/i },
  { label: "terbaik", pattern: /\bterbaik\b/i },
  { label: "gratis ongkir", pattern: /\bgratis\s+ongkir\b/i },
  { label: "best seller", pattern: /\bbest\s*seller\b/i },
  { label: "viral", pattern: /\bviral\b/i },
];

export function applyListingSafetyWarnings(
  result: ListingResult,
  input: Pick<GenerateListingRequest, "productName" | "notes">,
): ListingResult {
  const sellerEvidence = `${input.productName ?? ""} ${input.notes ?? ""}`;
  const generatedText = [
    result.title,
    result.description,
    ...result.sellingPoints,
  ].join(" ");
  const warnings = [...result.warnings];
  const likelyIndonesian =
    /\b(dan|yang|untuk|dengan|ini|produk|cocok|mudah|tersedia|bahan|ukuran|warna)\b/i.test(
      result.description,
    );

  if (!likelyIndonesian && warnings.length < 6) {
    warnings.push(
      "Teks mungkin belum sepenuhnya menggunakan bahasa Indonesia. Periksa sebelum menerbitkan.",
    );
  }

  for (const claim of riskyClaims) {
    if (
      claim.pattern.test(generatedText) &&
      !claim.pattern.test(sellerEvidence) &&
      warnings.length < 6
    ) {
      warnings.push(
        `Klaim ${claim.label} belum didukung oleh konteks penjual. Periksa sebelum menerbitkan.`,
      );
    }
  }

  return { ...result, warnings };
}

export function parseListingResponseText(text: string) {
  let json: unknown;
  try {
    json = extractJson(text);
  } catch {
    throw new AiResponseError("AI_INVALID_RESPONSE");
  }

  const productPhotoFlag = productPhotoFlagSchema.safeParse(json);

  if (productPhotoFlag.success && !productPhotoFlag.data.isProductPhoto) {
    throw new AiResponseError("INVALID_PRODUCT_PHOTO");
  }

  const parsed = listingResultSchema.safeParse(json);
  if (!parsed.success) {
    throw new AiResponseError("AI_INVALID_RESPONSE");
  }

  return parsed.data;
}
