import { HartiCbslFoodPdfDocsClient } from "../client.mjs";

const client = new HartiCbslFoodPdfDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", HartiCbslFoodPdfDocsClient.slug, "->", "hartiDailyPricesIndex");
const data = await client.hartiDailyPricesIndex();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
