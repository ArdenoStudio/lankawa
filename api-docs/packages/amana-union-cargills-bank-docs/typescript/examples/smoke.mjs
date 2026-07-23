// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { AmanaUnionCargillsBankDocsClient } from "../dist/index.js";

const client = new AmanaUnionCargillsBankDocsClient({ defaultDelayMs: 1000 });
console.log("client", AmanaUnionCargillsBankDocsClient.slug, "methods ready");
void client;
