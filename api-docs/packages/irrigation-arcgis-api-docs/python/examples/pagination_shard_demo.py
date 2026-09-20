"""Demo: pagination iterator + shard helper."""
from irrigation_arcgis_api_docs import (
    IrrigationArcgisApiDocsClient,
    UtilityReading,
    iter_lab_endpoint,
    shard_groups,
    shard_page_numbers,
)

# Shard 0 of 4 owns these CEB groups / pages
print("groups", shard_groups(0, 4))
print("pages", shard_page_numbers(1, 20, 0, 4))

# Live iteration (polite) — may fail offline
# with IrrigationArcgisApiDocsClient() as client:
#     for page in iter_lab_endpoint(client, 'gauges_2_view_query', max_pages=2, page_size=20):
#         print(page.page, len(page.items), page.done)
