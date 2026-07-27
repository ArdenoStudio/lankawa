// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { LkFloodApiDocsClient } from "../dist/index.js";

const client = new LkFloodApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", LkFloodApiDocsClient.slug, "methods ready");
void client;
