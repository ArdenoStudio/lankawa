import { NsbRatesDocsClient } from "../client.mjs";

const client = new NsbRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", NsbRatesDocsClient.slug, "->", "depositRatesHtml");
const data = await client.depositRatesHtml();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
