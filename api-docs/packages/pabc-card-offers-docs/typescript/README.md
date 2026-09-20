# TypeScript client — Pan Asia Bank Card Offers

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/pabc-card-offers-docs-client` · Staging path: `api-docs/packages/pabc-card-offers-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { PabcCardOffersDocsClient } from '@cookie-cat21/pabc-card-offers-docs-client';

const client = new PabcCardOffersDocsClient({ defaultDelayMs: 1000 });
const data = await client.cardOffersJs();
console.log(data);
```

## Methods

- `cardOffersJs()` — GET `/personal/cards/offers` — Offers page; arr_offers JS after Sucuri cookie.
- `seniorFdHtml()` — GET `/personal/deposits/senior-citizens-fixed-deposit` — Senior FD HTML (main ladder may be PDF-only).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
