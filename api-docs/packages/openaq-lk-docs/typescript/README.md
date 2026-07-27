# TypeScript client — OpenAQ Sri Lanka

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/openaq-lk-docs-client` · Staging path: `api-docs/packages/openaq-lk-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { OpenaqLkDocsClient } from '@cookie-cat21/openaq-lk-docs-client';

const client = new OpenaqLkDocsClient({ defaultDelayMs: 1000 });
const data = await client.locationsLk();
console.log(data);
```

## Methods

- `locationsLk()` — GET `/v3/locations` — LK monitoring locations (country id may change).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
