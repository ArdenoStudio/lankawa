import { ScHsbcOffersParkDocsClient } from "../src/index.js";

async function main() {
  const client = new ScHsbcOffersParkDocsClient({ defaultDelayMs: 0 });
  console.log("slug", ScHsbcOffersParkDocsClient.slug, "no live endpoints to smoke");
  void client;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
