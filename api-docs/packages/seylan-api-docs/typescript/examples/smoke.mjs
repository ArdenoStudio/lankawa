// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { SeylanApiDocsClient } from "../dist/index.js";

const client = new SeylanApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", SeylanApiDocsClient.slug, "methods ready");
void client;
