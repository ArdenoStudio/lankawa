import { PeoplesBankRatesDocsClient } from "../client.mjs";

const client = new PeoplesBankRatesDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", PeoplesBankRatesDocsClient.slug, "->", "exchangeRatesHtml");
const data = await client.exchangeRatesHtml();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
