"""Demo: shard helper (no lab endpoints on this package)."""
from sl_bank_remittance_tt_docs import shard_page_numbers, shard_groups, FxTtQuote

print("pages", shard_page_numbers(1, 10, 0, 2))
print("groups", shard_groups(1, 2))
print("model", FxTtQuote())
