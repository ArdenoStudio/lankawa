// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { OctaneFuelApiDocsClient } from "../dist/index.js";

const client = new OctaneFuelApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", OctaneFuelApiDocsClient.slug, "methods ready");
void client;
