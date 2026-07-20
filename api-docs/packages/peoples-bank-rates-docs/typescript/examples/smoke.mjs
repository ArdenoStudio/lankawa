// Plain Node ESM smoke (requires built dist/ or tsx on .ts).
// Prefer: npm run smoke — or use ../javascript/client.mjs (zero build)
import { PeoplesBankRatesDocsClient } from "../dist/index.js";

const client = new PeoplesBankRatesDocsClient({ defaultDelayMs: 1000 });
console.log("client", PeoplesBankRatesDocsClient.slug, "methods ready");
void client;
