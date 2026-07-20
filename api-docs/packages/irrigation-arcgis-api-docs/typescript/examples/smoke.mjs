// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { IrrigationArcgisApiDocsClient } from "../dist/index.js";

const client = new IrrigationArcgisApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", IrrigationArcgisApiDocsClient.slug, "methods ready");
void client;
