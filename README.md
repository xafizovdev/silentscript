# silent script. Store

Production-oriented notebook storefront built with Next.js 16, React 19 and TypeScript.

## Included

- Calm, responsive editorial storefront
- Uzbek, English and Russian interface with a persistent language preference
- Product names, descriptions, search, cart, customizer, FAQ and checkout translated in all three languages
- Product quick-view dialogs
- Interactive notebook customizer with live preview and price calculation
- Versioned cart persistence using `localStorage`
- Hydration-safe deterministic price formatting
- Checkout form for customer name, phone, address and comment
- Direct Telegram order draft to `@thatswriter`
- Telegram channel links to `@silentscriptuz`
- Keyboard Escape support, visible focus states and reduced-motion support
- SEO metadata, Open Graph image, robots and sitemap
- No database or environment variables required for the first deploy

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production check

```bash
npm run typecheck
npm run build
npm run start
```

## Deploy to Vercel

1. Upload this folder to a GitHub repository.
2. Open Vercel and import the repository.
3. Vercel detects Next.js automatically.
4. Click **Deploy**.

Or use the CLI:

```bash
npm i -g vercel
vercel --prod
```

## Main files

- `app/page.tsx` — storefront, cart, checkout and language switching
- `data/site-copy.ts` — all Uzbek, English and Russian interface text
- `data/products.ts` — product catalog and localized product descriptions
- `lib/format.ts` — deterministic price formatting
- `app/globals.css` — responsive design system and components

## Before the public launch

- Confirm final prices and product specifications in `data/products.ts`.
- Replace CSS notebook mockups with real product photographs when ready.
- Replace `https://silentscript.uz` in metadata and sitemap if a different domain is used.
- Confirm delivery timing and payment conditions before advertising them publicly.
