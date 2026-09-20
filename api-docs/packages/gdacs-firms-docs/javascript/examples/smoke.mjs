import { GdacsFirmsDocsClient } from "../client.mjs";

const client = new GdacsFirmsDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", GdacsFirmsDocsClient.slug, "->", "gdacsEventsRss");
const data = await client.gdacsEventsRss();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
