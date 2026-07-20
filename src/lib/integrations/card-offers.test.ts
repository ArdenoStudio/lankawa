import assert from "node:assert/strict";
import seedData from "@/data/card-offers-seed.json";
import {
  extractCombankDiscountLabel,
  extractDiscountLabel,
  filterTodaysOffers,
  getCardOffersSeedSnapshot,
  isOfferActiveToday,
  isSupermarketPromo,
  matchesWeekdayHint,
  mergeTodaysLiveWithSeed,
  merchantCoverageToken,
  normalizeCombankReward,
  normalizeDfccOffer,
  normalizeHnbOffer,
  normalizePabcOffer,
  normalizeSampathOffer,
  normalizeVisaPerk,
  offerCoverageKey,
  parseCombankRewardsHtml,
  parseDfccSupermarketHtml,
  parseNtbPromotionsHtml,
  parseNtbSupermarketHubHtml,
  parsePabcCardOffersHtml,
  parsePeoplesBankOffersHtml,
  parseSpecificOfferDates,
  parseValidToFromText,
  parseWeekdayHint,
  parseWeekdayHints,
  resolveMerchantFromText,
  solveSucuriCookie,
  stripHtml,
  type CardOffer,
} from "./card-offers";

assert.equal(stripHtml("25% <b>Off</b> &amp; more"), "25% Off & more");

// --- parseWeekdayHint: explicit English cadence ---
assert.equal(parseWeekdayHint("Offer valid on every Saturday till 25th July 2026"), "saturday");
assert.equal(parseWeekdayHint("EVERY WEDNESDAY for all Sampath cards"), "wednesday");
assert.equal(parseWeekdayHint("Valid Until (Every Tuesday)"), "tuesday");
assert.equal(parseWeekdayHint("Valid On (Monday)"), "monday");
assert.equal(parseWeekdayHint("Saturdays - 11th & 25th July 2026"), "saturday");
assert.equal(parseWeekdayHint("on Mondays at Keells"), "monday");
assert.equal(parseWeekdayHint("Monday's fresh deal"), "monday");
assert.equal(parseWeekdayHint("No weekday mentioned"), null);

// Prefer explicit weekday over end-date (25 Jul 2026 is a Saturday)
assert.equal(
  parseWeekdayHint("every Monday till 25th July 2026"),
  "monday",
);
assert.equal(
  parseWeekdayHint("Offer valid on every Friday till 25th July 2026"),
  "friday",
);

// Abbreviations: Mon, Mon-, Tue, etc.
assert.equal(parseWeekdayHint("Valid every Mon till 31 Aug 2026"), "monday");
assert.equal(parseWeekdayHint("Mon- only at SPAR"), "monday");
assert.equal(parseWeekdayHint("Tue fresh produce"), "tuesday");
assert.equal(parseWeekdayHint("on Weds"), "wednesday");
assert.equal(parseWeekdayHint("Thurs special"), "thursday");
assert.equal(parseWeekdayHint("Fri- deals"), "friday");
assert.equal(parseWeekdayHint("Sat bill discount"), "saturday");
assert.equal(parseWeekdayHint("Sun at LAUGFS"), "sunday");

// weekdays / weekend buckets
assert.equal(parseWeekdayHint("Valid on weekdays only"), "weekdays");
assert.equal(parseWeekdayHint("Weekend supermarket blast"), "weekend");
assert.equal(parseWeekdayHint("weekends at Cargills"), "weekend");

// Sinhala / Tamil day words (seed is English; parser still supports local copy)
assert.equal(parseWeekdayHint("සඳුදා වට්ටම Keells"), "monday");
assert.equal(parseWeekdayHint("සිකුරාදා Cargills"), "friday");
assert.equal(parseWeekdayHint("திங்கள் SPAR offer"), "monday");
assert.equal(parseWeekdayHint("வெள்ளி Glomark"), "friday");

assert.equal(matchesWeekdayHint("weekdays", "wednesday"), true);
assert.equal(matchesWeekdayHint("weekdays", "saturday"), false);
assert.equal(matchesWeekdayHint("weekend", "sunday"), true);
assert.equal(matchesWeekdayHint("weekend", "monday"), false);
assert.equal(matchesWeekdayHint("friday", "friday"), true);

assert.deepEqual(parseWeekdayHints("Every Monday & Wednesday at Keells"), [
  "monday",
  "wednesday",
]);
assert.deepEqual(
  parseSpecificOfferDates(
    "at Cargills Food City on 09th & 23rd July 2026",
  ),
  ["2026-07-09", "2026-07-23"],
);
assert.deepEqual(
  parseSpecificOfferDates("Offer valid till 25th July 2026"),
  [],
);

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

assert.equal(resolveMerchantFromText("deals at Keells with ComBank"), "Keells");
assert.equal(resolveMerchantFromText("/supermarket/cargills-food-city"), "Cargills Food City");
assert.equal(resolveMerchantFromText("SPAR Supermarket fresh"), "SPAR Supermarket");
assert.equal(resolveMerchantFromText("Glomark Softlogic"), "Glomark");
assert.equal(resolveMerchantFromText("LAUGFS Super"), "LAUGFS Supermarkets");

const saturday = new Date("2026-07-18T12:00:00+05:30"); // Saturday in Colombo
const friday = new Date("2026-07-17T12:00:00+05:30");
const monday = new Date("2026-07-20T12:00:00+05:30"); // Monday in Colombo

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

const weekendBlast: CardOffer = {
  id: "t4",
  bank: "HNB",
  merchant: "Keells",
  title: "Weekend supermarket blast",
  discountLabel: "15% Off",
  validTo: "2026-07-31",
  weekdayHint: "weekend",
  sourceUrl: "https://example.com/weekend",
  asOf: "2026-07-18",
};

const titleOnlyMonday: CardOffer = {
  id: "t5",
  bank: "Commercial Bank",
  merchant: "Keells",
  title: "every Monday till 31st July 2026 at Keells",
  discountLabel: "20% Off",
  validTo: "2026-07-31",
  weekdayHint: null,
  sourceUrl: "https://example.com/mon",
  asOf: "2026-07-20",
};

assert.equal(isOfferActiveToday(keellsSat, saturday), true);
assert.equal(isOfferActiveToday(keellsSat, friday), false);
assert.equal(isOfferActiveToday(openWindow, friday), true);
assert.equal(isOfferActiveToday(expired, friday), false);
assert.equal(isOfferActiveToday(weekendBlast, saturday), true);
assert.equal(isOfferActiveToday(weekendBlast, friday), false);
assert.equal(isOfferActiveToday(titleOnlyMonday, monday), true);
assert.equal(isOfferActiveToday(titleOnlyMonday, friday), false);

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

// ComBank HTML: attribute order + offer-tag percentage markup
const combankHtml = `
<section id="supermarket">
  <a class="reward col-md-4" href="https://www.combank.lk/rewards-promotion/supermarket/keells-sat">
    <div class="offer-tag percentage"><p>Up to</p><p class='percentage'>25%</p><p>Off</p></div>
    <div class="reward-content">
      <p class="category">Supermarket</p>
      <h3>Enjoy the best supermarket deals at Keells with ComBank Credit Cards</h3>
      <p class="valid-date">Offer valid on every Saturday till 25th July 2026</p>
    </div>
  </a>
  <a href="https://www.combank.lk/rewards-promotion/supermarket/cargills-fri" class="reward">
    <div class="offer-tag percentage"><p>Up to</p><p class='percentage'>25%</p><p>Off</p></div>
    <p class="category">Supermarket</p>
    <h3>Enjoy the best supermarket deals at Cargills Food City with ComBank Credit Cards</h3>
    <p class="valid-date">Offer valid on every Friday till 31st July 2026</p>
  </a>
  <a class="reward" href="https://www.combank.lk/rewards-promotion/supermarket/spar-tue">
    <div class="offer-tag percentage"><p>Up to</p><p class='percentage'>20%</p><p>Off</p></div>
    <p class="category">Supermarket</p>
    <h3>Fresh deals at Spar Supermarket with ComBank Credit Cards</h3>
    <p class="valid-date">Offer valid on every Tuesday till 28th July 2026</p>
  </a>
  <a class="reward" href="https://www.combank.lk/rewards-promotion/supermarket/glomark-wed">
    <div class="offer-tag percentage"><p>Up to</p><p class='percentage'>25%</p><p>Off</p></div>
    <p class="category">Supermarket</p>
    <h3>Softlogic Glomark supermarket deals with ComBank</h3>
    <p class="valid-date">Every Wednesday till 29th July 2026</p>
  </a>
  <a class="reward" href="https://www.combank.lk/rewards-promotion/supermarket/laugfs-sun">
    <div class="offer-tag percentage"><p>Up to</p><p class='percentage'>10%</p><p>Off</p></div>
    <p class="category">Supermarket</p>
    <h3>LAUGFS Super total bill with ComBank Credit Cards</h3>
    <p class="valid-date">Offer valid on every Sunday till 26th July 2026</p>
  </a>
  <a class="reward" href="https://www.combank.lk/rewards-promotion/dining/some-restaurant">
    <div class="offer-tag"><p>Best Offer</p></div>
    <p class="category">Food &amp; Restaurants</p>
    <h3>Dining deal at Ocean Basket</h3>
    <p class="valid-date">Offer valid on every Monday till 31st July 2026</p>
  </a>
</section>
`;

const scraped = parseCombankRewardsHtml(combankHtml, "2026-07-20");
assert.equal(scraped.length, 5);
assert.deepEqual(
  scraped.map((o) => o.merchant).sort(),
  [
    "Cargills Food City",
    "Glomark",
    "Keells",
    "LAUGFS Supermarkets",
    "SPAR Supermarket",
  ],
);
const keellsScraped = scraped.find((o) => o.merchant === "Keells");
assert.ok(keellsScraped);
assert.equal(keellsScraped.weekdayHint, "saturday");
assert.match(keellsScraped.discountLabel, /25\s*%/i);
assert.equal(keellsScraped.validTo, "2026-07-25");

const tagLabel = extractCombankDiscountLabel(
  `<div class="offer-tag percentage"><p>Up to</p><p class='percentage'>25%</p><p>Off</p></div>`,
  "Keells",
);
assert.match(tagLabel, /25%/);

// Seed fallback: Colombo weekday filter
const seedFriday = getCardOffersSeedSnapshot(friday);
assert.ok(seedFriday.isSeed);
assert.ok(seedFriday.offers.every((o) => o.isSeed));
assert.ok(
  seedFriday.offers.every(
    (o) => !o.weekdayHint || matchesWeekdayHint(o.weekdayHint, "friday"),
  ),
);
assert.ok(seedFriday.offers.some((o) => /cargills/i.test(o.merchant)));
assert.ok(seedFriday.offers.some((o) => /glomark/i.test(o.merchant)));
assert.ok(seedFriday.offers.some((o) => o.bank === "DFCC Bank"));
// Date-specific seed (09th & 23rd Jul) must not leak onto other Colombo weekdays
assert.ok(!seedFriday.offers.some((o) => o.id === "seed-pabc-cargills"));

const seedSaturday = getCardOffersSeedSnapshot(saturday);
assert.ok(seedSaturday.offers.some((o) => /keells/i.test(o.merchant)));
assert.ok(
  seedSaturday.offers.some(
    (o) => o.bank === "DFCC Bank" && /spar/i.test(o.merchant),
  ),
);
assert.ok(
  seedSaturday.offers.every(
    (o) => !o.weekdayHint || matchesWeekdayHint(o.weekdayHint, "saturday"),
  ),
);
assert.ok(seedSaturday.offers.every((o) => o.isSeed));

const seedMonday = getCardOffersSeedSnapshot(monday);
assert.ok(
  seedMonday.offers.some(
    (o) => o.bank === "Pan Asia Bank" && /laugfs/i.test(o.merchant),
  ),
);
assert.ok(
  seedMonday.offers.some(
    (o) => o.bank === "People's Bank" && /keells/i.test(o.merchant),
  ),
);
assert.ok(
  seedMonday.offers.every(
    (o) => !o.weekdayHint || matchesWeekdayHint(o.weekdayHint, "monday"),
  ),
);

// Coverage tokens: alias merchants collapse; Cargills Online stays distinct
assert.equal(merchantCoverageToken("Cargills"), merchantCoverageToken("Cargills Food City"));
assert.equal(merchantCoverageToken("LAUGFS"), merchantCoverageToken("Laugfs Super"));
assert.notEqual(
  merchantCoverageToken("Cargills Online"),
  merchantCoverageToken("Cargills Food City"),
);

// Live + seed gap fill: keep today's live banks; fill uncovered merchants from seed
const liveFridayKeells: CardOffer = {
  id: "live-hnb-keells-fri",
  bank: "HNB",
  merchant: "Keells",
  title: "Live Keells Friday deal",
  discountLabel: "25% off",
  validTo: "2026-07-31",
  weekdayHint: "friday",
  sourceUrl: "https://example.com/live-keells",
  asOf: "2026-07-17",
};
const liveFridayCargills: CardOffer = {
  id: "live-combank-cargills-fri",
  bank: "Commercial Bank",
  merchant: "Cargills Food City",
  title: "Live Cargills Friday deal",
  discountLabel: "Up to 25% Off",
  validTo: "2026-07-31",
  weekdayHint: "friday",
  sourceUrl: "https://example.com/live-cargills",
  asOf: "2026-07-17",
};
const mixedFriday = mergeTodaysLiveWithSeed(
  [liveFridayKeells, liveFridayCargills],
  seedFriday.offers,
);
assert.ok(mixedFriday.some((o) => o.id === "live-hnb-keells-fri" && o.isSeed === false));
assert.ok(
  mixedFriday.some((o) => o.id === "live-combank-cargills-fri" && o.isSeed === false),
);
// Live Cargills covers seed Cargills / Cargills Food City Friday slots
assert.ok(!mixedFriday.some((o) => o.isSeed && /cargills/i.test(o.merchant)));
// Uncovered Friday merchants (e.g. Glomark) still come from seed
assert.ok(
  mixedFriday.some(
    (o) => o.isSeed && o.bank === "HNB" && /glomark/i.test(o.merchant),
  ),
);
assert.equal(
  offerCoverageKey(liveFridayCargills),
  offerCoverageKey({
    ...liveFridayCargills,
    merchant: "Cargills",
  }),
);

// Empty live → all seed gaps (does not invent live rows)
const allSeedFriday = mergeTodaysLiveWithSeed([], seedFriday.offers);
assert.ok(allSeedFriday.length > 0);
assert.ok(allSeedFriday.every((o) => o.isSeed));
assert.deepEqual(
  allSeedFriday.map((o) => o.id).sort(),
  seedFriday.offers.map((o) => o.id).sort(),
);

const seedDays = new Set(
  seedData.offers.map((o) => o.weekdayHint).filter(Boolean),
);
for (const day of [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]) {
  assert.ok(seedDays.has(day), `seed missing ${day} coverage`);
}

// When title names a weekday, it must agree with stored seed hint
for (const offer of seedData.offers) {
  const fromTitle = parseWeekdayHint(offer.title);
  if (
    fromTitle &&
    offer.weekdayHint &&
    fromTitle !== "weekdays" &&
    fromTitle !== "weekend"
  ) {
    assert.equal(
      fromTitle,
      offer.weekdayHint,
      `seed ${offer.id} title weekday should match hint`,
    );
  }
}

const pabcKeells = normalizePabcOffer(
  {
    cat: "18",
    text: "25% OFF",
    date: "07-07-2026",
    backtext:
      "Enjoy 25% OFF on fresh vegetables, fruits, seafood and fresh meat at Keells every Wednesday (08, 15, 22 & 29 July 2026) with your Pan Asia Bank Credit Card. Minimum bill Rs.5,000.",
    offer_type: ["Credit card"],
  },
  "2026-07-20",
  0,
);
assert.ok(pabcKeells);
assert.equal(pabcKeells.bank, "Pan Asia Bank");
assert.equal(pabcKeells.merchant, "Keells");
assert.equal(pabcKeells.weekdayHint, "wednesday");
assert.equal(pabcKeells.validTo, "2026-07-29");
assert.equal(pabcKeells.discountLabel, "25% OFF");

assert.equal(
  normalizePabcOffer(
    {
      cat: "4",
      text: "30% OFF",
      backtext: "Enjoy 30% OFF at Breeze Bar with Pan Asia Credit Cards",
      offer_type: ["Credit card"],
    },
    "2026-07-20",
    1,
  ),
  null,
);

const pabcParsed = parsePabcCardOffersHtml(
  `
<script>
var arr_offers = [
  { cat: "18", img: "http://example/x.jpg", text: "25% OFF", date: "07-07-2026",
    backtext: "Enjoy 25% OFF at Softlogic Glomark every Thursday in July (02, 09, 16, 23 & 30) with your Pan Asia Bank Credit Card.",
    offer_type: ["Credit card"] },
  { cat: "13", img: "http://example/y.jpg", text: "0% IPP", date: "01-07-2026",
    backtext: "Up to 12 months 0% installments at Singer",
    offer_type: ["Credit card"] }
];
</script>`,
  "2026-07-20",
);
assert.equal(pabcParsed.length, 1);
assert.equal(pabcParsed[0]?.merchant, "Glomark");
assert.equal(pabcParsed[0]?.weekdayHint, "thursday");

const dfcc = normalizeDfccOffer({
  merchant: "Cargills Food City",
  title:
    "25% Savings on Fresh Vegetables, Fruits & Seafood at all Cargills Food City, Express & Food Hall outlets for bills over Rs. 5,000/- with DFCC Credit Cards.",
  validText: "Every Friday from 03rd to 24th July 2026",
  asOf: "2026-07-20",
});
assert.ok(dfcc);
assert.equal(dfcc.bank, "DFCC Bank");
assert.equal(dfcc.weekdayHint, "friday");
assert.equal(dfcc.validTo, "2026-07-24");
assert.match(dfcc.discountLabel, /25\s*%/i);

const dfccParsed = parseDfccSupermarketHtml(
  `
<p>10% Savings on the Total Bill at Laugfs Super for bills over Rs. 5,000/- with DFCC Credit Cards.</p>
<div class="bIRM"><p class="cardOfferValid">Every Tuesday from 07th to 28th July 2026</p></div>
<p>20% Savings on Fresh Vegetables at SPAR Supermarket for bills over Rs. 7,500/- with DFCC Credit Cards.</p>
<div class="bIRM"><p class="cardOfferValid">Every Saturday from 04th to 25th July 2026</p></div>`,
  "2026-07-20",
);
assert.equal(dfccParsed.length, 2);
assert.deepEqual(
  dfccParsed.map((o) => o.weekdayHint).sort(),
  ["saturday", "tuesday"],
);

const sucuriDecoded =
  "n=\"01\" + \"ff\";document.cookie='sucuri_cloudproxy_uuid_test=' + n + ';path=/;max-age=86400'; location.reload();";
const sucuriChallenge = `<script>S='${Buffer.from(sucuriDecoded).toString("base64")}';</script>`;
assert.equal(
  solveSucuriCookie(sucuriChallenge),
  "sucuri_cloudproxy_uuid_test=01ff",
);

assert.deepEqual(parseWeekdayHints("(Every Monday & Wednesday)"), [
  "monday",
  "wednesday",
]);
assert.deepEqual(parseWeekdayHints("(Every Tuesdays & Thursdays)"), [
  "tuesday",
  "thursday",
]);

// --- People's Bank supermarket offer-card HTML (data-* attrs) ---
const peoplesHtml = `
<section class="offers">
  <article class="offer-card" role="article">
    <div class="discount-badge">25%</div>
    <div class="offer-image">
      <a href="https://www.peoplesbank.lk/promotion/keells-25-off-credit/">
        <img alt="Keells" />
      </a>
    </div>
    <div class="card-content">
      <div class="promo-short fw-medium">Keells</div>
      <span class="fw-medium valid-date">Till July 31, 2026<br>((Every Monday &amp; Wednesday))</span>
    </div>
    <div class="card-footer p-0">
      <a class="icon-btn calendar-btn" title="Add to Calendar" href="#"
        data-title="Keells &#8211; 25% off &#8211; Credit"
        data-description="25% off on Fresh Vegetables,Fruit, Seafood &amp; Fresh Meat"
        data-start=""
        data-end="20260731"
        data-notes="(Every Monday &amp; Wednesday)"
        data-location="Keells">
      </a>
    </div>
  </article>
  <article class="offer-card" role="article">
    <div class="discount-badge">25%</div>
    <a href="https://www.peoplesbank.lk/promotion/cargills-25-off-credit/">Cargills</a>
    <div class="promo-short fw-medium">Cargills</div>
    <a class="icon-btn calendar-btn" href="#"
      data-title="Cargills &#8211; 25% off &#8211; Credit"
      data-description="25% OFF on Fresh Vegetables, Fruits &amp; Seafood"
      data-end="20260731"
      data-notes="(Every Tuesdays &amp; Thursdays)"
      data-location="Cargills">
    </a>
  </article>
  <article class="offer-card" role="article">
    <div class="discount-badge">10%</div>
    <a href="https://www.peoplesbank.lk/promotion/laugfs-super-10-off-credit/">Laugfs</a>
    <div class="promo-short fw-medium">Laugfs Super</div>
    <a class="icon-btn calendar-btn" href="#"
      data-title="Laugfs Super &#8211; 10% off &#8211; Credit"
      data-description="10% off on total bill value."
      data-end="20260731"
      data-notes="Every Sunday"
      data-location="Laugfs Super">
    </a>
  </article>
  <article class="offer-card" role="article">
    <div class="discount-badge">20%</div>
    <a href="https://www.peoplesbank.lk/promotion/some-hotel-20-off-credit/">Hotel</a>
    <div class="promo-short fw-medium">Random Hotel</div>
    <a class="icon-btn calendar-btn" href="#"
      data-title="Random Hotel &#8211; 20% off &#8211; Credit"
      data-description="20% off dining"
      data-end="20260731"
      data-notes="(Every Friday)"
      data-location="Random Hotel">
    </a>
  </article>
</section>
`;

const peoplesOffers = parsePeoplesBankOffersHtml(peoplesHtml, "2026-07-20");
assert.equal(peoplesOffers.length, 5); // Keells×2 + Cargills×2 + Laugfs — hotel filtered out
assert.ok(peoplesOffers.every((o) => o.bank === "People's Bank"));
assert.ok(peoplesOffers.every((o) => isSupermarketPromo(o.title, o.merchant)));
const pbKeellsMon = peoplesOffers.find(
  (o) => o.merchant === "Keells" && o.weekdayHint === "monday",
);
assert.ok(pbKeellsMon);
assert.equal(pbKeellsMon.validTo, "2026-07-31");
assert.match(pbKeellsMon.discountLabel, /25\s*%/i);
assert.ok(
  peoplesOffers.some((o) => o.merchant === "Keells" && o.weekdayHint === "wednesday"),
);
assert.ok(
  peoplesOffers.some((o) => /cargills/i.test(o.merchant) && o.weekdayHint === "thursday"),
);
assert.ok(
  peoplesOffers.some((o) => /laugfs/i.test(o.merchant) && o.weekdayHint === "sunday"),
);

// --- NTB Mastercard promotions grid (supermarket only) ---
const ntbListingHtml = `
<div class="row">
  <div class="col-lg-3 col-md-4 col-6 grid-item supermarket">
    <div class="promo-box">
      <div class="promo-image">
        <div class="tag">Supermarket</div>
      </div>
      <div class="info">
        <h6>Cargills Online</h6>
        <h5>15% off with Mastercard Credit Cards</h5>
      </div>
      <div class="promo-footer">
        <small>Valid on every Thursday till 30th November 2026</small>
        <a href="https://www.nationstrust.com/promotions/15-off-with-mastercard-credit-cards-3">Learn More</a>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-md-4 col-6 grid-item dining">
    <div class="promo-box">
      <div class="info">
        <h6>Some Restaurant</h6>
        <h5>20% off with Mastercard Credit Cards</h5>
      </div>
      <div class="promo-footer">
        <small>Valid till 31st July 2026</small>
        <a href="https://www.nationstrust.com/promotions/dining-noise">Learn More</a>
      </div>
    </div>
  </div>
  <div class="col-lg-3 col-md-4 col-6 grid-item supermarket">
    <div class="promo-box">
      <div class="info">
        <h6>Keells</h6>
        <h5>Up to 25% off with Mastercard Credit Cards</h5>
      </div>
      <div class="promo-footer">
        <small>Valid on selected dates till 31st July 2026</small>
        <a href="https://www.nationstrust.com/promotions/up-to-25-off-with-mastercard-credit-cards">Learn More</a>
      </div>
    </div>
  </div>
</div>
`;

const ntbListing = parseNtbPromotionsHtml(ntbListingHtml, "2026-07-20");
assert.equal(ntbListing.length, 2);
assert.ok(ntbListing.every((o) => o.bank === "Nations Trust Bank"));
assert.ok(!ntbListing.some((o) => /restaurant/i.test(o.merchant)));
const ntbOnline = ntbListing.find((o) => /cargills online/i.test(o.merchant));
assert.ok(ntbOnline);
assert.equal(ntbOnline.weekdayHint, "thursday");
assert.equal(ntbOnline.validTo, "2026-11-30");
assert.match(ntbOnline.discountLabel, /15\s*%/i);

// --- NTB supermarket hub table ---
const ntbHubHtml = `
<table>
  <tr><th>Merchant</th><th>Offer</th><th>Eligibility</th></tr>
  <tr>
    <td>Cargills Food City</td>
    <td>30% off with Mastercard Credit Cards</td>
    <td><p>Offer valid on Wednesdays on fresh fruits and vegetables only</p>
        <p>Valid till 31st July 2026</p></td>
  </tr>
  <tr>
    <td>Keells&nbsp;</td>
    <td>25% off with Mastercard Credit Cards</td>
    <td><p>Valid every sunday on fresh meat, fruits, and vegetables</p>
        <p>Valid every Sunday till 31st July 2026</p></td>
  </tr>
  <tr>
    <td>Some Spa</td>
    <td>40% off wellness</td>
    <td><p>Valid every Monday till 31st July 2026</p></td>
  </tr>
</table>
`;

const ntbHub = parseNtbSupermarketHubHtml(ntbHubHtml, "2026-07-20");
assert.equal(ntbHub.length, 2);
const ntbCargillsWed = ntbHub.find(
  (o) => /cargills/i.test(o.merchant) && o.weekdayHint === "wednesday",
);
assert.ok(ntbCargillsWed);
assert.equal(ntbCargillsWed.validTo, "2026-07-31");
assert.match(ntbCargillsWed.discountLabel, /30\s*%/i);
const ntbKeellsSun = ntbHub.find(
  (o) => /keells/i.test(o.merchant) && o.weekdayHint === "sunday",
);
assert.ok(ntbKeellsSun);

// --- Visa LK VMORC Glomark / supermarket slice ---
const visaGlomark = normalizeVisaPerk(
  {
    sourceId: "177830",
    sourceType: "VMORC",
    perkType: "OFFERS",
    shortDescription:
      "10% off on total bill for Visa Cards issued from Sri Lanka. Valid every Thursday from 1 Feb 2026 to 31 July 2026 Applicable only on Tap to Pay Transactions (Contactless Transaction) Subject to TnCs",
    title: "Glomark",
    merchantName: "Glomark",
    startDate: 1769904000000,
    endDate: 1785542340000,
    metaData: {
      customAttributes: {
        offerCopy: "10% off on total bill Redemption Process: In-store",
      },
    },
  },
  "2026-07-20",
);
assert.ok(visaGlomark);
assert.equal(visaGlomark.bank, "Visa");
assert.equal(visaGlomark.merchant, "Glomark");
assert.equal(visaGlomark.weekdayHint, "thursday");
assert.equal(visaGlomark.validTo, "2026-07-31");
assert.equal(visaGlomark.discountLabel, "10% off");
assert.match(visaGlomark.sourceUrl, /177830/);

const visaDining = normalizeVisaPerk(
  {
    sourceId: "174094",
    shortDescription: "Visa cardholders can save up to $300 at FARFETCH.",
    title: "FARFETCH",
    merchantName: "FARFETCH",
    endDate: 1798761540000,
  },
  "2026-07-20",
);
assert.equal(visaDining, null);

const seedVisa = seedData.offers.find((o) => o.id === "seed-visa-glomark-thu");
assert.ok(seedVisa);
assert.equal(seedVisa.bank, "Visa");
assert.equal(seedVisa.weekdayHint, "thursday");

console.log("card-offers.test.ts: ok");
