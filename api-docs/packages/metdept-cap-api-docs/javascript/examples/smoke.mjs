import { MetdeptCapApiDocsClient } from "../client.mjs";

const client = new MetdeptCapApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", MetdeptCapApiDocsClient.slug, "->", "capEnRss");
const data = await client.capEnRss();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
