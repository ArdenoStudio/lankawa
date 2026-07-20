import assert from "node:assert/strict";
import {
  extractDiscountLabel,
  filterTodaysOffers,
  isOfferActiveToday,
  isSupermarketPromo,
  normalizeCombankReward,
  normalizeHnbOffer,
  normalizeSampathOffer,
  parseValidToFromText,
  parseWeekdayHint,
  stripHtml,
  type CardOffer,
} from "./card-offers";

assert.equal(stripHtml("25% <b>Off</b> &amp; more"), "25% Off & more");

assert.equal(parseWeekdayHint("Offer valid on every Saturday till 25th July 2026"), "saturday");
assert.equal(parseWeekdayHint("EVERY WEDNESDAY for all Sampath cards"), "wednesday");
assert.equal(parseWeekdayHint("Valid Until (Every Tuesday)"), "tuesday");
assert.equal(parseWeekdayHint("Valid On (Monday)"), "monday");
assert.equal(parseWeekdayHint("Saturdays - 11th & 25th July 2026"), "saturday");
assert.equal(parseWeekdayHint("No weekday mentioned"), null);

assert.equal(parseValidToFromText("till 25th July 2026"), "2026-07-25");
assert.equal(
  parseValidToFromText("Valid on 11th & 25th July 2026"),
  "2026-07-25",
);
assert.equal(parseValidToFromText("Valid Until 2026-08-31"), "2026-08-31");

assert.equal(extractDiscountLabel("Up to 25% Discount"), "Up to 25% Discount");
assert.equal(extractDiscountLabel("Get 25% off on bills"), "25% off");
assert.equal(extractDiscountLabel("Best offer"), "See bank offer");
assert.equal(
  extractDiscountLabel("Up to 06 months 0% installments at Keells"),
  "See bank offer",
);

assert.equal(isSupermarketPromo("25% at Keells", "Keells"), true);
assert.equal(isSupermarketPromo("SPAR Supermarket", "SPAR"), true);
assert.equal(isSupermarketPromo("0% at The Spark Tech", "The Spark Tech Solutions"), false);
assert.equal(isSupermarketPromo("Installments at LAUGFS Lubricants", "LAUGFS Lubricants"), false);
assert.equal(isSupermarketPromo("10% at LAUGFS Supermarket", "LAUGFS Supermarket"), true);

const saturday = new Date("2026-07-18T12:00:00+05:30"); // Saturday in Colombo
const friday = new Date("2026-07-17T12:00:00+05:30");

const keellsSat: CardOffer = {
  id: "t1",
  bank: "Commercial Bank",
  merchant: "Keells",
  title: "Keells Saturday deal",
  discountLabel: "25% Off",
  validTo: "2026-07-25",
  weekdayHint: "saturday",
  sourceUrl: "https://example.com/keells",
  asOf: "2026-07-18",
};

const openWindow: CardOffer = {
  id: "t2",
  bank: "Sampath Bank",
  merchant: "SPAR",
  title: "SPAR total bill",
  discountLabel: "25% Discount",
  validTo: "2026-07-31",
  weekdayHint: null,
  sourceUrl: "https://example.com/spar",
  asOf: "2026-07-18",
};

const expired: CardOffer = {
  id: "t3",
  bank: "HNB",
  merchant: "Cargills",
  title: "Expired Cargills",
  discountLabel: "20% Off",
  validTo: "2026-07-01",
  weekdayHint: null,
  sourceUrl: "https://example.com/cargills",
  asOf: "2026-07-18",
};

assert.equal(isOfferActiveToday(keellsSat, saturday), true);
assert.equal(isOfferActiveToday(keellsSat, friday), false);
assert.equal(isOfferActiveToday(openWindow, friday), true);
assert.equal(isOfferActiveToday(expired, friday), false);

const filtered = filterTodaysOffers([keellsSat, openWindow, expired], saturday);
assert.equal(filtered.length, 2);
assert.deepEqual(
  filtered.map((o) => o.id).sort(),
  ["t1", "t2"],
);

const sampath = normalizeSampathOffer(
  {
    id: 2381,
    company_name: "LAUGFS Supermarkets",
    description:
      "10% Discount on TOTAL BILL at all LAUGFS Supermarket outlets on EVERY WEDNESDAY",
    short_discount: "10% Discount",
    expire_on: 1785349740000,
  },
  "2026-07-20",
);
assert.ok(sampath);
assert.equal(sampath.bank, "Sampath Bank");
assert.equal(sampath.weekdayHint, "wednesday");
assert.equal(sampath.validTo, "2026-07-29");
assert.equal(sampath.discountLabel, "10% Discount");

const hnb = normalizeHnbOffer(
  {
    id: 2369,
    title:
      "25% off on fresh Vegetables, Fruits & Seafood for bills above LKR 4,000 at Keells outlets",
    merchant: "Keells",
    to: "2026-07-28",
    valid: "Valid Until (Every Tuesday)",
  },
  "2026-07-20",
);
assert.ok(hnb);
assert.equal(hnb.weekdayHint, "tuesday");
assert.equal(hnb.validTo, "2026-07-28");
assert.equal(hnb.discountLabel, "25% off");

const hnbNoise = normalizeHnbOffer(
  {
    id: 3688,
    title: "Up to 12 months 0% installments at The Spark Tech Solutions",
    merchant: "The Spark Tech Solutions (PVT) Ltd",
    to: "2026-08-31",
    valid: "Valid Until",
  },
  "2026-07-20",
);
assert.equal(hnbNoise, null);

const hnbEmi = normalizeHnbOffer(
  {
    id: 1727,
    title: "Up to 06 months 0% installments for Hamper value above LKR 10,000 at Keells",
    merchant: "Keells",
    to: "2026-08-31",
    valid: "Valid Until",
  },
  "2026-07-20",
);
assert.equal(hnbEmi, null);

const combank = normalizeCombankReward({
  href: "https://www.combank.lk/rewards-promotion/supermarket/keells",
  category: "Supermarket",
  title: "Enjoy the best supermarket deals at Keells with ComBank Credit Cards",
  validDate: "Offer valid on every Saturday till 25th July 2026",
  discountLabel: "Up to 25% Off",
  asOf: "2026-07-20",
});
assert.ok(combank);
assert.equal(combank.merchant, "Keells");
assert.equal(combank.weekdayHint, "saturday");
assert.equal(combank.validTo, "2026-07-25");

console.log("card-offers.test.ts: ok");
