import { LitroLaugfsLpgDocsClient } from "../client.mjs";

const client = new LitroLaugfsLpgDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", LitroLaugfsLpgDocsClient.slug, "->", "litroPrices");
const data = await client.litroPrices();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
