import { DfccRatesDocsClient } from "../client.mjs";

const client = new DfccRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", DfccRatesDocsClient.slug, "->", "interestRatesPage");
const data = await client.interestRatesPage();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
