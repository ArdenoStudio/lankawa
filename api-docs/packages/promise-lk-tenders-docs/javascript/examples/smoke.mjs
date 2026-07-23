import { PromiseLkTendersDocsClient } from "../client.mjs";

const client = new PromiseLkTendersDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", PromiseLkTendersDocsClient.slug, "->", "procurementsList");
const data = await client.procurementsList();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
