import { NtbAmexOffersDocsClient } from "../client.mjs";

const client = new NtbAmexOffersDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", NtbAmexOffersDocsClient.slug, "->", "ntbPromotionsHub");
const data = await client.ntbPromotionsHub();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
