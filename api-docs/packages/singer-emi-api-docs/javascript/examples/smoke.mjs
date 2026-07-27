import { SingerEmiApiDocsClient } from "../client.mjs";

const client = new SingerEmiApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", SingerEmiApiDocsClient.slug, "->", "jsonGetEmi");
const data = await client.jsonGetEmi();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
