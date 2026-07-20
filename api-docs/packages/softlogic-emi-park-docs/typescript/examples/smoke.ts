import { SoftlogicEmiParkDocsClient } from "../src/index.js";

async function main() {
  const client = new SoftlogicEmiParkDocsClient({ defaultDelayMs: 0 });
  console.log("slug", SoftlogicEmiParkDocsClient.slug, "no live endpoints to smoke");
  void client;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
