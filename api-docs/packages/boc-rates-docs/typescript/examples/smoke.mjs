// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { BocRatesDocsClient } from "../dist/index.js";

const client = new BocRatesDocsClient({ defaultDelayMs: 1000 });
console.log("client", BocRatesDocsClient.slug, "methods ready");
void client;
