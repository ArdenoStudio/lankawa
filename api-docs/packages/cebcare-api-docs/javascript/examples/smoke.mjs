import { CebcareApiDocsClient } from "../client.mjs";

const client = new CebcareApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", CebcareApiDocsClient.slug, "->", "demandMgmtSchedule");
const data = await client.demandMgmtSchedule();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
