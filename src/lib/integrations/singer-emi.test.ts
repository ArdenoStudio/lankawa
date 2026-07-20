import assert from "node:assert/strict";
import {
  formatTenorsLabel,
  getSingerEmiSeedSnapshot,
  parseEmiListPayload,
  parseMonthlyAmount,
  parseSingleEmiPayload,
  SINGER_EMI_SOURCE_ID,
  summarizeCallConvert,
} from "./singer-emi";

assert.equal(parseMonthlyAmount("5,400"), 5400);
assert.equal(parseMonthlyAmount("1,350"), 1350);
assert.equal(parseMonthlyAmount("bad"), null);

assert.equal(formatTenorsLabel([6, 12, 24]), "6/12/24");
assert.equal(formatTenorsLabel([]), "—");

const list = parseEmiListPayload([
  [
    { id: 1, name: "Sampath Bank", call_convert: 0 },
    { id: 7, name: "DFCC", call_convert: 1 },
    { id: 21, name: "MintPay", call_convert: 0 },
  ],
  [
    { installment: 6, interest: "5,400" },
    { installment: 12, interest: "2,700" },
  ],
]);
assert.ok(list);
assert.equal(list.banks.length, 3);
assert.equal(list.banks[0]?.name, "Sampath Bank");
assert.equal(list.banks[1]?.callConvert, true);
assert.deepEqual(list.defaultTenorsMonths, [6, 12]);

assert.equal(parseEmiListPayload([]), null);
assert.equal(parseEmiListPayload([[]]), null);
assert.equal(parseEmiListPayload("nope"), null);

const single = parseSingleEmiPayload([
  [
    { installment: 6, interest: "5,400" },
    { installment: 12, interest: "2,700" },
    { installment: 24, interest: "1,350" },
  ],
  { id: 1, name: "Sampath Bank", call_convert: 0 },
]);
assert.ok(single);
assert.deepEqual(single.tenorsMonths, [6, 12, 24]);
assert.deepEqual(single.sampleMonthlyFormatted, ["5,400", "2,700", "1,350"]);
assert.equal(parseSingleEmiPayload([[]]), null);

const seed = getSingerEmiSeedSnapshot();
assert.equal(seed.isSeed, true);
assert.equal(seed.sourceId, SINGER_EMI_SOURCE_ID);
assert.ok(seed.banks.length >= 6);
assert.ok(seed.sampleProduct.productId > 0);
assert.ok(seed.defaultTenorsMonths.length > 0);
assert.equal(summarizeCallConvert(seed.banks), seed.callConvertCount);
assert.ok(seed.callConvertCount >= 1);
assert.match(seed.methodologyNote, /Softlogic/i);
assert.match(seed.methodologyNote, /Abans|Arpico/i);

console.log("singer-emi.test.ts: ok");
