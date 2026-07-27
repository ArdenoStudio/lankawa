import { CbslPublicDataDocsClient } from "../client.mjs";

const client = new CbslPublicDataDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", CbslPublicDataDocsClient.slug, "->", "plratesHtml");
const data = await client.plratesHtml();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
