"""Lankawa ingest runner."""

from __future__ import annotations

import logging
import sys

from ingest.base import RunResult
from ingest.db import Db, DbNotConfigured
from ingest.sources.cbsl_fx import CbslFx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("lankawa.ingest")

SOURCES = [CbslFx()]


def main() -> int:
    try:
        db = Db.from_env()
    except DbNotConfigured as exc:
        logger.warning("%s — running sources without persistence", exc)
        return 1

    results: list[RunResult] = []
    for source in SOURCES:
        logger.info("Running source %s", source.id)
        results.append(source.run(db))

    ok_count = sum(1 for result in results if result.ok)
    logger.info("Completed %s/%s sources", ok_count, len(results))
    return 0 if ok_count == len(results) else 2


if __name__ == "__main__":
    sys.exit(main())
