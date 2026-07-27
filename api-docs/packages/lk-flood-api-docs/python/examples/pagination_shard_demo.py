"""Demo: shard helper (no lab endpoints on this package)."""
from lk_flood_api_docs import shard_page_numbers, shard_groups, UtilityReading

print("pages", shard_page_numbers(1, 10, 0, 2))
print("groups", shard_groups(1, 2))
print("model", UtilityReading())
