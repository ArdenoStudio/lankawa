import assert from "node:assert/strict";
import { mapMacroCcpiToInflationSnapshot } from "./macro-publisher";

const payload = {
  collected_at: "2026-07-26T05:45:40.209719+00:00",
  family_code: "dcs_ccpi",
  records: [
    {
      indicator_code: "ccpi_colombo",
      value: 207.7,
      reference_date: "2026-06-30",
      published_at: "2026-06-30T00:00:00+05:30",
      source_url:
        "https://www.statistics.gov.lk/Resource/en/InflationAndPrices/CCPI/MOVEMENTS_of_CCPI_with_MV_Base2021.pdf",
      metadata: {
        month_on_month_percent: "2.1",
        year_on_year_percent: "6.8",
        twelve_month_moving_average_percent: "2.7",
        release_page:
          "https://www.statistics.gov.lk/InflationAndPrices/StaticalInformation/MonthlyCCPI/CCPI_20260630E",
      },
    },
  ],
};

const mapped = mapMacroCcpiToInflationSnapshot(payload);
assert.ok(mapped);
assert.equal(mapped.sourceId, "dcs_ccpi_macro");
assert.equal(mapped.latest.index, 207.7);
assert.equal(mapped.latest.yoyPct, 6.8);
assert.equal(mapped.latest.momPct, 2.1);
assert.match(mapped.periodLabel, /June 2026/);
assert.match(mapped.methodologyNote, /CCPI/);

assert.equal(
  mapMacroCcpiToInflationSnapshot({ records: [{ indicator_code: "ccpi_colombo" }] }),
  null,
);

console.log("macro-publisher.test.ts: ok");
