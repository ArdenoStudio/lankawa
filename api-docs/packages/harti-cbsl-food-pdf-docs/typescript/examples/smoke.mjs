// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { HartiCbslFoodPdfDocsClient } from "../dist/index.js";

const client = new HartiCbslFoodPdfDocsClient({ defaultDelayMs: 1000 });
console.log("client", HartiCbslFoodPdfDocsClient.slug, "methods ready");
void client;
