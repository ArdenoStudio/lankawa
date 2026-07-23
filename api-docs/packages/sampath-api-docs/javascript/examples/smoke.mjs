import { SampathApiDocsClient } from "../client.mjs";

const client = new SampathApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", SampathApiDocsClient.slug, "->", "exchangeRates");
const data = await client.exchangeRates();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
