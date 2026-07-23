import { FoodlkApiDocsClient } from "../client.mjs";

const client = new FoodlkApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", FoodlkApiDocsClient.slug, "->", "openapi");
const data = await client.openapi();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
