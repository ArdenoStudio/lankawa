import { SlBankFdRatesDocsClient } from "../client.mjs";

const client = new SlBankFdRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", SlBankFdRatesDocsClient.slug, "->", "packOverview");
const data = await client.packOverview();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
