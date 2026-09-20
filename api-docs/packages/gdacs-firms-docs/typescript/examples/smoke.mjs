// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { GdacsFirmsDocsClient } from "../dist/index.js";

const client = new GdacsFirmsDocsClient({ defaultDelayMs: 1000 });
console.log("client", GdacsFirmsDocsClient.slug, "methods ready");
void client;
