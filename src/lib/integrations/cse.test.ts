import assert from "node:assert/strict";
import {
  parseCseCompanyInfo,
  parseCseNotices,
  parseDedicatedMovers,
  parseGicsSectorValuationMap,
} from "./cse";

const notificationsPayload = {
  status: "OK",
  statusCode: 200,
  content: [
    {
      id: "a190afac53d99d146a5fec793bca61ee",
      title: "NOTICE",
      body: "The Opening Market Auction Call has been further extended to restore the active accounts which were suspended. Trading will commence at 11 a.m. ",
      status: "I",
    },
    {
      id: "305c7e91fd65a37c60e3c0999224ea0b",
      title: "Notice",
      body: "Opening Market Auction Call has been further extended.",
      status: "I",
    },
  ],
};

const approvedPayload = {
  approvedAnnouncements: [
    {
      id: 31896,
      createdDate: 1_784_520_882_000,
      dateOfAnnouncement: "20 Jul 2026",
      announcementId: 38081,
      announcementCategory: "TRADING HALT LIFTED",
      company: "BANSEI ROYAL RESORTS HIKKADUWA PLC",
      symbol: null,
    },
    {
      id: 31895,
      createdDate: 1_784_518_499_000,
      announcementCategory: "TRADING HALTED",
      company: "BANSEI ROYAL RESORTS HIKKADUWA PLC",
    },
  ],
};

const fallbackAsOf = "2026-07-18T09:30:00.000Z";

const fromNotifications = parseCseNotices(notificationsPayload, fallbackAsOf);
assert.equal(fromNotifications.length, 2);
assert.equal(fromNotifications[0]?.kind, "notification");
assert.match(
  fromNotifications[0]?.title ?? "",
  /Opening Market Auction Call/i,
);
assert.ok(!(fromNotifications[0]?.title ?? "").startsWith("NOTICE"));
assert.equal(fromNotifications[0]?.id, "a190afac53d99d146a5fec793bca61ee");

const fromApproved = parseCseNotices(approvedPayload, fallbackAsOf);
assert.equal(fromApproved.length, 2);
assert.equal(fromApproved[0]?.kind, "announcement");
assert.equal(
  fromApproved[0]?.title,
  "TRADING HALT LIFTED — BANSEI ROYAL RESORTS HIKKADUWA PLC",
);
assert.equal(
  fromApproved[0]?.company,
  "BANSEI ROYAL RESORTS HIKKADUWA PLC",
);
assert.equal(
  fromApproved[0]?.publishedAt,
  new Date(1_784_520_882_000).toISOString(),
);

assert.deepEqual(parseCseNotices(null, fallbackAsOf), []);
assert.deepEqual(parseCseNotices({ content: [] }, fallbackAsOf), []);

const company = parseCseCompanyInfo({
  reqSymbolInfo: {
    symbol: "JKH.N0000",
    name: "JOHN KEELLS HOLDINGS PLC",
    lastTradedPrice: 19.8,
    change: -0.1,
    changePercentage: -0.5025,
    marketCap: 351_136_152_892.8,
    previousClose: 19.9,
  },
});
assert.ok(company);
assert.equal(company.symbol, "JKH.N0000");
assert.equal(company.price, 19.8);
assert.equal(company.change, -0.1);
assert.equal(company.changePct, -0.5025);
assert.equal(company.isFallback, false);

assert.equal(parseCseCompanyInfo({}), null);
assert.equal(parseCseCompanyInfo({ reqSymbolInfo: { symbol: "X" } }), null);

const gicsMap = parseGicsSectorValuationMap({
  reqTradeDate: 1_784_226_600_000,
  reqGICSSectorSummery: [
    {
      sectorId: "SPCSEEIP",
      per: 12.6,
      pbv: 1.0,
      dy: "2.9",
      companiesTraded: 3,
      companiesListed: 3,
    },
    {
      sectorId: "SPCSEBP",
      per: null,
      pbv: 0.8,
      dy: "4.2",
      companiesTraded: 17,
      companiesListed: 17,
    },
  ],
});
assert.equal(gicsMap.size, 2);
assert.deepEqual(gicsMap.get("SPCSEEIP"), {
  per: 12.6,
  pbv: 1.0,
  dy: 2.9,
  companiesTraded: 3,
  companiesListed: 3,
});
assert.equal(gicsMap.get("SPCSEBP")?.per, null);
assert.equal(gicsMap.get("SPCSEBP")?.dy, 4.2);
assert.equal(parseGicsSectorValuationMap(null).size, 0);
assert.equal(parseGicsSectorValuationMap({}).size, 0);

const dedicatedGainers = parseDedicatedMovers([
  {
    id: 1,
    securityId: 100,
    symbol: "NTB.X0000",
    price: 409.0,
    change: 53.0,
    changePercentage: 14.89,
    tradeDate: 1_784_520_000_000,
  },
  {
    id: 2,
    symbol: "ONAL.N0000",
    price: 48.5,
    change: 3.3,
    changePercentage: 7.3,
  },
  {
    id: 3,
    symbol: "CALI.U0000",
    price: 14.0,
    change: 0.7,
    changePercentage: 5.26,
  },
  {
    id: 4,
    symbol: "KFP.N0000",
    price: 178.0,
    change: 8.0,
    changePercentage: 4.71,
  },
  {
    id: 5,
    symbol: "CERA.N0000",
    price: 177.5,
    change: 7.5,
    changePercentage: 4.41,
  },
  {
    id: 6,
    symbol: "HOPL.N0000",
    price: 56.6,
    change: 2.3,
    changePercentage: 4.24,
  },
]);
assert.equal(dedicatedGainers.length, 5);
assert.equal(dedicatedGainers[0]?.symbol, "NTB.X0000");
assert.equal(dedicatedGainers[0]?.name, "NTB.X0000");
assert.equal(dedicatedGainers[0]?.price, 409.0);
assert.equal(dedicatedGainers[0]?.change, 53.0);
assert.equal(dedicatedGainers[0]?.changePct, 14.89);
assert.equal(dedicatedGainers[4]?.symbol, "CERA.N0000");

const dedicatedLosers = parseDedicatedMovers([
  {
    symbol: "UCAR.N0000",
    price: 2290.0,
    change: -264.5,
    changePercentage: -10.35,
  },
  {
    symbol: "SEMB.N0000",
    price: 0.9,
    change: -0.1,
    changePercentage: -10.0,
  },
]);
assert.equal(dedicatedLosers.length, 2);
assert.equal(dedicatedLosers[0]?.symbol, "UCAR.N0000");
assert.equal(dedicatedLosers[0]?.changePct, -10.35);

assert.deepEqual(parseDedicatedMovers(null), []);
assert.deepEqual(parseDedicatedMovers([]), []);
assert.deepEqual(
  parseDedicatedMovers([{ symbol: "X", price: null, changePercentage: 1 }]),
  [],
);
assert.equal(
  parseDedicatedMovers({
    list: [{ symbol: "JKH.N0000", price: 24.5, changePercentage: 1.2 }],
  }).length,
  1,
);

console.log("cse integration test passed");
