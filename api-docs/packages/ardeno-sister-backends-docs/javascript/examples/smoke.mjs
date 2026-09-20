import { ArdenoSisterBackendsDocsClient } from "../client.mjs";

const client = new ArdenoSisterBackendsDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", ArdenoSisterBackendsDocsClient.slug, "->", "foodlkOpenapi");
const data = await client.foodlkOpenapi();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
