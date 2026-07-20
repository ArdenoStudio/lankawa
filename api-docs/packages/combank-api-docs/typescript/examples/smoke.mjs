// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { CombankApiDocsClient } from "../dist/index.js";

const client = new CombankApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", CombankApiDocsClient.slug, "methods ready");
void client;
