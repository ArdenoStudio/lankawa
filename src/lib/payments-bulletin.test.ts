import assert from "node:assert/strict";
import { getPaymentsBulletinSnapshot } from "./payments-bulletin";

const snapshot = getPaymentsBulletinSnapshot();

assert.equal(snapshot.sourceId, "cbsl_payments_bulletin");
assert.equal(snapshot.sourceName, "CBSL Payments Bulletin");
assert.equal(snapshot.period, "2025-Q4");
assert.equal(snapshot.periodLabel, "Fourth Quarter 2025");
assert.equal(snapshot.asOf, "2026-05-21");
assert.equal(snapshot.periodEnd, "2025-12-31");
assert.equal(snapshot.isSeed, true);
assert.equal(snapshot.cadence, "quarterly");
assert.match(snapshot.bulletinUrl, /Payments_Bulletin_4Q2025_e\.pdf/);
assert.match(snapshot.indexUrl, /payments-bulletin/);

assert.equal(snapshot.cefts.volumeThousand, 71411);
assert.equal(snapshot.cefts.valueRsBillion, 6417);
assert.equal(snapshot.cefts.members, 50);

assert.equal(snapshot.justpay.volumeThousand, 7269);
assert.equal(snapshot.justpay.valueRsBillion, 38);
assert.equal(snapshot.justpay.enabledApps, 25);

assert.equal(snapshot.lankaqr.domesticVolumeThousand, 266);
assert.equal(snapshot.lankaqr.domesticValueRsMillion, 1330);
assert.equal(snapshot.lankaqr.merchantsRegistered, 460990);
assert.equal(snapshot.lankaqr.globalVolume, 17368);
assert.equal(snapshot.lankaqr.globalValueRsMillion, 296.2);

assert.match(snapshot.note, /quarterly/i);
assert.match(snapshot.note, /seed/i);

console.log("payments-bulletin.test.ts: ok");
