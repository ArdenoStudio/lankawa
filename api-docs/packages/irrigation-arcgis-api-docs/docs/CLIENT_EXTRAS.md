# Client extras — `irrigation-arcgis-api-docs`

## Typed models

Canonical dataclass / TS types from field-coverage domains: `utilities`.

- Python: `python/irrigation_arcgis_api_docs/models.py`
- TypeScript: `typescript/src/models.ts`
- JavaScript: `javascript/models.mjs` (JSDoc typedefs)

## Pagination iterator

Lab endpoints: `gauges_2_view_query`, `rainfall_24hr`.

```python
from irrigation_arcgis_api_docs import IrrigationArcgisApiDocsClient, iter_lab_endpoint

with IrrigationArcgisApiDocsClient() as client:
    for page in iter_lab_endpoint(client, 'gauges_2_view_query', max_pages=3, page_size=50):
        print(page.page, len(page.items), page.done)
```

```ts
import { IrrigationArcgisApiDocsClient, iterLabEndpoint } from "./src/index.js";
const client = new IrrigationArcgisApiDocsClient();
for await (const page of iterLabEndpoint(client as any, 'gauges_2_view_query', { maxPages: 3 })) {
  console.log(page.page, page.items.length, page.done);
}
```

## Shard helper

```python
from irrigation_arcgis_api_docs import shard_groups, shard_page_numbers, shard_offsets

shard_groups(0, 4)           # CEB A–Y split
shard_page_numbers(1, 40, 1, 4)
shard_offsets(1000, 50, 2, 4)
```
