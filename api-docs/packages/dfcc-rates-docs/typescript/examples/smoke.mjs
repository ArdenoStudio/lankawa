// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { DfccRatesDocsClient } from "../dist/index.js";

const client = new DfccRatesDocsClient({ defaultDelayMs: 1000 });
console.log("client", DfccRatesDocsClient.slug, "methods ready");
void client;
