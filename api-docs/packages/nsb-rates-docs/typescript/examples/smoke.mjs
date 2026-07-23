// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { NsbRatesDocsClient } from "../dist/index.js";

const client = new NsbRatesDocsClient({ defaultDelayMs: 1000 });
console.log("client", NsbRatesDocsClient.slug, "methods ready");
void client;
