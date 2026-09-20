import { WfpHdxLkaFoodDocsClient } from "../client.mjs";

const client = new WfpHdxLkaFoodDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", WfpHdxLkaFoodDocsClient.slug, "->", "wfpFoodPricesLkaCsv");
const data = await client.wfpFoodPricesLkaCsv();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
