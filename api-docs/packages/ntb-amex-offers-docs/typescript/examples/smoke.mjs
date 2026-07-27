// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { NtbAmexOffersDocsClient } from "../dist/index.js";

const client = new NtbAmexOffersDocsClient({ defaultDelayMs: 1000 });
console.log("client", NtbAmexOffersDocsClient.slug, "methods ready");
void client;
