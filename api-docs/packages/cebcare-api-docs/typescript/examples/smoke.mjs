// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { CebcareApiDocsClient } from "../dist/index.js";

const client = new CebcareApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", CebcareApiDocsClient.slug, "methods ready");
void client;
