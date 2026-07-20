#!/usr/bin/env node
/**
 * Compare production OpenAPI paths + smoke routes against this checkout.
 * Exit 1 when production is behind (missing paths or routes).
 *
 * Usage:
 *   node scripts/check-prod-drift.mjs
 *   DEPLOY_URL=https://lankawa.vercel.app node scripts/check-prod-drift.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEPLOY_URL = (process.env.DEPLOY_URL || "https://lankawa.vercel.app").replace(
  /\/$/,
  "",
);

const SMOKE_ROUTES = [
  "/en",
  "/en/status",
  "/en/news",
  "/en/brief",
  "/api/v1/status",
  "/api/v1/news",
  "/api/v1/news/clusters",
  "/api/v1/cse",
  "/api/v1/brief",
  "/api/v1/changes",
  "/api/v1/tenders",
  "/api/v1/economy/debt",
  "/embed/widget.js",
  "/embed/brief",
];

function localOpenApiPaths() {
  const text = readFileSync(join(ROOT, "src/lib/openapi.ts"), "utf8");
  const paths = new Set();
  for (const match of text.matchAll(/^\s{4}"(\/[^"]+)":/gm)) {
    paths.add(match[1]);
  }
  return paths;
}

async function fetchJson(path) {
  const res = await fetch(`${DEPLOY_URL}${path}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${path} → HTTP ${res.status}`);
  }
  return res.json();
}

async function statusCode(path) {
  const res = await fetch(`${DEPLOY_URL}${path}`, { redirect: "manual" });
  return res.status;
}

async function main() {
  const localPaths = localOpenApiPaths();
  console.log(`Local OpenAPI paths: ${localPaths.size}`);
  console.log(`Production: ${DEPLOY_URL}`);

  const prodSpec = await fetchJson("/api/v1/openapi.json");
  const prodPaths = new Set(Object.keys(prodSpec.paths || {}));
  console.log(`Production OpenAPI paths: ${prodPaths.size}`);

  const missingInProd = [...localPaths].filter((p) => !prodPaths.has(p)).sort();
  const extraInProd = [...prodPaths].filter((p) => !localPaths.has(p)).sort();

  const routeResults = [];
  for (const path of SMOKE_ROUTES) {
    const code = await statusCode(path);
    routeResults.push({ path, code, ok: code >= 200 && code < 400 });
  }

  const failedRoutes = routeResults.filter((r) => !r.ok);

  let statusVersion = null;
  try {
    const status = await fetchJson("/api/v1/status");
    statusVersion = status.version ?? null;
  } catch {
    statusVersion = null;
  }

  console.log("");
  console.log(`Production status.version: ${statusVersion ?? "(unavailable)"}`);
  console.log("");

  if (missingInProd.length) {
    console.log(`Missing on production (${missingInProd.length}):`);
    for (const p of missingInProd) console.log(`  - ${p}`);
  } else {
    console.log("OpenAPI: production includes all local paths.");
  }

  if (extraInProd.length) {
    console.log(`Extra on production (${extraInProd.length}):`);
    for (const p of extraInProd) console.log(`  - ${p}`);
  }

  console.log("");
  console.log("Smoke routes:");
  for (const r of routeResults) {
    console.log(`  ${r.ok ? "OK " : "FAIL"} ${r.code} ${r.path}`);
  }

  const drifted = missingInProd.length > 0 || failedRoutes.length > 0;
  if (drifted) {
    console.log("");
    console.log(
      "DRIFT DETECTED: production is behind this checkout. Connect GitHub to Vercel and redeploy main — see docs/DEPLOYMENT.md.",
    );
    process.exit(1);
  }

  console.log("");
  console.log("Production matches this checkout for OpenAPI + smoke routes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
