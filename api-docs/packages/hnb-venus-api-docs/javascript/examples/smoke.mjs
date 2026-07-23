import { HnbVenusApiDocsClient } from "../client.mjs";

const client = new HnbVenusApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", HnbVenusApiDocsClient.slug, "->", "getExchangeRatesContentsWeb");
const data = await client.getExchangeRatesContentsWeb();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
