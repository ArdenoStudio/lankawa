# TypeScript client — HNB Venus API

> Unofficial · not affiliated · polite public reads only.

Package: `@cookie-cat21/hnb-venus-api-docs-client` · Staging path: `api-docs/packages/hnb-venus-api-docs/typescript/`

## Install (after extraction)

```bash
cd typescript
npm install
npm run build
```

## Usage

```ts
import { HnbVenusApiDocsClient } from '@cookie-cat21/hnb-venus-api-docs-client';

const client = new HnbVenusApiDocsClient({ defaultDelayMs: 1000 });
const data = await client.getExchangeRatesContentsWeb();
console.log(data);
```

## Methods

- `getExchangeRatesContentsWeb()` — GET `/get_exchange_rates_contents_web` — FX contents for web.
- `getAllWebCardPromos()` — GET `/get_all_web_card_promos` — ~841 card promos paginated.
- `getInterestRatesContents()` — GET `/get_interest_rates_contents` — Nested FD/savings/loans tables in table_data_approved.
- `getWebCardPromo()` — GET `/get_web_card_promo` — Single promo detail by id.
- `getRatesContentsWeb()` — GET `/get_rates_contents_web` — FX + deposit teaser with updated_on stamp.
- `getExchangeRateLastUpdateDateContents()` — GET `/get_exchange_rate_last_update_date_contents` — As-of stamp for FX board.
- `getAllWebCardPromosDebit()` — GET `/get_all_web_card_promos` — Debit card promos (~93); includes Glomark supermarket.

## Ethics

See `../docs/ETHICS.md`. Default ≥1s delay between calls. No credentials / captcha bypass.

## Regenerate

From Lankawa monorepo root:

```bash
python3 scripts/scaffold-ts-clients.py
```
