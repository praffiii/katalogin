# Katalogin

Katalogin turns one product photo into an editable Indonesian marketplace Listing Draft.

It is built for Indonesian UMKM sellers who need a quick first draft for Shopee, Tokopedia, TikTok Shop, or similar marketplaces. A seller uploads one Product Photo, adds optional Seller Context, reviews and edits the generated Listing Copy, then copies the result manually into a marketplace.

Katalogin is not a catalog manager, marketplace integration, chatbot, saved listing system, or trusted pricing engine.

## Problem

Early-stage sellers often have usable product photos but need help turning visible product details into natural Indonesian listing copy. Katalogin gives them a fast draft while keeping uncertain product facts visible for review.

## MVP Flow

1. Upload one Product Photo.
2. Optionally add product name, condition, marketplace preference, and notes.
3. Generate a Listing Draft through the server API route.
4. Review and edit title, description, selling points, and SEO Keywords.
5. Copy marketplace text or a fuller draft summary.

## Scope

- Single-photo upload.
- Optional seller context.
- Indonesian listing title, description, keywords, and selling points.
- Price Guidance with rationale and confidence.
- Category Suggestion.
- Product Uncertainty warnings.
- Editable review screen.
- Manual clipboard copy.
- No database or file storage.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Validation | Zod |
| AI | Gemini Flash via `@google/genai` |
| Package manager | pnpm |
| Deployment target | Vercel |

## Local Development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

Required environment variables:

```txt
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

Get a Gemini API key from Google AI Studio.

## Scripts

```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## Architecture

```txt
Browser
  -> upload product photo
  -> convert image to base64
  -> POST /api/generate-listing
  -> validate request with Zod
  -> call Gemini Flash
  -> validate structured JSON response
  -> return editable listing draft
```

State lives in the browser during the draft flow. The server route only proxies the AI request and validates input/output. There is no database or persisted upload.

## Deployment Notes

Deploy on Vercel or another Next.js-compatible host. Configure `GEMINI_API_KEY` and optional `GEMINI_MODEL` in the deployment environment. The API route uses the Node.js runtime and does not require persistent storage.

## License

MIT
