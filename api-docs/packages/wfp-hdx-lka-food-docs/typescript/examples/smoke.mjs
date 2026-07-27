// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { WfpHdxLkaFoodDocsClient } from "../dist/index.js";

const client = new WfpHdxLkaFoodDocsClient({ defaultDelayMs: 1000 });
console.log("client", WfpHdxLkaFoodDocsClient.slug, "methods ready");
void client;
