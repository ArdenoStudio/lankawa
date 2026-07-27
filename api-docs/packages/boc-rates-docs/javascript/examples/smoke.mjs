import { BocRatesDocsClient } from "../client.mjs";

const client = new BocRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", BocRatesDocsClient.slug, "->", "ratesTariffHtml");
const data = await client.ratesTariffHtml();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
