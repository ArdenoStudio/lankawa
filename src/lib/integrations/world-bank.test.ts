import assert from "node:assert/strict";
import {
  parseWorldBankIndicatorResponse,
  WORLD_BANK_SOURCE_ID,
} from "./world-bank";

const GDP_FIXTURE = [
  {
    page: 1,
    pages: 1,
    per_page: 5,
    total: 1,
    sourceid: "2",
    lastupdated: "2025-12-17",
  },
  [
    {
      indicator: {
        id: "NY.GDP.MKTP.KD.ZG",
        value: "GDP growth (annual %)",
      },
      country: { id: "LK", value: "Sri Lanka" },
      countryiso3code: "LKA",
      date: "2024",
      value: 5.0,
      unit: "",
      obs_status: "",
      decimal: 1,
    },
  ],
] as const;

const POP_FIXTURE = [
  { page: 1, pages: 1, per_page: 5, total: 1 },
  [
    {
      indicator: { id: "SP.POP.TOTL", value: "Population, total" },
      country: { id: "LK", value: "Sri Lanka" },
      countryiso3code: "LKA",
      date: "2023",
      value: 22_037_000,
      unit: "",
      obs_status: "",
      decimal: 0,
    },
  ],
] as const;

const gdp = parseWorldBankIndicatorResponse(
  {
    id: "gdp_growth",
    code: "NY.GDP.MKTP.KD.ZG",
    label: "GDP growth",
    unit: "%",
  },
  GDP_FIXTURE as unknown as Parameters<
    typeof parseWorldBankIndicatorResponse
  >[1],
);
assert.ok(gdp);
assert.equal(gdp.id, "gdp_growth");
assert.equal(gdp.code, "NY.GDP.MKTP.KD.ZG");
assert.equal(gdp.value, 5.0);
assert.equal(gdp.year, "2024");
assert.equal(gdp.unit, "%");

const pop = parseWorldBankIndicatorResponse(
  {
    id: "population",
    code: "SP.POP.TOTL",
    label: "Population",
    unit: "people",
  },
  POP_FIXTURE as unknown as Parameters<
    typeof parseWorldBankIndicatorResponse
  >[1],
);
assert.ok(pop);
assert.equal(pop.value, 22_037_000);
assert.equal(pop.year, "2023");

assert.equal(
  parseWorldBankIndicatorResponse(
    {
      id: "gdp_growth",
      code: "NY.GDP.MKTP.KD.ZG",
      label: "GDP growth",
      unit: "%",
    },
    [{ page: 1 }, []],
  ),
  null,
);
assert.equal(
  parseWorldBankIndicatorResponse(
    {
      id: "gdp_growth",
      code: "NY.GDP.MKTP.KD.ZG",
      label: "GDP growth",
      unit: "%",
    },
    [{ page: 1 }, [{ date: "2024", value: null }]],
  ),
  null,
);

assert.equal(WORLD_BANK_SOURCE_ID, "world_bank_lka");

console.log("world-bank.test.ts: ok");
