# CBSL Payments Bulletin — quarterly seed

**Status:** Shipped (seed strip) — Jul 2026  
**Surface:** `/economy` `PaymentsBulletinStrip` + `/sources/cbsl_payments_bulletin`  
**Cadence:** Quarterly (stale-OK seed; not a live scrape)

---

## Verdict

| Question | Answer |
|----------|--------|
| Public HTML stats table? | **No** — listing page only (year filter + PDF links). |
| Public JSON/CSV API? | **No.** |
| Usable quarterly PDF? | **Yes** — English-only Payments Bulletin series. |
| Stable index URL? | https://www.cbsl.gov.lk/en/publications/other-publications/statistical-publications/payments-bulletin |
| Tip PDF (probe)? | https://www.cbsl.gov.lk/sites/default/files/Payments_Bulletin_4Q2025_e.pdf (4Q 2025; published 21 May 2026) |
| Park? | **No** — good URL; ship curated seed + honesty strip. |

**Bottom line:** CBSL publishes a **quarterly** payments & settlement systems bulletin as PDF. Lankawa seeds CEFTS / JustPay / LANKAQR headlines from the tip PDF. Manual refresh each release is enough year-1; optional PDF canary later.

---

## Source facts

- Publisher: Central Bank of Sri Lanka — Payments and Settlements Department  
- Series tables credit **LankaPay (Pvt) Ltd** for retail rails (CEFTS, JustPay, LANKAQR).  
- Filename pattern: `Payments_Bulletin_{n}Q{YYYY}_e.pdf` under `/sites/default/files/`.  
- Prefer bulletin tables over [lankapay.net](https://www.lankapay.net) marketing counters (can lag or disagree).  
- Adjacent research: `docs/LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md`.

### Seed tip extract (4Q 2025)

| Rail | Metric | Value |
|------|--------|-------|
| CEFTS | Volume (Q4) | 71,411 thousand txns |
| CEFTS | Value (Q4) | Rs. 6,417 billion |
| JustPay | Volume (Q4) | 7,269 thousand txns |
| JustPay | Value (Q4) | Rs. 38 billion |
| LANKAQR domestic | Volume / value (Q4) | 266 thousand / Rs. 1,330 million |
| LANKAQR | Merchants registered (end period) | 460,990 |

Tables: 18 (CEFTS), 21 (JustPay), 22–24 (LANKAQR).

---

## Lankawa wiring

| Artifact | Path |
|----------|------|
| Seed JSON | `src/data/cbsl-payments-bulletin-seed.json` |
| Loader | `src/lib/payments-bulletin.ts` → `getPaymentsBulletinSnapshot()` |
| UI | `src/components/PaymentsBulletinStrip.tsx` on `/economy` |
| Provenance | `SOURCES` id `cbsl_payments_bulletin`, `cadenceMinutes: 129600` (~90 days), `adapter: "seed"` |

Honesty copy states quarterly seed, not a live payment-rails dashboard. Merchant count = registered QR stickers, not active monthly usage.

---

## Not in scope

- Live CEFTS/JustPay/LANKAQR APIs (none public)  
- Merchant map / deals from LankaPay  
- Passport / courts civic strips (parked elsewhere in card-civic polish plan)  
- In-process PDF parser (manual seed refresh until a canary is justified)
