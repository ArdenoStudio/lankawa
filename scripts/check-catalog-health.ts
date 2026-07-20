import { buildCatalogHealthSnapshotFresh } from "../src/lib/catalog-health";

async function main() {
  const rows = await buildCatalogHealthSnapshotFresh();
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.tier] = (counts[row.tier] || 0) + 1;
  }
  console.log("total", rows.length, "tiers", JSON.stringify(counts));
  const bad = rows.filter(
    (row) => row.tier === "unknown" || row.tier === "down",
  );
  for (const row of bad) {
    console.log(row.tier, row.id, row.error);
  }
  console.log(
    "fresh_or_stale",
    rows.filter((row) => row.tier === "fresh" || row.tier === "stale").length,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
