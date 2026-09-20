import { CseApiDocsDeepenClient } from "../client.mjs";

const client = new CseApiDocsDeepenClient({ defaultDelayMs: 1000 });
console.log("smoke", CseApiDocsDeepenClient.slug, "->", "topGainers");
const data = await client.topGainers();
const preview = typeof data === "string" ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
console.log("ok", preview);
