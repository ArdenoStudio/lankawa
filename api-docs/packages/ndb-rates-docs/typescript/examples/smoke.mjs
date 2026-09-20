// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { NdbRatesDocsClient } from "../dist/index.js";

const client = new NdbRatesDocsClient({ defaultDelayMs: 1000 });
console.log("client", NdbRatesDocsClient.slug, "methods ready");
void client;
