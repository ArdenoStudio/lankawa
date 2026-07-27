// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { SampathApiDocsClient } from "../dist/index.js";

const client = new SampathApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", SampathApiDocsClient.slug, "methods ready");
void client;
