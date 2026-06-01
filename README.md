# Katalogin

Katalogin turns one product photo into an editable Indonesian marketplace listing draft.

The app is built for Indonesian micro-sellers who need a quick first draft for Shopee, Tokopedia, TikTok Shop, or similar marketplaces. A seller uploads one product photo, adds optional context, reviews the generated copy, edits uncertain details, then copies the result manually into a marketplace.

This is a focused portfolio project for full-stack product delivery and multimodal AI orchestration. It is not a catalog manager, SaaS dashboard, chatbot, or saved listing system.

## Scope

- Single-photo upload
- Optional seller context
- Indonesian listing title, description, keywords, and selling points
- Price range estimate
- Category recommendation
- Warnings for uncertain or missing information
- Editable review screen
- Manual copy to clipboard
- No database
- No file storage

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

## License

MIT
