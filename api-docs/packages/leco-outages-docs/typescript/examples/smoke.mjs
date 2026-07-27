// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { LecoOutagesDocsClient } from "../dist/index.js";

const client = new LecoOutagesDocsClient({ defaultDelayMs: 1000 });
console.log("client", LecoOutagesDocsClient.slug, "methods ready");
void client;
