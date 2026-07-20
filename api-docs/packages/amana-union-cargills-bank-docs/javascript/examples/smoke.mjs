import { AmanaUnionCargillsBankDocsClient } from "../client.mjs";

const client = new AmanaUnionCargillsBankDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", AmanaUnionCargillsBankDocsClient.slug, "->", "amanaRates");
const data = await client.amanaRates();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
