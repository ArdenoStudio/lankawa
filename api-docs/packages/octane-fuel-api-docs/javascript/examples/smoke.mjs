import { OctaneFuelApiDocsClient } from "../client.mjs";

const client = new OctaneFuelApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", OctaneFuelApiDocsClient.slug, "->", "pricesLatest");
const data = await client.pricesLatest();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
