import { LecoOutagesDocsClient } from "../client.mjs";

const client = new LecoOutagesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", LecoOutagesDocsClient.slug, "->", "interruptionNotices");
const data = await client.interruptionNotices();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
