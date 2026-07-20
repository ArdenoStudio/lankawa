import assert from "node:assert/strict";
import {
  getBankDepositRatesSeedSnapshot,
  getCompareMatrix,
  parseCombankFd,
  parseHnbInterestRates,
  parseSampathEffectiveFrom,
  parseSampathFd,
  parseSeylanFd,
} from "./bank-deposit-rates";

const COMBANK_FIXTURE = [
  { paidIn: "monthly", period: "3", rate: "9.00" },
  { paidIn: "monthly", period: "6", rate: "9.75" },
  { paidIn: "maturity", period: "12", rate: "10.00" },
  { paidIn: "maturity", period: "24", rate: "11.00" },
  { paidIn: "maturity", period: "36", rate: "11.50" },
  { paidIn: "maturity", period: "60", rate: "12.50" },
  { paidIn: "annually", period: "60", rate: "10.20" },
];

const SAMPATH_FIXTURE = {
  local: {
    term_and_deposite: [
      {
        productHead: "Normal Fixed Deposit",
        withEfectFrom: "Wednesday, June 10 2026",
        productOrder: "200",
        comment: "",
        rateCode: "FDNOR",
        slabAmount: [
          {
            Period: "3",
            PeriodType: "M",
            RateMat: "8.5",
            AerMat: "8.77",
            RateMon: "",
            AerMon: "",
          },
          {
            Period: "6",
            PeriodType: "M",
            RateMat: "9.5",
            AerMat: "9.73",
            RateMon: "",
            AerMon: "",
          },
          {
            Period: "12",
            PeriodType: "M",
            RateMat: "9.5",
            AerMat: "9.5",
            RateMon: "9.1",
            AerMon: "9.49",
          },
          {
            Period: "24",
            PeriodType: "M",
            RateMat: "11.25",
            AerMat: "10.68",
            RateMon: "10.1",
            AerMon: "10.6",
          },
          {
            Period: "36",
            PeriodType: "M",
            RateMat: "11",
            AerMat: "9.97",
            RateMon: "9.5",
            AerMon: "9.95",
          },
          {
            Period: "60",
            PeriodType: "M",
            RateMat: "12.5",
            AerMat: "10.2",
            RateMon: "9.5",
            AerMon: "9.96",
          },
          {
            Period: "90",
            PeriodType: "D",
            RateMat: "8.25",
            AerMat: "",
            RateMon: "",
            AerMon: "",
          },
        ],
      },
      {
        productHead: "Senior Citizen Fixed Deposit",
        withEfectFrom: "Wednesday, June 10 2026",
        rateCode: "FDSAN",
        slabAmount: [
          {
            Period: "12",
            PeriodType: "M",
            RateMat: "10.0",
            AerMat: "10.0",
            RateMon: "9.5",
            AerMon: "",
          },
        ],
      },
    ],
  },
  foreign: {},
};

const SEYLAN_FIXTURE = {
  "senior-below": [
    {
      type: "Maturity",
      stValue: 1,
      endValue: 60,
      interest: [
        { month: 3, interest: 8.5 },
        { month: 6, interest: 8.75 },
        { month: 12, interest: 9 },
        { month: 24, interest: 11 },
        { month: 36, interest: 11 },
        { month: 60, interest: 12.5 },
      ],
    },
    {
      type: "Monthly",
      stValue: 12,
      endValue: 60,
      interest: [
        { month: 12, interest: 8.5 },
        { month: 24, interest: 9.5 },
      ],
    },
  ],
  "senior-above": [
    {
      type: "Maturity",
      stValue: 1,
      endValue: 48,
      interest: [
        { month: 12, interest: 9.5 },
        { month: 60, interest: 13 },
      ],
    },
    {
      type: "Monthly",
      stValue: 12,
      endValue: 60,
      interest: [
        { month: 1, interest: 0 },
        { month: 12, interest: 9 },
      ],
    },
  ],
};

const HNB_FIXTURE = {
  status: 200,
  msg: "Success",
  data: [
    {
      id: 1,
      name: "Savings",
      interest_rate_sub_category: [
        {
          id: 102,
          name: "Fixed Deposits",
          order: 6,
          sub_category_division_approved: [
            {
              title: "Fixed Deposits Interest Rates",
              last_reviewed_on: "2026-07-18",
              table_data_approved: [
                {
                  id: 2092,
                  data: JSON.stringify({
                    columns: [
                      "Period",
                      "Monthly",
                      "Quarterly",
                      "Semi Annually",
                      "Annually",
                      "Maturity",
                      "Annual Effective Rate",
                    ],
                    rows: [
                      ["3 Months", "-", "-", "-", "-", "9.00%", "9.31%"],
                      ["6 Months", "-", "-", "-", "-", "9.75%", "9.99%"],
                      ["12 Months", "9.55%", "-", "-", "-", "10.00%", "10.00%"],
                      [
                        "24 Months",
                        "10.20%",
                        "-",
                        "-",
                        "10.70%",
                        "11.25%",
                        "10.70%",
                      ],
                      [
                        "36 Months",
                        "9.55%",
                        "-",
                        "9.75%",
                        "9.95%",
                        "11.00%",
                        "9.95%",
                      ],
                      [
                        "60 Months",
                        "10.05%",
                        "10.15%",
                        "10.25%",
                        "10.55%",
                        "13.00%",
                        "10.55%",
                      ],
                    ],
                  }),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

{
  const quotes = parseCombankFd(COMBANK_FIXTURE);
  assert.ok(quotes.length >= 6);
  const m12 = quotes.find(
    (q) => q.tenorMonths === 12 && q.paidIn === "maturity",
  );
  assert.ok(m12);
  assert.equal(m12.bankId, "combank");
  assert.equal(m12.ratePa, 10);
  assert.equal(m12.productCode, "standard-fd");
  assert.ok(quotes.some((q) => q.paidIn === "monthly" && q.tenorMonths === 3));
  assert.equal(parseCombankFd([]).length, 0);
  assert.equal(parseCombankFd(null).length, 0);
}

{
  assert.equal(
    parseSampathEffectiveFrom("Wednesday, June 10 2026"),
    "2026-06-10",
  );
  const quotes = parseSampathFd(SAMPATH_FIXTURE);
  assert.ok(quotes.every((q) => q.productCode === "FDNOR"));
  assert.ok(!quotes.some((q) => q.productCode === "FDSAN"));

  const m12 = quotes.find(
    (q) => q.tenorMonths === 12 && q.paidIn === "maturity",
  );
  assert.ok(m12);
  assert.equal(m12.ratePa, 9.5);
  assert.equal(m12.aerPa, 9.5);
  assert.equal(m12.effectiveFrom, "2026-06-10");

  const mon12 = quotes.find(
    (q) => q.tenorMonths === 12 && q.paidIn === "monthly",
  );
  assert.ok(mon12);
  assert.equal(mon12.ratePa, 9.1);

  for (const tenor of [3, 6, 12, 24, 36, 60]) {
    assert.ok(
      quotes.some((q) => q.tenorMonths === tenor && q.paidIn === "maturity"),
      `FDNOR maturity ${tenor}M`,
    );
  }
  // Day promo slabs (PeriodType D) are skipped for the FDNOR month strip.
  // Empty RateMon on 3M should not emit monthly.
  assert.ok(
    !quotes.some((q) => q.tenorMonths === 3 && q.paidIn === "monthly"),
  );
  assert.equal(parseSampathFd({}).length, 0);
}

{
  const quotes = parseSeylanFd(SEYLAN_FIXTURE);
  const below12 = quotes.find(
    (q) =>
      q.productCode === "senior-below" &&
      q.tenorMonths === 12 &&
      q.paidIn === "maturity",
  );
  assert.ok(below12);
  assert.equal(below12.ratePa, 9);
  assert.equal(below12.seniorCitizen, false);

  const senior12 = quotes.find(
    (q) =>
      q.productCode === "senior-above" &&
      q.tenorMonths === 12 &&
      q.paidIn === "maturity",
  );
  assert.ok(senior12);
  assert.equal(senior12.ratePa, 9.5);
  assert.equal(senior12.seniorCitizen, true);

  // Zero placeholder monthly rates skipped.
  assert.ok(
    !quotes.some(
      (q) =>
        q.productCode === "senior-above" &&
        q.tenorMonths === 1 &&
        q.paidIn === "monthly",
    ),
  );
  assert.ok(
    quotes.some(
      (q) =>
        q.productCode === "senior-below" &&
        q.paidIn === "monthly" &&
        q.tenorMonths === 12,
    ),
  );
  assert.equal(parseSeylanFd([]).length, 0);
}

{
  const quotes = parseHnbInterestRates(HNB_FIXTURE);
  assert.ok(quotes.length > 0);
  const m12 = quotes.find(
    (q) =>
      q.productCode === "fixed-deposits-interest-rates" &&
      q.tenorMonths === 12 &&
      q.paidIn === "maturity",
  );
  assert.ok(m12);
  assert.equal(m12.ratePa, 10);
  assert.equal(m12.aerPa, 10);
  assert.equal(m12.effectiveFrom, "2026-07-18");

  const m60 = quotes.find(
    (q) => q.tenorMonths === 60 && q.paidIn === "maturity",
  );
  assert.ok(m60);
  assert.equal(m60.ratePa, 13);

  assert.ok(
    quotes.some((q) => q.tenorMonths === 12 && q.paidIn === "monthly"),
  );
  assert.ok(
    quotes.some((q) => q.tenorMonths === 36 && q.paidIn === "semi_annually"),
  );
  // Dash cells skipped.
  assert.ok(
    !quotes.some((q) => q.tenorMonths === 3 && q.paidIn === "monthly"),
  );
  assert.equal(parseHnbInterestRates({ status: 200, data: [] }).length, 0);
}

{
  const seed = getBankDepositRatesSeedSnapshot();
  assert.equal(seed.isSeed, true);
  assert.equal(seed.sourceId, "bank_deposit_rates");
  assert.equal(seed.liveCount, 0);
  assert.equal(seed.seedCount, 4);
  assert.ok(seed.banks.every((b) => b.isSeed));
  assert.ok(seed.quotes.some((q) => q.bankId === "combank"));
  assert.ok(seed.quotes.some((q) => q.bankId === "sampath"));
  assert.ok(seed.quotes.some((q) => q.bankId === "seylan"));
  assert.ok(seed.quotes.some((q) => q.bankId === "hnb"));

  const matrix = getCompareMatrix(seed);
  assert.equal(matrix.length, 6);
  assert.deepEqual(
    matrix.map((r) => r.tenorMonths),
    [3, 6, 12, 24, 36, 60],
  );

  const row12 = matrix.find((r) => r.tenorMonths === 12);
  assert.ok(row12);
  assert.equal(row12.rates.combank, 10);
  assert.equal(row12.rates.sampath, 9.5);
  assert.equal(row12.rates.seylan, 9);
  assert.equal(row12.rates.hnb, 10);
  // ComBank and HNB both 10 — first max wins (combank before hnb in iteration).
  assert.ok(row12.bestBankId === "combank" || row12.bestBankId === "hnb");

  const row60 = matrix.find((r) => r.tenorMonths === 60);
  assert.ok(row60);
  assert.equal(row60.rates.hnb, 13);
  assert.equal(row60.bestBankId, "hnb");

  // ComBank has no 3M maturity in seed.
  const row3 = matrix.find((r) => r.tenorMonths === 3);
  assert.ok(row3);
  assert.equal(row3.rates.combank, null);
  assert.ok(row3.rates.hnb != null);
}

console.log("bank-deposit-rates.test.ts: ok");
