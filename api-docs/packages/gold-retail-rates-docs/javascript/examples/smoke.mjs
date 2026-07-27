import { GoldRetailRatesDocsClient } from "../client.mjs";

const client = new GoldRetailRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", GoldRetailRatesDocsClient.slug, "->", "cbslGoldPage");
const data = await client.cbslGoldPage();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
