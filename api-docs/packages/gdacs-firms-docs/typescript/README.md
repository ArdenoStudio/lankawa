# TypeScript client — GDACS + NASA FIRMS

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/gdacs-firms-docs-client` · Staging path: `api-docs/packages/gdacs-firms-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { GdacsFirmsDocsClient } from '@cookie-cat21/gdacs-firms-docs-client';

const client = new GdacsFirmsDocsClient({ defaultDelayMs: 1000 });
const data = await client.gdacsEventsRss();
console.log(data);
```

## Methods

- `gdacsEventsRss()` — GET `/xml/rss.xml` — GDACS multi-hazard RSS.
- `firmsCsvLk()` — GET `/api/area/csv/.../VIIRS_SNPP_NRT/{bbox}/{days}` — FIRMS hotspot CSV for LK bbox (needs MAP_KEY).

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
