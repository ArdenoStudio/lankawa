import { OpenMeteoLkDocsClient } from "../client.mjs";

const client = new OpenMeteoLkDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", OpenMeteoLkDocsClient.slug, "->", "forecastColombo");
const data = await client.forecastColombo();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
