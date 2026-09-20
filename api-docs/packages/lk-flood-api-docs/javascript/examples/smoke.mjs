import { LkFloodApiDocsClient } from "../client.mjs";

const client = new LkFloodApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", LkFloodApiDocsClient.slug, "->", "floodLatest");
const data = await client.floodLatest();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
