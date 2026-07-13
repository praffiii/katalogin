import {
  ApiError,
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";
import { z } from "zod";
import {
  applyListingSafetyWarnings,
  parseListingResponseText,
} from "@/lib/ai-response";
import {
  buildSellerContextPrompt,
  LISTING_SYSTEM_INSTRUCTION,
} from "@/lib/prompt";
import { listingAiResponseSchema } from "@/lib/schemas";
import type { GenerateListingRequest, ListingResult } from "@/types/listing";

type GenerateContentRequest = Parameters<
  GoogleGenAI["models"]["generateContent"]
>[0];

type GeminiClientLike = {
  models: {
    generateContent(request: GenerateContentRequest): Promise<{ text?: string }>;
  };
};

export class GeminiProviderError extends Error {
  constructor(
    public readonly code:
      | "RATE_LIMITED"
      | "CONFIGURATION_ERROR"
      | "PROVIDER_UNAVAILABLE",
    public readonly status?: number,
  ) {
    super(code);
    this.name = "GeminiProviderError";
  }
}

function mapProviderError(error: ApiError) {
  if (error.status === 429) {
    return new GeminiProviderError("RATE_LIMITED", error.status);
  }
  if (error.status === 401 || error.status === 403) {
    return new GeminiProviderError("CONFIGURATION_ERROR", error.status);
  }
  return new GeminiProviderError("PROVIDER_UNAVAILABLE", error.status);
}

export function createGeminiListingGenerator(options: {
  client: GeminiClientLike;
  model: string;
}) {
  return async function generateListing(
    input: GenerateListingRequest,
    abortSignal?: AbortSignal,
  ): Promise<ListingResult> {
    let response: { text?: string };
    try {
      response = await options.client.models.generateContent({
        model: options.model,
        config: {
          abortSignal,
          systemInstruction: LISTING_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseJsonSchema: z.toJSONSchema(listingAiResponseSchema),
          maxOutputTokens: 1_600,
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
              category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              { text: buildSellerContextPrompt(input) },
              {
                inlineData: {
                  mimeType: input.mimeType,
                  data: input.imageBase64,
                },
              },
            ],
          },
        ],
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw mapProviderError(error);
      }
      throw error;
    }

    if (!response.text) {
      throw new Error("AI_INVALID_RESPONSE");
    }

    return applyListingSafetyWarnings(parseListingResponseText(response.text), input);
  };
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateListingWithGemini(
  input: GenerateListingRequest,
  abortSignal?: AbortSignal,
): Promise<ListingResult> {
  return createGeminiListingGenerator({
    client: getClient(),
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  })(input, abortSignal);
}
