import { SlBankRemittanceTtDocsClient } from "../client.mjs";

const client = new SlBankRemittanceTtDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", SlBankRemittanceTtDocsClient.slug, "->", "packOverview");
const data = await client.packOverview();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
