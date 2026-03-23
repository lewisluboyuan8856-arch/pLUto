# pLUto

pLUto is an AI-powered research assistant for students. It helps secondary school, JC / IB, and undergraduate users turn vague topics into stronger academic searches, review live research results, understand relevance in plain English, and build a saved shortlist with notes.

## Current scope

- Landing page
- Search page
- Results page
- Saved papers page
- Article detail page
- OpenAlex-first live search
- Optional Semantic Scholar enrichment
- Query refinement with graceful no-key fallback
- Plain-English summaries and relevance explanations
- Supabase email/password auth
- Supabase Google OAuth
- Saved papers and notes with browser fallback
- Grounded Research Assistant compare/chat workflow
- Vercel-ready metadata, robots, sitemap, and canonical URL handling

## Local env vars

Use these in `.env.local` for local development on `http://localhost:3003`.

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3003
GOOGLE_SITE_VERIFICATION=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENALEX_MAILTO=
SEMANTIC_SCHOLAR_API_KEY=
```

- `NEXT_PUBLIC_APP_URL` should be `http://localhost:3003` locally.
- `GOOGLE_SITE_VERIFICATION` is optional. Add it only after Search Console gives you a verification token.
- `OPENAI_API_KEY` is optional. Without it, query refinement and summaries fall back gracefully.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are optional locally. Without them, auth renders in a disabled state and saved papers stay browser-local.
- `OPENALEX_MAILTO` is optional but recommended for the OpenAlex polite pool.
- `SEMANTIC_SCHOLAR_API_KEY` is optional.

## Production env vars

Set these in Vercel for the Production environment.

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_SITE_VERIFICATION=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENALEX_MAILTO=
SEMANTIC_SCHOLAR_API_KEY=
```

- Set `NEXT_PUBLIC_APP_URL` to your real canonical production origin, for example `https://pluto.yourdomain.com`.
- Do not set `NEXT_PUBLIC_APP_URL` to `localhost` in Vercel.
- `GOOGLE_SITE_VERIFICATION` stays empty until you verify the deployed site in Search Console and choose meta-tag verification.
- No Supabase service role key is needed for this phase.

## Local setup

1. Copy the env template: `cp .env.example .env.local`
2. Set `NEXT_PUBLIC_APP_URL=http://localhost:3003`
3. Add any optional API keys you want to test locally
4. If you want auth enabled, create a Supabase project and add the Supabase URL and anon key
5. Install dependencies: `npm install`
6. Start the app: `npm run dev`
7. Open `http://localhost:3003`

## GitHub push

If this folder is not already a Git repo, run:

1. `git init`
2. `git branch -M main`
3. `git add .`
4. `git commit -m "Prepare pLUto for deployment"`

Then create an empty GitHub repository and push:

1. `git remote add origin https://github.com/<your-user>/<your-repo>.git`
2. `git push -u origin main`

## Vercel deployment

1. Push the project to GitHub.
2. In Vercel, click `Add New...` then `Project`.
3. Import the GitHub repository.
4. Let Vercel detect `Next.js`.
5. In the Vercel project settings, add the Production env vars listed above.
6. Deploy.
7. Open the generated `https://<project>.vercel.app` URL and confirm the site loads.
8. If you are not using a custom domain yet, set `NEXT_PUBLIC_APP_URL` in Vercel to that `vercel.app` production URL and redeploy.
9. If you later add a custom domain, update `NEXT_PUBLIC_APP_URL` to the custom domain and redeploy again.

## Supabase URL settings

For local development on `localhost:3003`:

- Site URL: `http://localhost:3003`
- Redirect URL: `http://localhost:3003/auth/callback`

For production:

- Site URL: `https://your-domain.com`
- Redirect URL: `https://your-domain.com/auth/callback`

Recommended production setup if one Supabase project serves both local and production:

- Set the Supabase `Site URL` to the production domain
- Add `http://localhost:3003/auth/callback` as an additional redirect URL
- Add `https://your-domain.com/auth/callback` as an additional redirect URL
- If you use the default Vercel production hostname before a custom domain, also add `https://<project>.vercel.app/auth/callback`

For Google OAuth:

1. In Supabase, enable the Google provider.
2. In Google Cloud, create a Web OAuth client.
3. Add the Supabase Google callback URI that Supabase shows in the provider setup screen.
4. If you later change Supabase project or provider settings, update the Google OAuth client there too.

Google login is not production-ready by magic after deploy. It still requires the Supabase and Google OAuth URLs above to be configured correctly.

## Google indexing setup

Deploy first, then do the following:

1. Open Google Search Console.
2. Add your production site as a property.
3. Verify ownership.
4. Submit `https://your-domain.com/sitemap.xml` in the Search Console `Sitemaps` section.
5. Use URL Inspection on the homepage and request indexing if needed.
6. Wait for Google to crawl and index the site.

This project is indexing-ready after deployment, but it is not automatically discoverable in Google until you deploy it, verify the property, and Google actually crawls it.

If you prefer Search Console meta-tag verification instead of DNS verification:

1. Copy the verification token from Search Console.
2. Put it in Vercel as `GOOGLE_SITE_VERIFICATION`.
3. Redeploy.

## Custom domain later

1. In Vercel, open the project and go to `Settings > Domains`.
2. Add `your-domain.com` or a subdomain like `pluto.yourdomain.com`.
3. Follow Vercel’s DNS instructions with your DNS provider.
4. After the domain is active, update `NEXT_PUBLIC_APP_URL` in Vercel to the final canonical domain.
5. Update Supabase `Site URL` and redirect URLs to that same domain.
6. Resubmit the sitemap in Search Console if the canonical domain changed.

## Local test checklist

1. Run with no Supabase env vars and confirm `/auth` shows auth-disabled state.
2. Confirm `/saved` still works with browser-local fallback.
3. Search for a topic and confirm search/results/article detail still work.
4. If Supabase env vars are present, sign in with email/password.
5. If Google OAuth is configured, test Google login.
6. Save a paper while signed in and confirm it appears in the synced shortlist.
7. Add a note and refresh to confirm it persists.
8. Select 2 to 5 papers from `/results` or `/saved` and open `/assistant`.
9. Confirm the assistant page loads and the selected sources appear in context.
10. Ask a grounded question or run `Compare papers`.
11. Run `npm run build`
12. Run `npm run lint`
13. Run `npm run typecheck`
14. Run `npm run dev`

## Notes

- The landing page and `/search` are the public crawlable pages included in the sitemap.
- `/auth`, `/saved`, `/results`, and article detail pages are intentionally marked `noindex`.
- Preview deployments are treated as non-indexable by the app’s robots and metadata handling.
