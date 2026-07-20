// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { LitroLaugfsLpgDocsClient } from "../dist/index.js";

const client = new LitroLaugfsLpgDocsClient({ defaultDelayMs: 1000 });
console.log("client", LitroLaugfsLpgDocsClient.slug, "methods ready");
void client;
