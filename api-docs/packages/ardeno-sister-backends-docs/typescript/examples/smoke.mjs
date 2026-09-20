// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { ArdenoSisterBackendsDocsClient } from "../dist/index.js";

const client = new ArdenoSisterBackendsDocsClient({ defaultDelayMs: 1000 });
console.log("client", ArdenoSisterBackendsDocsClient.slug, "methods ready");
void client;
