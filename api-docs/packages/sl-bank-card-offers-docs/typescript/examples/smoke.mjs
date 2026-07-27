// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { SlBankCardOffersDocsClient } from "../dist/index.js";

const client = new SlBankCardOffersDocsClient({ defaultDelayMs: 1000 });
console.log("client", SlBankCardOffersDocsClient.slug, "methods ready");
void client;
