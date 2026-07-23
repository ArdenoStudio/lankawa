// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { GoldRetailRatesDocsClient } from "../dist/index.js";

const client = new GoldRetailRatesDocsClient({ defaultDelayMs: 1000 });
console.log("client", GoldRetailRatesDocsClient.slug, "methods ready");
void client;
