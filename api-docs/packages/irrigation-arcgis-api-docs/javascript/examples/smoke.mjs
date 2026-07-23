import { IrrigationArcgisApiDocsClient } from "../client.mjs";

const client = new IrrigationArcgisApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", IrrigationArcgisApiDocsClient.slug, "->", "gauges2ViewQuery");
const data = await client.gauges2ViewQuery();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
