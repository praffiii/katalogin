import { z } from "zod";
import { listingResultSchema } from "./schemas.ts";

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

export function parseListingResponseText(text: string) {
  const json = extractJson(text);
  const productPhotoFlag = productPhotoFlagSchema.safeParse(json);

  if (productPhotoFlag.success && !productPhotoFlag.data.isProductPhoto) {
    throw new Error("INVALID_PRODUCT_PHOTO");
  }

  return listingResultSchema.parse(json);
}
