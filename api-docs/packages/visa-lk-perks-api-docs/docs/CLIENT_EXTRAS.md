# Client extras — `visa-lk-perks-api-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `card_offers`.

- Python: `python/visa_lk_perks_api_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `portal_perks`.

```python
from visa_lk_perks_api_docs import VisaLkPerksApiDocsClient, iter_lab_endpoint

with VisaLkPerksApiDocsClient() as client:
    for page in iter_lab_endpoint(client, 'portal_perks', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { VisaLkPerksApiDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new VisaLkPerksApiDocsClient();
for await (const page of iterLabEndpoint(client as any, 'portal_perks', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from visa_lk_perks_api_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
