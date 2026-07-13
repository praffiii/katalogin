import type { z } from "zod";
import type {
  generateListingRequestSchema,
  listingResultSchema,
  marketplaceSchema,
} from "@/lib/schemas";

export type Marketplace = z.infer<typeof marketplaceSchema>;
export type GenerateListingRequest = z.infer<
  typeof generateListingRequestSchema
>;
export type ListingResult = z.infer<typeof listingResultSchema>;

export type ApiSuccess = {
  ok: true;
  data: ListingResult;
};

export type ApiError = {
  ok: false;
  error: {
    code:
      | "INVALID_REQUEST"
      | "INVALID_IMAGE"
      | "UNSUPPORTED_MEDIA_TYPE"
      | "INVALID_PRODUCT_PHOTO"
      | "IMAGE_TOO_LARGE"
      | "AI_TIMEOUT"
      | "AI_INVALID_RESPONSE"
      | "RATE_LIMITED"
      | "CONCURRENCY_LIMITED"
      | "SERVICE_UNAVAILABLE"
      | "UNKNOWN";
    message: string;
    requestId?: string;
    fields?: Record<string, string[]>;
  };
};

export type GenerateListingResponse = ApiSuccess | ApiError;
