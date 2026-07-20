import assert from "node:assert/strict";
import {
  CBSL_POLICY_RATES_SOURCE_ID,
  getCbslPolicyRatesSeedSnapshot,
  parsePlratesHtml,
} from "./cbsl-policy-rates";

const FIXTURE_HTML = `<!doctype html>
<html lang="en">
<body>
<table id="container" cellspacing="0" cellpadding="5px">
   <tbody>
      <tr style="background-color:#ff8c1a;">
         <td>
            <p style="font-family:Helvetica, Arial, sans-serif"><strong>Per cent per annum</strong></p>
         </td>
         <td>
            <p>&nbsp;</p>
         </td>
      </tr>
      <tr style="background-color:#ff8c1a;">
         <td>
            <p style="font-family:Helvetica, Arial, sans-serif"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Overnight Policy Rate (OPR)</strong></p>
         </td>
         <td>
            <p style="font-family:Helvetica, Arial, sans-serif"><strong>
8.75</strong></p>
         </td>
      </tr>
      <tr style="background-color:#ff8c1a;">
         <td>
            <p style="font-family:Helvetica, Arial, sans-serif"><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Statutory Reserve Ratio (SRR)</strong></p>
         </td>
         <td>
            <p style="font-family:Helvetica, Arial, sans-serif"><strong>2.00
</strong></p>
         </td>
      </tr>
   </tbody>
</table>
</body>
</html>`;

const board = parsePlratesHtml(FIXTURE_HTML);
assert.ok(board);
assert.equal(board.opr, 8.75);
assert.equal(board.srr, 2);

assert.equal(parsePlratesHtml(""), null);
assert.equal(parsePlratesHtml("<html><body>no rates</body></html>"), null);
assert.equal(parsePlratesHtml("<table><tr><td>Overnight Policy Rate (OPR)</td><td>99</td></tr></table>"), null);

const textOnly = parsePlratesHtml(
  "Overnight Policy Rate (OPR) 7.75 Statutory Reserve Ratio (SRR) 2.00",
);
assert.ok(textOnly);
assert.equal(textOnly.opr, 7.75);
assert.equal(textOnly.srr, 2);

const seed = getCbslPolicyRatesSeedSnapshot();
assert.equal(seed.sourceId, CBSL_POLICY_RATES_SOURCE_ID);
assert.equal(seed.opr, 8.75);
assert.equal(seed.sdfr, 8.25);
assert.equal(seed.slfr, 9.25);
assert.equal(seed.srr, 2);
assert.equal(seed.asOf, "2026-05-26");
assert.equal(seed.effectiveDate, "2026-05-26");
assert.equal(seed.isSeed, true);
assert.equal(seed.oprIsLive, false);
assert.equal(seed.corridorIsSeed, true);
assert.match(seed.boardUrl, /plrates\.php/);
assert.match(seed.note, /OPR/i);
assert.match(seed.note, /corridor/i);

console.log("cbsl-policy-rates.test.ts: ok");
