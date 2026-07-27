// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { SlBankRemittanceTtDocsClient } from "../dist/index.js";

const client = new SlBankRemittanceTtDocsClient({ defaultDelayMs: 1000 });
console.log("client", SlBankRemittanceTtDocsClient.slug, "methods ready");
void client;
