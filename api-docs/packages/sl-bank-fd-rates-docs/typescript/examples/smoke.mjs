// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { SlBankFdRatesDocsClient } from "../dist/index.js";

const client = new SlBankFdRatesDocsClient({ defaultDelayMs: 1000 });
console.log("client", SlBankFdRatesDocsClient.slug, "methods ready");
void client;
