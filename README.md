# secure-video-platform-web

Customer-facing website for the Secure Video Platform — Next.js (App Router) + TypeScript (strict) + Tailwind CSS.

Project requirements and design live in the local workspace guide folder `../secure-video-platform/` (`AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/IMPLEMENTATION_PLAN.md`). That folder is not version-controlled or published.

This app never holds payment, video-provider, storage, or email secrets. All data and decisions come from `secure-video-platform-api`.

## Requirements

- Node.js 24 (see `.nvmrc`) and npm

## Setup

Run the API first (see its README), then:

```bash
npm install
cp .env.example .env.local   # set API_PROXY_SECRET to the API's WEB_PROXY_SECRET
npm run dev                  # http://localhost:3000
```

The API's `WEB_APP_URL` must match this site's origin (e.g. `http://localhost:3000`) — the API rejects state-changing requests from any other Origin. If port 3000 is taken, run `npm run dev -- --port 3100` and set the API's `WEB_APP_URL` to match.

## How it talks to the API

- **Browser → `/api/*` (this site) → API `/v1/*`.** `src/app/api/[...path]/route.ts` is a backend-for-frontend proxy (`src/lib/bff/forward.ts`): it forwards an allowlist of headers (including the session cookie and the browser's Origin), adds the shared `X-Proxy-Secret` and the visitor's IP (`x-nf-client-connection-ip` on Netlify), and relays `Set-Cookie` back so the session cookie is first-party and `HttpOnly` on this domain. `admin/*` paths are refused.
- **Server Components** read with `src/lib/api/server.ts` (`server-only`). Anything that reads the session renders inside `<Suspense>` (Cache Components), so the shell is prerendered and the signed-in parts stream in.
- **Catalog**: Home (`/`, chips for Free/Paid/categories), `/results` and `/watch/[slug]` read the public catalog through `src/lib/api/catalog.ts` with `'use cache'` (minutes, tag `catalog`). `/videos` and `/videos/[slug]` redirect to `/` and `/watch/[slug]`. Run `npm run seed:demo-catalog` in the API for sample content.
- **Bundles and plans**: `/bundles`, `/bundles/[slug]`, `/plans`, plus Home shelves. The watch page asks the API (`GET /v1/videos/:slug/access`) whether the signed-in customer owns the video, has it through a plan, or needs to buy or renew.
- **Buying**: Buy buttons create an order (`POST /api/orders`, price from the API) and open `/checkout/[orderId]`; Pay sends the customer to Paystack (or the local stand-in). Paystack returns them to `/checkout/callback?reference=…`, which asks the API to verify and keeps checking while mobile money confirms. `/library` and `/account/purchases` show what they own and their orders.
- **Watching**: the watch page's player starts a playback session when the viewer presses Play (the API checks access and the 2-device limit), plays with Mux Player and the API's signed tokens (a plain `<video>` with the local stand-in), heartbeats to keep them fresh, and shows a moving watermark with the viewer's masked email. It explains every stop (stream limit with "Watch here instead", ended on another device, access ended with Renew, playback errors with Try again). Theater mode on desktop; the player sticks to the top on phones.
- **Subscriptions**: recurring plans on `/plans` subscribe through the same checkout (card only, renews automatically). `/account/subscriptions` shows status and the next payment, opens Paystack's page to change the card after a failed renewal, and cancels (access continues until the paid period ends).
- **Route protection** (`src/proxy.ts`) only redirects signed-out visitors to `/login`; the API enforces every rule.
- Typed responses come from the API's OpenAPI document: `npm run api:types` (reads `../secure-video-platform-api/openapi.json` — run `npm run openapi:export` in the API first).

## Design system

YouTube-style layout (see `docs/PROTOTYPE_BRIEF.md` §2a in the workspace guide folder), placeholder brand "Vaultline":

- Tokens (colors, fonts, breakpoints) in `src/app/globals.css` (`@theme`). Swapping the brand means editing tokens only.
- Light/dark/system theme stored in the `svp_theme` cookie and applied before paint (no flash).
- Primitives in `src/components/ui/` (pill buttons, chips, text fields, dialog, menu, snackbar, avatar); shell in `src/components/shell/` (masthead, guide sidebar with full/mini/drawer states, mobile bottom tabs).
- Icons: Material Symbols (Apache 2.0), generated into `src/components/icons/paths.ts` by `npm run icons` — add names in `scripts/generate-icons.mjs`.

## Scripts

| Command                           | Purpose                                               |
| --------------------------------- | ----------------------------------------------------- |
| `npm run dev`                     | Development server on port 3000                       |
| `npm run build` / `npm start`     | Production build / serve build                        |
| `npm run lint`                    | ESLint (Next.js core-web-vitals + TypeScript rules)   |
| `npm run format` / `format:check` | Prettier                                              |
| `npm run typecheck`               | Generate Next.js route types, then `tsc --noEmit`     |
| `npm test`                        | Unit/component tests (Vitest + React Testing Library) |

## Environment variables

See `.env.example`. Only `NEXT_PUBLIC_*` variables reach the browser, and none of them are secret.

## Deployment

Target: Netlify. Deployment documentation is delivered in Phase 11.

## Note for coding agents

`AGENTS.md` in this folder is generated by Next.js and points to the version-matched docs in `node_modules/next/dist/docs/`. Project-wide rules are in `../secure-video-platform/AGENTS.md`.
