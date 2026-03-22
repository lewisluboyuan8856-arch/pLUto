# pLUto

pLUto is a production-style MVP for an AI-powered research assistant for students. Phase 1 ships a polished Next.js frontend with mock data only, so the core product flow is runnable without OpenAI, Supabase, OpenAlex, or Semantic Scholar keys.

## Phase 1 scope

- Landing page
- Search page
- Results page
- Saved papers page
- Article detail page
- Mock query rewriting and mock-ranked research results
- Local browser save + note flow for shortlist testing

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local env file:

   ```bash
   cp .env.example .env.local
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Environment variables for Phase 1

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_APP_URL` is optional for local development, but keeping it set makes metadata and sitemap URLs consistent.

## How to test Phase 1 locally

1. Visit `/` and confirm the landing page shows the `pLUto` branding and featured topic pills.
2. Go to `/search`, submit one of the sample prompts, and confirm you land on `/results`.
3. On `/results`, change filters and verify the mock article cards reorder or reduce correctly.
4. Save one or two papers, then open `/saved` and confirm they appear in the shortlist.
5. Add a note on `/saved`, refresh the page, and confirm the note persists in local browser storage.
6. Open a paper’s detail page and verify the key findings, limitations, and follow-up terms render.

## Notes

- Phase 1 is intentionally mock-only. No live academic APIs or authentication are required yet.
- Saved papers and notes are stored in browser `localStorage` for now.
- Later phases will replace the mock pipeline with real search integrations, OpenAI enrichment, and Supabase-backed auth/data.
