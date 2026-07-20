# Sri Lanka telco prepaid/postpaid packs — research (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Operators:** Dialog, SLT-Mobitel, Airtel (Dialog-licensed brand), Hutch  
**Product rule:** Public marketing + TRC tariff pages only. No authenticated self-care apps, no APK MITM, no balance/activation APIs. Server-side fetch + provenance; never claim live when empty/stale.

---

## Verdict

| Question | Answer |
|----------|--------|
| Public pack-catalog JSON API (any operator)? | **Almost none.** Hutch WordPress `wp-json` returns page HTML-in-JSON; Airtel `wp-json` is blocked; Dialog `jsonapi` 404; Mobitel DataMart is SSR HTML (no XHR catalog). |
| Best ingest path | **HTML scrape** of a shortlist of marketing pages + optional **TRC tariff PDF** index for provenance/expiry. |
| Developer / Open Gateway / Ideamart APIs? | **Noise** for consumer morning surface (OTP, location, carrier billing, SMS) — not retail pack lists. |
| Fit for Lankawa morning check | **Thin COL / household signal only** — not a plan marketplace. One compare chip or COL basket proxy beats listing dozens of Blaster/TikTok/Night variants. |

**Bottom line:** Useful = a curated **anytime GB / 30-day price** reference (and TRC expiry). Noise = full promo catalogs, app-only builders, reload raffles, and operator developer platforms.

---

## Domains & surfaces

| Host / path | Operator | Role | Scrape? |
|-------------|----------|------|---------|
| `https://dialog.lk/mobile/prepaid/plans` | Dialog | Mobile prepaid (Ultra, Unlimited Blaster, Call Blaster, CCTV…) | **Primary Dialog mobile** |
| `https://dialog.lk/mobile-broadband/prepaid/plan` | Dialog | MBB Fun Blaster / Anytime / Work & Learn / Unlimited | Secondary (MBB skew) |
| `https://dialog.lk/mobile-broadband/prepaid/dialog-ultra` | Dialog | Ultra detail + TRC code | Detail |
| `https://www.datamart.lk/home/prePkg` | Mobitel | Prepaid pack accordion (price / validity / data / voice) | **Primary Mobitel** |
| `https://www.mobitel.lk/voice-and-data-plans` | Mobitel | Marketing combo plans | Secondary |
| `https://www.mobitel.lk/prepaid-0` | Mobitel | USSD/SMS how-to index | Weak (activation noise) |
| `https://www.airtel.lk/new-youth-packs/` | Airtel | Current prepaid Youth packs | **Primary Airtel** |
| `https://www.airtel.lk/category/prepaid-freedom-packs/` | Airtel | Legacy Freedom (SIM ≤ 2024-08-29) | Skip or footnote |
| `https://recharge.airtel.lk/` | Airtel | Reload portal | Activation only — skip |
| `https://hutch.lk/any-time-plans/` | Hutch | Anytime quota ladder | **Primary Hutch data** |
| `https://hutch.lk/hutch-15/` | Hutch | Flagship social+anytime bundle | Secondary |
| `https://hutch.lk/unlimited/` | Hutch | Night unlimited add-ons | Niche |
| `https://hutch.lk/my-plan/` | Hutch | App-only custom packs | Skip for ingest |
| `https://hutch.lk/wp-json/wp/v2/pages?slug=…` | Hutch | Page JSON (`content.rendered` = Elementor HTML) | Optional fetch wrapper |
| `https://www.trc.gov.lk/economic/pages_e.php?id=76` | TRC | Dialog approved tariffs + PDF links | **Provenance** |
| `…/pages_e.php?id=78` | TRC | Mobitel tariffs | Provenance |
| `…/pages_t.php?id=77` | TRC | Hutch tariffs | Provenance |
| `https://developer.mobitel.lk/…` | Mobitel | SMS / subscription / charging APIs | **Out of scope** |
| Ideamart / GSMA Open Gateway | All four | OTP, Device Location, Carrier Billing | **Out of scope** |

`dialog.lk` sits behind Imperva; use a descriptive UA, low cadence, and backoff. Same compliance bar as `FOOD_API_SOURCES.md` / ComBank research.

---

## APIs / JSON reality check

| Endpoint / surface | Result (Jul 2026) | Lankawa use |
|--------------------|-------------------|-------------|
| Hutch `GET /wp-json/wp/v2/pages?slug=any-time-plans` | **200** — `{ title, modified, content.rendered }` | Fetch wrapper; still parse HTML inside `content` |
| Hutch `…?slug=hutch-15` | **200** — large Elementor HTML (~180KB content) | Same |
| Airtel `GET /wp-json/` | **301 → tst.airtel.lk/404** | Dead for public REST |
| Dialog `GET /jsonapi` | **404** | No Drupal JSON:API for packs |
| Dialog page HTML | Drupal 9 + Commerce headers; packs in SSR HTML; no `ld+json` Product | HTML scrape |
| Dialog chatbot `api/dialog-chatbot` | Present in page scripts | Ignore |
| Mobitel DataMart `/home/prePkg` | SSR accordion; fields `Plan Price`, `Validity`, `Data Offer`, `Voice Offer` | Best Mobitel structure |
| Mobitel DataMart XHR catalog | None found (`packageList` / SPA payloads absent) | N/A |
| Mobitel developer Subscription / CaaS | Auth client-id APIs for carrier billing | Noise |
| Deprecated `dialog-data-usage` npm | Patched years ago | Do not revive |
| GSMA Open Gateway (all operators) | OTP / location / billing | Noise for morning COL |

---

## Pack catalogs — what’s live on public pages

### Dialog (mobile prepaid)

Page: `/mobile/prepaid/plans` (~250KB HTML). Named families observed:

| Family | Example prices (incl. tax, from HTML) | Notes |
|--------|----------------------------------------|-------|
| Dialog Ultra | 1495 → 25GB; 1895 → 40GB; 2595 → 75GB; 2995 → 100GB; 3999 → 200GB | Unlimited calls + 1000 SMS; 30-day; TRC promo window on Ultra page cited `TRC/D/PRO/25/07` (06.01.2026–05.07.2026) — **verify still active** |
| Unlimited Blaster | 999 / 1249 / 1599 | Social “unlimited” @ SD + limited anytime GB |
| Call Blaster | 198 / 298 / 508 / 667 | Voice-led |
| CCTV Plans | 1496–4996 | Machine/IoT — **exclude from consumer morning** |

MBB page adds Fun Blaster / Anytime (159–3995) / Work & Learn — useful only if Lankawa wants a **broadband** row later.

### Mobitel

**DataMart** (`datamart.lk/home/prePkg`) is the scrapeable catalog. Accordion detail shape:

```html
<b>Plan Price : </b>Rs.1598</br>
<b>Validity : </b>30 days</br>
<b>Data Offer : </b> Non-Stop Data for 9 Apps … + 40GB Extra Anytime Data </br>
<b>Voice Offer  : </b>Unlimited Any Net Call + 1000SMS
```

Headline combos seen: Mobitel 1598 (40GB anytime + nonstop apps), 1278, 368, YouTube/Facebook/Social combos, Anytime Rollover 1199, Aviator / TikTok HD SKUs, daily sachets (Rs.36…).  
`mobitel.lk/prepaid-internet-plans` returned thin HTML (little price signal); prefer DataMart.

Online reload GB/cashback pages are **channel promotions** (bank-specific, dated windows) — not a stable morning metric.

### Airtel

Brand licensed to Dialog Axiata. Canonical prepaid: **New Youth Packs** (`/new-youth-packs/`). HTML prices include 1188 (12GB + unlimited any-net), 399 / 498 / 988 / … plus TikTok-tagged SKUs. Freedom Packs are **legacy-eligible only** (SIM on/before 29 Aug 2024) — do not treat as universal price.

### Hutch

| Page | Signal |
|------|--------|
| Anytime plans | Clear ladder: 1GB/7d Rs.79 → 2GB/14d Rs.159 → 4–21GB / 30d (Rs.285–1,228). TRC code on page `TRC/H/PRO/24/03`. |
| Hutch 15 | Flagship Rs.399 / 1099 / 1199 — nonstop apps + anytime GB + freeload marketing |
| Unlimited nights | Rs.62 / 117 / 236 — night window only |
| My Plan | App-exclusive builder — **out of scope** |
| Hutch 2X (`/2x/`) | Home+mobile bundle — niche for morning mobile chip |

WP JSON `modified` stamps (e.g. anytime-plans `2026-03-12`, hutch-15 `2026-04-30`) are useful freshness hints.

---

## TRC approved tariffs (provenance layer)

TRC publishes per-operator tables with **reference numbers, commence/expiry, PDF attachments**.

Dialog index (`pages_e.php?id=76`): dozens of refs; 2026 folder PDFs include e.g.:

- `TRC/D/PER/25/04` — New Mobile Prepaid Plans (tables: first-reload packs, social/all-in-one C–H with prices 109–1188, voice/data add-ons)
- `TRC/D/PER/25/03`, `25/05`, `24/07` — data / bundled plans
- `TRC/D/PRO/25/07` — promotional bundled prepaid (time-bounded)

Hutch index shows active/recent: Hutch 2X `TRC/H/PRO/26/01` (08.04.2026–07.10.2026), Hutch 15 `TRC/H/PRO/25/02` (to 23.05.2026), Anytime / Unlimited Night as PER long-term, etc.

**Use TRC for:** legal price floor/ceiling tables, promo **expiry dates**, citation links.  
**Do not use TRC alone for:** daily UX — PDFs lag marketing copy, parsing is brittle, indexes mix long-term + expired rows.

---

## Useful vs noise for Lankawa morning surface

Lankawa’s habit is **one morning composition** (FX, fuel, weather/hazard, district pin, honest news) — see `PLATFORM_FEATURES_MASTER_PLAN.md`. Telco packs fit only as a **household money** footnote, analogous to `HouseholdEnergySection` (fuel / LPG / electricity slabs), not as a Today-grid hero.

### Useful (keep small)

| Signal | Why | Suggested shape |
|--------|-----|-----------------|
| **30-day anytime GB ladder** (1–3 SKUs per operator) | Comparable household cost; survives social-media marketing fog | Seed + weekly scrape → `lkr_per_gb` or “~Rs.X for ~10GB / 30d” |
| **One flagship combo price** (Ultra / Mobitel 1598 / Youth 1188 / Hutch 15) | What people actually reload monthly | Compare strip on `/cost-of-living` or Services depth — **not** home hero |
| **TRC promo expiry** | Stops showing dead Ultra/Blaster windows as live | `validUntil` from TRC row or page footnote |
| **Tax-inclusive prices** | All four market “incl. tax” on consumer pages | Store `priceLkrInclTax` |

### Noise (park / never ship on morning home)

| Signal | Why noise |
|--------|-----------|
| Full Fun/Video/TikTok/Netflix/CCTV catalogs | Dozens of SKUs; app-gated; SD-quality “unlimited” incomparable |
| Night-only / time-based unlimited | Niche; confuses “anytime” COL |
| Work & Learn / Zoom-only | Niche |
| Call-only Blasters | Voice ≠ data household proxy |
| Freedom Pack eligibility matrix | Cohort-specific |
| My Plan / app customizers | Not public-stable |
| Reload raffles, bank GB cashback, Cheer Points | Campaign clutter |
| USSD/SMS activation recipes | Not a Lankawa job |
| Open Gateway / Ideamart / Mobitel CaaS / Hutch BSMS | Developer platforms |
| Personal balance / usage APIs | Auth + deprecated; privacy |

---

## Recommended ingest (if/when wired)

Same spirit as `COMBANK_OFFERS_RESEARCH.md`:

1. **Weekly cron** (packs change slowly; TRC promos are multi-month).  
2. Fetch shortlist pages → normalize to:

```ts
type TelcoPackRow = {
  operator: "dialog" | "mobitel" | "airtel" | "hutch";
  sku: string;                 // "dialog-ultra-1495" | "hutch-anytime-10.5"
  title: string;
  priceLkrInclTax: number;
  anytimeGb: number | null;    // null if social-only / night-only
  validityDays: number | null;
  category: "anytime" | "combo" | "social" | "night" | "other";
  trcRef: string | null;
  validUntil: string | null;   // ISO from TRC or page
  sourceUrl: string;
  fetchedAt: string;
  provenance: "operator_html" | "hutch_wp_json" | "trc_pdf";
};
```

3. **Morning product:** at most one chip — e.g. median or cheapest **anytime ≥5GB / ≥28 days** across operators — with link to methodology /sources.  
4. **COL (optional later):** tiny weight in composite alongside fuel/food — only if `anytimeGb` rows are stable for 2+ scrape cycles.  
5. Seed fallback mandatory; Imperva/403 → show seed + stale badge.

### Ops / compliance

- UA: `LankawaBot/1.0 (+https://…; research)`  
- Rate: ≤1 page/sec; prefer Hutch wp-json + 4–6 HTML pages total  
- Honesty: if TRC promo expiry passed, demote Ultra-class rows even if marketing HTML still lists them  
- No app reverse-engineering

---

## Sister-style catalog entry (when wired)

| Source | URL / endpoint | API? | Lankawa path |
|--------|----------------|------|--------------|
| Dialog prepaid HTML | `/mobile/prepaid/plans` (+ Ultra detail) | HTML | Planned `telco-packs.ts` |
| Mobitel DataMart | `/home/prePkg` | HTML accordion | Same |
| Airtel Youth Packs | `/new-youth-packs/` | HTML | Same |
| Hutch Anytime (+ optional 15) | pages + `wp-json` | WP JSON wraps HTML | Same |
| TRC tariff indexes | `pages_e.php?id=76/78`, Hutch `id=77` + PDFs | HTML + PDF | Provenance / expiry |

---

## Open risks

1. **Marketing ≠ comparable** — “unlimited social @ 360p” is not anytime GB; normalize carefully.  
2. **Promo windows expire** while pages stay up — TRC dates are the honesty layer.  
3. **Imperva / WAF** on Dialog & DataMart — scrapes can flake; seed required.  
4. **Airtel = Dialog brand** — avoid double-counting if COL uses both.  
5. **Mobitel marketing site 403s** on some plan URLs — DataMart is the reliable surface.  
6. **Hutch wp-json content is Elementor soup** — JSON does not remove HTML parsing.  
7. **No public retail JSON** — do not wait for an official packs API.

---

## Agent note

Researched Jul 2026 against live operator sites (Dialog Drupal HTML, Mobitel DataMart accordion, Airtel Youth Packs HTML, Hutch pages + `wp-json`), TRC Dialog tariff index + sample PDF `TRC/D/PER/25/04`, and public docs for Mobitel developer / Open Gateway APIs. Medium thoroughness: no authenticated MyDialog / Self-Care / Hutch app sessions, no APK traffic capture.
