import { MypromoParkDocsClient } from "../src/index.js";

async function main() {
  const client = new MypromoParkDocsClient({ defaultDelayMs: 0 });
  console.log("slug", MypromoParkDocsClient.slug, "no live endpoints to smoke");
  void client;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
