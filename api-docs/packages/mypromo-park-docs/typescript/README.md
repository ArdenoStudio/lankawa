# TypeScript client — MyPromo.lk (park — ToS)

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/mypromo-park-docs-client` · Staging path: `api-docs/packages/mypromo-park-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { MypromoParkDocsClient } from '@cookie-cat21/mypromo-park-docs-client';

const client = new MypromoParkDocsClient({ defaultDelayMs: 1000 });
const data = await client.mypromoParked();
console.log(data);
```

## Methods

- `mypromoParked()` — GET `/` — PARK — ToS bans scrape; prefer bank first-party.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
