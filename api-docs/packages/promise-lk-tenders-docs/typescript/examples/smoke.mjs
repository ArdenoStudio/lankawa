// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { PromiseLkTendersDocsClient } from "../dist/index.js";

const client = new PromiseLkTendersDocsClient({ defaultDelayMs: 1000 });
console.log("client", PromiseLkTendersDocsClient.slug, "methods ready");
void client;
