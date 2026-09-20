"""Quick client smoke — no live endpoints."""

from sc_hsbc_offers_park_docs import ScHsbcOffersParkDocsClient

with ScHsbcOffersParkDocsClient(default_delay_seconds=0) as client:
    print("slug", client.slug, "no live endpoints to smoke")
