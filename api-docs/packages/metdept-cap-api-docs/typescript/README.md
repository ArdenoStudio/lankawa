# TypeScript client — Met Dept CAP / Advisories

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/metdept-cap-api-docs-client` · Staging path: `api-docs/packages/metdept-cap-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { MetdeptCapApiDocsClient } from '@cookie-cat21/metdept-cap-api-docs-client';

const client = new MetdeptCapApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.capEnRss();
console.log(data);
```

## Methods

- `capEnRss()` — GET `/images/XML/cap_en.xml` — CAP English warnings RSS/XML.
- `capSiRss()` — GET `/images/XML/cap_si.xml` — CAP Sinhala warnings.
- `capTaRss()` — GET `/images/XML/cap_ta.xml` — CAP Tamil warnings.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
