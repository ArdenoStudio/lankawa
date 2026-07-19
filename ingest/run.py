"""Lankawa ingest runner."""

from __future__ import annotations

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lankawa.ingest")


def main() -> None:
    logger.info("Lankawa ingest worker — connect DATABASE_URL to enable persistence")


if __name__ == "__main__":
    main()
