// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { MypromoParkDocsClient } from "../dist/index.js";

const client = new MypromoParkDocsClient({ defaultDelayMs: 1000 });
console.log("client", MypromoParkDocsClient.slug, "methods ready");
void client;
