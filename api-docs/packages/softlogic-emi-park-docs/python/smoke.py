"""Quick client smoke — no live endpoints."""

from softlogic_emi_park_docs import SoftlogicEmiParkDocsClient

with SoftlogicEmiParkDocsClient(default_delay_seconds=0) as client:
    print("slug", client.slug, "no live endpoints to smoke")
