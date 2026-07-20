import assert from "node:assert/strict";
import {
  parseCseCompanyInfo,
  parseCseNotices,
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

console.log("cse integration test passed");
