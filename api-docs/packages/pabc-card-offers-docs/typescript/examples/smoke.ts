import { PabcCardOffersDocsClient } from "../src/index.js";

/**
 * Live smoke — polite delay on. Run: npm run smoke
 * May fail if upstream is down / blocks this environment.
 */
async function main() {
  const client = new PabcCardOffersDocsClient({ defaultDelayMs: 1000 });
  console.log("smoke", PabcCardOffersDocsClient.slug, "->", "cardOffersJs");
  const data = await client.cardOffersJs();
  const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
  console.log("ok", preview);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
