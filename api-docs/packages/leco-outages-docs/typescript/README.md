# TypeScript client — LECO Outage Notices

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/leco-outages-docs-client` · Staging path: `api-docs/packages/leco-outages-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { LecoOutagesDocsClient } from '@cookie-cat21/leco-outages-docs-client';

const client = new LecoOutagesDocsClient({ defaultDelayMs: 1000 });
const data = await client.interruptionNotices();
console.log(data);
```

## Methods

- `interruptionNotices()` — GET `/pages_e.php?id=45` — LECO interruption notices HTML.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
