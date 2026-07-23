import { OpenaqLkDocsClient } from "../client.mjs";

const client = new OpenaqLkDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", OpenaqLkDocsClient.slug, "->", "locationsLk");
const data = await client.locationsLk();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
