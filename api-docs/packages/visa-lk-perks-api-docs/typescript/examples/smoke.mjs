// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { VisaLkPerksApiDocsClient } from "../dist/index.js";

const client = new VisaLkPerksApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", VisaLkPerksApiDocsClient.slug, "methods ready");
void client;
