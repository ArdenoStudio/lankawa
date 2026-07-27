import { SlBankRemittanceTtDocsClient } from "../src/index.js";

/**
 * Live smoke — polite delay on. Run: npm run smoke
 * May fail if upstream is down / blocks this environment.
 */
async function main() {
  const client = new SlBankRemittanceTtDocsClient({ defaultDelayMs: 1000 });
  console.log("smoke", SlBankRemittanceTtDocsClient.slug, "->", "packOverview");
  const data = await client.packOverview();
  const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
  console.log("ok", preview);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
