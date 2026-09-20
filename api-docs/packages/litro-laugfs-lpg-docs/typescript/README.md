# TypeScript client — Litro + LAUGFS LPG price pages

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/litro-laugfs-lpg-docs-client` · Staging path: `api-docs/packages/litro-laugfs-lpg-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { LitroLaugfsLpgDocsClient } from '@cookie-cat21/litro-laugfs-lpg-docs-client';

const client = new LitroLaugfsLpgDocsClient({ defaultDelayMs: 1000 });
const data = await client.litroPrices();
console.log(data);
```

## Methods

- `litroPrices()` — GET `litrogas.com/` — Litro cylinder price HTML scrape surface.
- `laugfsPrices()` — GET `laugfs.lk/` — LAUGFS LPG price HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
