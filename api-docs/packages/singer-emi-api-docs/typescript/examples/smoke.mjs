// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { SingerEmiApiDocsClient } from "../dist/index.js";

const client = new SingerEmiApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", SingerEmiApiDocsClient.slug, "methods ready");
void client;
