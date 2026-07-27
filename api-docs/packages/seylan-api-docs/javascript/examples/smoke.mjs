import { SeylanApiDocsClient } from "../client.mjs";

const client = new SeylanApiDocsClient({ defaultDelayMs: 1000 });
console.log("smoke", SeylanApiDocsClient.slug, "->", "exchangeRatesUsd");
const data = await client.exchangeRatesUsd();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
