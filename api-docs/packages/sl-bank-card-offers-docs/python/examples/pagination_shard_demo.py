"""Demo: pagination iterator + shard helper."""
from sl_bank_card_offers_docs import (
    SlBankCardOffersDocsClient,
    CardOffer,
    iter_lab_endpoint,
    shard_groups,
    shard_page_numbers,
)

# Shard 0 of 4 owns these CEB groups / pages
print("groups", shard_groups(0, 4))
print("pages", shard_page_numbers(1, 20, 0, 4))

# Live iteration (polite) — may fail offline
# with SlBankCardOffersDocsClient() as client:
#     for page in iter_lab_endpoint(client, 'pack_overview', max_pages=2, page_size=20):
#         print(page.page, len(page.items), page.done)
