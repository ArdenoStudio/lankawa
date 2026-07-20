import assert from "node:assert/strict";
import {
  getRemittanceTtSeedSnapshot,
  parseCombankUsdTt,
  parseHnbUsdTt,
  parseSampathUsdTt,
  parseSeylanUsdTt,
  parseUsdLkrBand,
} from "./remittance-banks";

const COMBANK_FIXTURE = [
  {
    excode: "EUR",
    telegraphic_transfers_buying_rate: 378.03,
    telegraphic_transfers_selling_rate: 390.54,
  },
  {
    excode: "USD",
    telegraphic_transfers_buying_rate: 332,
    telegraphic_transfers_selling_rate: 340,
  },
];

const HNB_FIXTURE = [
  { currencyCode: "EUR", buyingRate: 378.55, sellingRate: 389.88 },
  { currencyCode: "USD", buyingRate: 332.3, sellingRate: 339.7 },
];

const SEYLAN_FIXTURE = [
  {
    "Effective Date": "2026-07-17 11:22:26",
    "Currency Notes Buying": "331.75",
    "Currency Notes Selling": "341",
    "Telegraphic Transfers Buying": "332.5",
    "Telegraphic Transfers Selling": "339.5",
  },
];

const SAMPATH_FIXTURE = {
  success: true,
  data: [
    {
      CurrCode: "GBP",
      TTBUY: "444.84",
      TTSEL: "460.31",
    },
    {
      CurrCode: "USD",
      TTBUY: "331.75",
      TTSEL: "340.75",
    },
  ],
};

const PEOPLES_HTML_FIXTURE = `
<table>
  <tr><th>Currency</th><th>Buying</th><th>Selling</th></tr>
  <tr><td>USD</td><td>301.20</td><td>308.50</td></tr>
</table>
`;

const combank = parseCombankUsdTt(COMBANK_FIXTURE);
assert.ok(combank);
assert.equal(combank.buyLkr, 332);
assert.equal(combank.sellLkr, 340);

const hnb = parseHnbUsdTt(HNB_FIXTURE);
assert.ok(hnb);
assert.equal(hnb.buyLkr, 332.3);
assert.equal(hnb.sellLkr, 339.7);

const seylan = parseSeylanUsdTt(SEYLAN_FIXTURE);
assert.ok(seylan);
assert.equal(seylan.buyLkr, 332.5);
assert.equal(seylan.sellLkr, 339.5);

const sampath = parseSampathUsdTt(SAMPATH_FIXTURE);
assert.ok(sampath);
assert.equal(sampath.buyLkr, 331.75);
assert.equal(sampath.sellLkr, 340.75);

const htmlBand = parseUsdLkrBand(PEOPLES_HTML_FIXTURE);
assert.ok(htmlBand);
assert.equal(htmlBand.buyLkr, 301.2);
assert.equal(htmlBand.sellLkr, 308.5);

assert.equal(parseCombankUsdTt([]), null);
assert.equal(parseHnbUsdTt([{ currencyCode: "AUD", buyingRate: 1, sellingRate: 2 }]), null);
assert.equal(parseSeylanUsdTt({}), null);
assert.equal(parseSampathUsdTt({ success: true, data: [] }), null);
assert.equal(parseUsdLkrBand("<p>no rates here</p>"), null);

const seed = getRemittanceTtSeedSnapshot();
assert.equal(seed.isSeed, true);
assert.ok(seed.banks.length >= 6);
assert.ok(seed.banks.every((bank) => bank.isSeed));
assert.ok(seed.banks.some((bank) => bank.id === "commercial"));
assert.ok(seed.banks.some((bank) => bank.id === "hnb"));
assert.ok(seed.banks.some((bank) => bank.id === "seylan"));
assert.ok(seed.banks.some((bank) => bank.id === "sampath"));
assert.ok(seed.banks.some((bank) => bank.id === "peoples"));
assert.ok(seed.banks.some((bank) => bank.id === "ndb"));

console.log("remittance-banks.test.ts: ok");
