# TypeScript client — Visa LK Perks API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/visa-lk-perks-api-docs-client` · Staging path: `api-docs/packages/visa-lk-perks-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { VisaLkPerksApiDocsClient } from '@cookie-cat21/visa-lk-perks-api-docs-client';

const client = new VisaLkPerksApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.portalPerks();
console.log(data);
```

## Methods

- `portalPerks()` — POST `/offers/api/portal/portal/perks/` — VMORC perks; needs siteId + perkTypeRequests body.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
