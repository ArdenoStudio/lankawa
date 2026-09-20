// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { ScHsbcOffersParkDocsClient } from "../dist/index.js";

const client = new ScHsbcOffersParkDocsClient({ defaultDelayMs: 1000 });
console.log("client", ScHsbcOffersParkDocsClient.slug, "methods ready");
void client;
