import assert from "node:assert/strict";
import {
  getRemittanceTtSeedSnapshot,
  parseCombankUsdTt,
  parseHnbUsdTt,
  parseNdbUsdTt,
  parseNsbUsdTt,
  parsePeoplesUsdTt,
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
  <thead>
    <tr>
      <th colspan="2"></th>
      <th colspan="2">Currency</th>
      <th colspan="2">TC's Drafts</th>
      <th colspan="2">Telegraphic Transfers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>flag</th>
      <th>US Dollars</th>
      <td>331.7677</td>
      <td>340.5892</td>
      <td>330.6721</td>
      <td>340.3509</td>
      <td>332.0001</td>
      <td>340.3509</td>
    </tr>
  </tbody>
</table>
`;

const NDB_HTML_FIXTURE = `
<table>
  <tr>
    <td>US Dollar</td>
    <td class="text-start fw-bold">USD</td>
    <td class="text-end">331.75</td>
    <td class="text-end">340.75</td>
    <td class="text-end">330.54</td>
    <td class="text-end">340.75</td>
    <td class="text-end">331.75</td>
    <td class="text-end">340.75</td>
  </tr>
</table>
`;

const NSB_HTML_FIXTURE = `
<table>
  <tr>
    <td>United States Dollar (USD)</td>
    <td>332.25</td>
    <td>340.25</td>
    <td>328.98</td>
    <td>341.10</td>
  </tr>
</table>
`;

const SIMPLE_USD_HTML_FIXTURE = `
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

const peoples = parsePeoplesUsdTt(PEOPLES_HTML_FIXTURE);
assert.ok(peoples);
assert.equal(peoples.buyLkr, 332.0001);
assert.equal(peoples.sellLkr, 340.3509);

const ndb = parseNdbUsdTt(NDB_HTML_FIXTURE);
assert.ok(ndb);
assert.equal(ndb.buyLkr, 331.75);
assert.equal(ndb.sellLkr, 340.75);

const nsb = parseNsbUsdTt(NSB_HTML_FIXTURE);
assert.ok(nsb);
assert.equal(nsb.buyLkr, 332.25);
assert.equal(nsb.sellLkr, 340.25);

// Must take TT (last pair), not currency notes (first pair).
const peoplesViaGeneric = parseUsdLkrBand(PEOPLES_HTML_FIXTURE);
assert.ok(peoplesViaGeneric);
assert.equal(peoplesViaGeneric.buyLkr, 332.0001);
assert.equal(peoplesViaGeneric.sellLkr, 340.3509);

const simpleBand = parseUsdLkrBand(SIMPLE_USD_HTML_FIXTURE);
assert.ok(simpleBand);
assert.equal(simpleBand.buyLkr, 301.2);
assert.equal(simpleBand.sellLkr, 308.5);

assert.equal(parseCombankUsdTt([]), null);
assert.equal(parseHnbUsdTt([{ currencyCode: "AUD", buyingRate: 1, sellingRate: 2 }]), null);
assert.equal(parseSeylanUsdTt({}), null);
assert.equal(parseSampathUsdTt({ success: true, data: [] }), null);
assert.equal(parsePeoplesUsdTt("<p>no rates here</p>"), null);
assert.equal(parseNdbUsdTt("<p>no rates here</p>"), null);
assert.equal(parseNsbUsdTt("<p>no rates here</p>"), null);
assert.equal(parseUsdLkrBand("<p>no rates here</p>"), null);

const seed = getRemittanceTtSeedSnapshot();
assert.equal(seed.isSeed, true);
assert.equal(seed.liveCount, 0);
assert.equal(seed.seedCount, seed.banks.length);
assert.ok(seed.banks.length >= 7);
assert.ok(seed.banks.every((bank) => bank.isSeed));
assert.ok(seed.banks.some((bank) => bank.id === "commercial"));
assert.ok(seed.banks.some((bank) => bank.id === "hnb"));
assert.ok(seed.banks.some((bank) => bank.id === "seylan"));
assert.ok(seed.banks.some((bank) => bank.id === "sampath"));
assert.ok(seed.banks.some((bank) => bank.id === "peoples"));
assert.ok(seed.banks.some((bank) => bank.id === "ndb"));
assert.ok(seed.banks.some((bank) => bank.id === "nsb"));

console.log("remittance-banks.test.ts: ok");
