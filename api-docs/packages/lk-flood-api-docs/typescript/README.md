# TypeScript client — lk-flood-api (nuuuwan)

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/lk-flood-api-docs-client` · Staging path: `api-docs/packages/lk-flood-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { LkFloodApiDocsClient } from '@cookie-cat21/lk-flood-api-docs-client';

const client = new LkFloodApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.floodLatest();
console.log(data);
```

## Methods

- `floodLatest()` — GET `/lk_flood.json` — Flood station levels JSON used by Lankawa flood adapter.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
