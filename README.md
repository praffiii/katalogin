# Listify

Listify turns one product photo plus optional seller context into an editable Indonesian marketplace Listing Draft.

It is built for Indonesian early-stage UMKM sellers who need a useful first draft for Shopee, Tokopedia, TikTok Shop, or similar marketplaces without learning prompt engineering or managing a heavy catalog tool.

Listify is a draft workspace, not a marketplace integration. Sellers review, edit, and manually copy the result.

## What It Demonstrates

- Multimodal AI flow from product photo to structured Indonesian Listing Copy.
- Server-side request and response validation with Zod.
- Honest handling of Product Uncertainty instead of invented facts.
- Editable seller review flow before copy-out.
- Lightweight no-storage architecture suitable for a focused MVP.

## Product Scope

Listify supports one temporary Draft Session:

1. Upload one Product Photo.
2. Optionally add Seller Context such as product name, condition, marketplace preference, and notes.
3. Generate a Listing Draft through the server API route.
4. Review and edit title, description, selling points, SEO Keywords, Category Suggestion, and Price Guidance.
5. Copy marketplace-ready text or a fuller seller summary for manual use elsewhere.

The MVP intentionally does not include:

- Marketplace publishing, sync, or export.
- Product catalog management.
- Saved listings or listing history.
- Database or file storage.
- Chatbot interaction.
- Live market research or trusted price estimation.
- Product photo editing, enhancement, or background removal.

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

Install dependencies:

```bash
pnpm install
```

Create local environment file:

```bash
cp .env.example .env.local
```

Set required variables:

```txt
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

Get a Gemini API key from Google AI Studio.

Start development server:

```bash
pnpm dev
```

Open `http://localhost:3000`.

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
  -> upload one Product Photo
  -> convert image to base64
  -> collect optional Seller Context
  -> POST /api/generate-listing
  -> validate request with Zod
  -> call Gemini Flash
  -> validate structured JSON response
  -> return editable Listing Draft
```

State lives in the browser during the Draft Flow. The API route proxies the AI request, validates input and output, and returns structured draft data. Listify does not persist photos, drafts, or Draft Sessions.

Key files:

| Area | Path |
| --- | --- |
| Draft Flow UI | `components/draft-flow/DraftFlow.tsx` |
| Review editor | `components/listing/ListingResultEditor.tsx` |
| API route | `app/api/generate-listing/route.ts` |
| Gemini client | `lib/gemini.ts` |
| Prompt construction | `lib/prompt.ts` |
| Schemas | `lib/schemas.ts` |

## Verification

Run lint:

```bash
pnpm lint
```

Run production build:

```bash
pnpm build
```

## Deployment

Deploy on Vercel or another Next.js-compatible host. Configure `GEMINI_API_KEY` and optional `GEMINI_MODEL` in the deployment environment.

The API route uses the Node.js runtime and does not require persistent storage.

## Project References

- Product references: `docs/resources/reference-requirement`
- Visual references: `docs/resources/reference-design`
- Design constraints: `.impeccable/design.json`

## License

MIT
