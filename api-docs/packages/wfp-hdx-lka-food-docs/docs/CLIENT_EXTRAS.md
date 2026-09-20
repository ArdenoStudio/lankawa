# Client extras — `wfp-hdx-lka-food-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `food_prices`.

- Python: `python/wfp_hdx_lka_food_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `wfp_food_prices_lka_csv`.

```python
from wfp_hdx_lka_food_docs import WfpHdxLkaFoodDocsClient, iter_lab_endpoint

with WfpHdxLkaFoodDocsClient() as client:
    for page in iter_lab_endpoint(client, 'wfp_food_prices_lka_csv', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { WfpHdxLkaFoodDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new WfpHdxLkaFoodDocsClient();
for await (const page of iterLabEndpoint(client as any, 'wfp_food_prices_lka_csv', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from wfp_hdx_lka_food_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
