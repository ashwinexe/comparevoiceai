# CompareVoiceAI static pricing site

## Architecture

This repository builds a static React/Vite site. It has no application server, database, accounts, analytics SDK, or runtime provider API. Pricing and blog content are generated at build time from `shared/pricing-catalog.ts` and `blog/posts/`.

Build with Node.js 20.19 or newer, as declared in `package.json`.

## Commands

- `npm run dev` — generate local content and run Vite on port 5000.
- `npm run validate` — type-check, test pricing/calculator invariants, build, and prerender every route.
- `npm run build` — write the deployable site to `dist/`.
- `npm run preview` — serve `dist/` locally on port 4173.
- `npm start` — serve `dist/` on all interfaces, using `PORT` when supplied by the host.

## Deployment

The document root is `dist/`. The static host must serve directory indexes, redirect slashless directory routes to their trailing-slash form, and return `404.html` with an HTTP 404 status for unknown paths. `scripts/serve-static.ts` is the reference behavior for environments that need a small Node static server.

Pricing is a dated snapshot. Every catalog row includes an official source and verification date. Generation fails when a calculator-eligible promotional rate has passed its declared expiry, forcing a catalog refresh before deployment.
