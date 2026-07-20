// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { MetdeptCapApiDocsClient } from "../dist/index.js";

const client = new MetdeptCapApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", MetdeptCapApiDocsClient.slug, "methods ready");
void client;
