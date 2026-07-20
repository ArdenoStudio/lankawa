import assert from "node:assert/strict";
import {
  DEMAND_MGMT_GROUP_IDS,
  formatCustomerCount,
  getDemandMgmtClustersSeedSnapshot,
  parseCebJsonPayload,
  summarizeClusters,
} from "./demand-mgmt-clusters";

assert.equal(DEMAND_MGMT_GROUP_IDS.length, 25);
assert.equal(DEMAND_MGMT_GROUP_IDS[0], "A");
assert.equal(DEMAND_MGMT_GROUP_IDS.at(-1), "Y");

assert.equal(formatCustomerCount(0), "0");
assert.equal(formatCustomerCount(999), "999");
assert.equal(formatCustomerCount(352_325), "352k");
assert.equal(formatCustomerCount(1_500_000), "1.5M");
assert.equal(formatCustomerCount(-1), "—");

const empty = summarizeClusters("A", []);
assert.equal(empty, null);

const summary = summarizeClusters("a", [
  {
    NumberOfCustomers: 20_725,
    GeneratedTime: "2026-07-20T10:35:33.2171271+05:30",
    GroupId: "A",
  },
  {
    NumberOfCustomers: 10_000,
    GeneratedTime: "2026-07-20T10:35:33.2171271+05:30",
    GroupId: "A",
  },
]);
assert.ok(summary);
assert.equal(summary.groupId, "A");
assert.equal(summary.clusterCount, 2);
assert.equal(summary.customerCount, 30_725);
assert.equal(summary.generatedTime, "2026-07-20T10:35:33.2171271+05:30");

const doubleEncoded = parseCebJsonPayload<
  Array<{ NumberOfCustomers: number; GroupId: string }>
>('[{"NumberOfCustomers":100,"GroupId":"B"}]');
assert.equal(doubleEncoded.length, 1);
assert.equal(doubleEncoded[0]?.GroupId, "B");

const asStringPayload = parseCebJsonPayload<
  Array<{ NumberOfCustomers: number }>
>(JSON.stringify('[{"NumberOfCustomers":50}]'));
assert.equal(asStringPayload[0]?.NumberOfCustomers, 50);

assert.throws(() => parseCebJsonPayload(""), /empty/i);

const seed = getDemandMgmtClustersSeedSnapshot();
assert.equal(seed.isSeed, true);
assert.equal(seed.sourceId, "ceb_demand_mgmt_clusters");
assert.ok(seed.groups.length >= 20);
assert.ok(seed.totalCustomers > 0);
assert.ok(seed.totalClusters > 0);
assert.match(seed.methodologyNote, /confirm on cebcare/i);

console.log("demand-mgmt-clusters.test.ts: ok");
