# TypeScript client — CEB Care API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/cebcare-api-docs-client` · Staging path: `api-docs/packages/cebcare-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { CebcareApiDocsClient } from '@cookie-cat21/cebcare-api-docs-client';

const client = new CebcareApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.demandMgmtSchedule();
console.log(data);
```

## Methods

- `demandMgmtSchedule()` — GET `/Incognito/DemandMgmtSchedule` — HTML bootstrap for antiforgery token.
- `getDemandMgmtClusters()` — GET `/Incognito/GetDemandMgmtClusters` — Clusters for group A–Y; requires verification token.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
