import { NdbRatesDocsClient } from "../client.mjs";

const client = new NdbRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", NdbRatesDocsClient.slug, "->", "exchangeRates");
const data = await client.exchangeRates();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
