// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { OpenaqLkDocsClient } from "../dist/index.js";

const client = new OpenaqLkDocsClient({ defaultDelayMs: 1000 });
console.log("client", OpenaqLkDocsClient.slug, "methods ready");
void client;
