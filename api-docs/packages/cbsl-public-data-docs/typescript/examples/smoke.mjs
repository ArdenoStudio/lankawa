// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { CbslPublicDataDocsClient } from "../dist/index.js";

const client = new CbslPublicDataDocsClient({ defaultDelayMs: 1000 });
console.log("client", CbslPublicDataDocsClient.slug, "methods ready");
void client;
