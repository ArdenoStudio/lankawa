/**
 * HARTI / CBSL civic food-price surfaces (PDF indexes only).
 *
 * Probed 2026-07-20: HTML tables are Date/Medium/Download lists — no commodity
 * price cells. Prices live inside dated PDFs. FoodLK already parses both.
 *
 * Interim fallthrough (Jul 2026): lanka-price-monitor republishes CBSL Daily
 * Price Report as JSON — see `food-price-monitor.ts` (wired after FoodLK fails).
 * This stub remains a no-op PDF-index adapter so we never invent HTML prices.
 *
 * See docs/HARTI_CBSL_FOOD_PDF.md and docs/EXTERNAL_REPOS_ASSESSMENT.md.
 */

/** HARTI daily English PDF catalog (not a price API). */
export const HARTI_DAILY_INDEX_URL = "https://www.harti.gov.lk/daily-price.php";

/** HARTI weekly Eng/Sin bulletin catalog. */
export const HARTI_WEEKLY_INDEX_URL = "https://www.harti.gov.lk/weekly-price.php";

/** CBSL Daily Price Report listing (PDF hrefs under statistics/pricerpt/). */
export const CBSL_PRICE_REPORT_INDEX_URL =
  "https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report";

/**
 * Seed / honesty note for UI or ops — not a live snapshot.
 * Prefer FoodLK official market sync over in-process PDF parsing.
 */
export const HARTI_CBSL_SEED_NOTE =
  "HARTI and CBSL publish daily/weekly food-price PDFs (civic markets). " +
  "Index HTML has no price tables. Lankawa does not parse those PDFs in-process; " +
  "prefer FoodLK market sync when healthy, else lanka-price-monitor CBSL JSON " +
  "(`cbsl_price_monitor`), then WFP/SPAR/Life/seed.";

/**
 * Intentional no-op: no trivial HTML price table to scrape.
 * Returns null so the food chain never stamps HARTI/CBSL live from this adapter.
 */
export async function fetchHartiCbslFoodDirect(): Promise<null> {
  return null;
}
