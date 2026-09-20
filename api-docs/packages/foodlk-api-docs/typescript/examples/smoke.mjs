// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { FoodlkApiDocsClient } from "../dist/index.js";

const client = new FoodlkApiDocsClient({ defaultDelayMs: 1000 });
console.log("client", FoodlkApiDocsClient.slug, "methods ready");
void client;
