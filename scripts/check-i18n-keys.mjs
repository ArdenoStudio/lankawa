#!/usr/bin/env node
/**
 * Fail if messages/si.json or messages/ta.json are missing keys present in en.json.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function flatten(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flatten(value, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));
const si = JSON.parse(readFileSync(join(root, "messages/si.json"), "utf8"));
const ta = JSON.parse(readFileSync(join(root, "messages/ta.json"), "utf8"));

const enKeys = new Set(flatten(en));
const siKeys = new Set(flatten(si));
const taKeys = new Set(flatten(ta));

const missingSi = [...enKeys].filter((key) => !siKeys.has(key)).sort();
const missingTa = [...enKeys].filter((key) => !taKeys.has(key)).sort();

if (missingSi.length || missingTa.length) {
  if (missingSi.length) {
    console.error(`Missing ${missingSi.length} keys in messages/si.json:`);
    for (const key of missingSi.slice(0, 40)) {
      console.error(`  - ${key}`);
    }
    if (missingSi.length > 40) {
      console.error(`  … +${missingSi.length - 40} more`);
    }
  }
  if (missingTa.length) {
    console.error(`Missing ${missingTa.length} keys in messages/ta.json:`);
    for (const key of missingTa.slice(0, 40)) {
      console.error(`  - ${key}`);
    }
    if (missingTa.length > 40) {
      console.error(`  … +${missingTa.length - 40} more`);
    }
  }
  process.exit(1);
}

console.log(`i18n keys OK (${enKeys.size} keys in en/si/ta)`);
