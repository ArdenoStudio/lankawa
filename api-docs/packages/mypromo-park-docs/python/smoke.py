"""Quick client smoke — no live endpoints."""

from mypromo_park_docs import MypromoParkDocsClient

with MypromoParkDocsClient(default_delay_seconds=0) as client:
    print("slug", client.slug, "no live endpoints to smoke")
