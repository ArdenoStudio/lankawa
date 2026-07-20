// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { PabcCardOffersDocsClient } from "../dist/index.js";

const client = new PabcCardOffersDocsClient({ defaultDelayMs: 1000 });
console.log("client", PabcCardOffersDocsClient.slug, "methods ready");
void client;
