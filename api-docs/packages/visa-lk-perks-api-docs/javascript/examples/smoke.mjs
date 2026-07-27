import { VisaLkPerksApiDocsClient } from "../client.mjs";

const client = new VisaLkPerksApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", VisaLkPerksApiDocsClient.slug, "->", "portalPerks");
const data = await client.portalPerks();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
