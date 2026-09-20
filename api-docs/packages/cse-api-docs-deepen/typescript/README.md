# TypeScript client — CSE (cse.lk) API — deepen pack

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/cse-api-docs-deepen-client` · Staging path: `api-docs/packages/cse-api-docs-deepen/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { CseApiDocsDeepenClient } from '@cookie-cat21/cse-api-docs-deepen-client';

const client = new CseApiDocsDeepenClient({ defaultDelayMs: 1000 });
const data = await client.topGainers();
console.log(data);
```

## Methods

- `topGainers()` — POST `/topGainers` — Dedicated top gainers board.
- `topLooses()` — POST `/topLooses` — Dedicated top losers (CSE spelling).
- `sector52Week()` — POST `/52WeekSectors` — 52-week / YTD sector ranges.
- `tradeSummary()` — POST `/tradeSummary` — Full board — primary poller; client-side page in lab.
- `getAnnouncementByCompany()` — POST `/getAnnouncementByCompany` — Company announcements by symbol.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
