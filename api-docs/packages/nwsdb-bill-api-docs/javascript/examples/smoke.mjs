import { NwsdbBillApiDocsClient } from "../client.mjs";

const client = new NwsdbBillApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", NwsdbBillApiDocsClient.slug, "->", "billCalculator");
const data = await client.billCalculator();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
