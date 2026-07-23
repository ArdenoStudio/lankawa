import { CombankApiDocsClient } from "../client.mjs";

const client = new CombankApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", CombankApiDocsClient.slug, "->", "exchangeRates");
const data = await client.exchangeRates();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
