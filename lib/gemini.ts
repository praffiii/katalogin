import { GoogleGenAI } from "@google/genai";
import { parseListingResponseText } from "@/lib/ai-response";
import { buildListingPrompt } from "@/lib/prompt";
import type { GenerateListingRequest, ListingResult } from "@/types/listing";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenAI({ apiKey });
}

export async function generateListingWithGemini(
  input: GenerateListingRequest,
): Promise<ListingResult> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const prompt = buildListingPrompt(input);

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: input.mimeType,
              data: input.imageBase64.replace(
                /^data:image\/[a-zA-Z]+;base64,/,
                "",
              ),
            },
          },
        ],
      },
    ],
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty text");
  }

  return parseListingResponseText(text);
}
