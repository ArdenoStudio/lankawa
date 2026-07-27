import { SdbRatesDocsClient } from "../client.mjs";

const client = new SdbRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", SdbRatesDocsClient.slug, "->", "ratesPage");
const data = await client.ratesPage();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
