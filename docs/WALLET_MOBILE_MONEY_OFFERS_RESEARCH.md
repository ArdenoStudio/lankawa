# FriMi · Dialog eZ Cash / Dialog Pay · Mobitel mCash — promotions, APIs, merchant cashback (Lankawa)

**Status:** Research (medium thoroughness), Jul 2026  
**Product rule:** Public marketing surfaces only. No APK MITM, authenticated wallet apps, or private MID credentials. Payment-acceptance APIs are **merchant integration**, not Lankawa data feeds — document and skip for ingest.

Related: [`LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md`](./LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md), [`TELCO_PACKS_RESEARCH.md`](./TELCO_PACKS_RESEARCH.md), [`COMBANK_OFFERS_RESEARCH.md`](./COMBANK_OFFERS_RESEARCH.md), [`CARD_OFFER_AGGREGATORS_RESEARCH.md`](./CARD_OFFER_AGGREGATORS_RESEARCH.md), [`FUEL_LOYALTY_OFFERS_RESEARCH.md`](./FUEL_LOYALTY_OFFERS_RESEARCH.md).

---

## Verdict

| Wallet | Operator | Public promo catalog? | Public promo API? | Merchant payment API? | Merchant cashback feed? | Lankawa fit |
|--------|----------|----------------------|-------------------|----------------------|-------------------------|-------------|
| **FriMi** | Nations Trust Bank | **Weak** — `/offers` empty Jul 2026; real copy on `/blog` + `/blog-post/*` | **No** | **Gated** Payment Acceptance API (`api.frimi.lk` / `uat.frimi.lk`) — merchant credentials | Historical LANKAQR merchant cashback (2023 blog); recent promos are **JustPay top-up raffles**, not % merchant cashback | **P2** blog HTML scrape if wallet strip expands; not morning-critical |
| **eZ Cash** (wallet) + **Dialog Pay** (app / Genie rebrand) | Dialog Axiata / Dialog Finance | **Strong on Dialog Pay** — `genie.lk/promotions/{slug}` (~237 detail pages). `ezcash.lk` itself is a thin product site with **no** offers index | **Partial** — WP REST lists pages (titles/slugs/dates); **body HTML is empty in JSON**; scrape HTML for T&Cs | eZ Cash **IPG** (encrypted form POST) — merchant keys; not a catalog API | Cashback / bonus-reload / highway / utility promos are **Dialog Finance SMART / Genie / eZ Cash channel** campaigns on `genie.lk`, plus Dialog Pay **1GB/txn free data** on `dialog.lk/dialog-pay` | **P1** among wallets — best structured public surface; pairs with telco reload context |
| **mCash** | SLT-Mobitel | **Hub page** `mobitel.lk/mcash` + scattered promo nodes; several cashback pages are **expired** (e.g. railway LANKAQR to **31 Dec 2022**) | **No** | **Gated** IPG (`ipg.mobitel.lk/mcash/…` historically; OpenCart plugins); LANKAQR acceptance is B2B onboarding | Past % cashback (bills/reloads/utilities/railway) on Drupal nodes — **verify validity**; merchant list is a **static PDF**, not cashback | **P2** — utility/bill cashback only when T&Cs still in force; do not treat stale FAQ as live |

**False friend:** `dev.mca.sh` “mCASH Merchant API” is **Norwegian mCASH**, not Mobitel Sri Lanka. Ignore for Lankawa.

**Household value:** Bank card supermarket days remain the primary “payment discount” strip. Wallets add (1) **Dialog Pay / Genie channel promos** (reload bonus, occasional utility/highway cashback), (2) **Dialog Pay free-data on QR**, (3) episodic FriMi JustPay competitions. None replace ComBank/NTB-style card catalogs.

---

## Landscape (who is what)

| Brand | What it is | Consumer surface | Merchant surface |
|-------|------------|------------------|------------------|
| **FriMi** | NTB digital bank / wallet + debit Mastercard; LANKAQR pay + My QR accept | `frimi.lk` (offers/blog/FAQs); app `com.nationstrust.frimi` | Merchant app / POS / **Payment Acceptance API**; My QR for any LANKAQR app |
| **eZ Cash** | CBSL-licensed mobile money (Dialog); Classic / Power wallets; `#111#` | `ezcash.lk` (legacy marketing); channels: Dialog Pay app, MyDialog, USSD | Merchant pay + **Internet Payment Gateway** (keys after signup) |
| **Dialog Pay** | Unified payments UX (Genie rebrand); funds from eZ Cash, JustPay bank link, or Dialog Finance savings | `dialog.lk/dialog-pay`, `genie.lk` (still live branding “Pay by Dialog Pay”) | Dialog Pay Business (ex Genie Business) — Instant Merchant QR; B2B onboarding |
| **mCash** | CBSL-licensed mobile money (Mobitel); Basic / Enhanced; `#111#` + app | `mobitel.lk/mcash` | LANKAQR acceptance, biller platform, IPG, agency banking; merchant PDFs |

Cross-rail: all three participate in **LANKAQR** / often **JustPay** top-up — see LankaPay research for national stats, not deals.

---

## 1. FriMi (Nations Trust Bank)

### Promotions pages

| URL | Role | Probe (2026-07-20) |
|-----|------|-------------------|
| `https://www.frimi.lk/offers` | Named offers hub | **200**, hero only — **no offer cards** in HTML |
| `https://www.frimi.lk/blog` | Promo / product posts | **200**; recent posts are competitions / thrift / JustPay |
| `https://www.frimi.lk/blog-post/{slug}` | Detail + T&Cs | HTML SSR; tables on older merchant-offers post |
| `https://www.frimi.lk/sitemap.xml` | Discovery | Hub URLs only (stale `lastmod` 2024-03-20); **no** per-post URLs |
| `https://www.frimi.lk/robots.txt` | Crawl policy | Disallows `/cgi-bin/`, `/images/` only |

**Recent / sample posts (not a complete index):**

| Slug | Theme | Window (from page) |
|------|-------|--------------------|
| `avurudu-rewarding-with-nations-nova` | JustPay add ≥ Rs.150k + 3 bill/QR pays → Thyaga prize draw | **10–24 Apr 2026** |
| `valentines-frimi-justpay` | JustPay add ≥ Rs.50k + 3 bill pays → dinner draw | **20 Jan–8 Feb 2026** |
| `thrift-and-win-competition` | Use ≥3 thrift features | **10–31 Oct 2025** |
| `frimi-justpay-ganudenu-promo` | JustPay add + 3 txn types → PickMe vouchers | **Apr 2025** |
| `merchant-offers` | **10% cashback** on first Rs.1,000 LANKAQR at listed FriMi merchants (≤3 txns); debit card / linked cards excluded | **24 Jul–31 Oct 2023** — **expired**; pattern for merchant cashback, not live |

Pattern: 2025–2026 FriMi web promos skew **raffle / JustPay funding**, not ongoing merchant % cashback. Merchant cashback, when it appears, is LANKAQR-from-FriMi-balance only.

### APIs

| Surface | Public? | Notes |
|---------|---------|-------|
| FriMi Payment Acceptance API | **Merchant-gated** | Marketing: `frimi.lk/frimi-for-business`. Community reports: prod `https://api.frimi.lk/api`, UAT `https://uat.frimi.lk/api`; QR TTL minutes; callback URL; no public offers endpoint. Hosts did not answer from this environment (timeout / no route). |
| NTB Open API Banking | **Developer portal, gated** | Historical press: FriMi at Keells POS via NTB APIs. Not a public promo catalog. Portal hosts unreachable here. |
| `frimi.lk/wp-json`, `/api` | **No useful JSON** | `/api` returns site HTML; not a REST catalog |

### Merchant cashback

- **Consumer:** Occasional campaign pages (blog); eligibility usually **FriMi wallet LANKAQR scan**, not FriMi debit / foreign linked cards.
- **Merchant-side “cashback tool” API:** **None** public — merchants accept pay; promos are bank-run.
- **My QR:** User/merchant QR accepts other LANKAQR apps (fees in FAQs) — acceptance, not cashback catalog.

### Lankawa ingest

| Priority | Action |
|----------|--------|
| Skip `/offers` until it has cards | Empty hub wastes cron |
| Optional P2 | Scrape `/blog` + `/blog-post/*` for dated competitions; parse validFrom/validUntil from T&Cs |
| Never | Store merchant API credentials; claim live merchant cashback from 2023 post |

---

## 2. Dialog eZ Cash + Dialog Pay (Genie)

### Naming

- **eZ Cash** = mobile-money wallet (USSD `#111#`, limits Classic Rs.10k/day vs Power up to Rs.150k on Dialog).
- **Genie → Dialog Pay App**; Dialog Pay also lives inside **MyDialog**. Funding: eZ Cash, JustPay-linked bank, Dialog Finance SMART savings.
- Promo site **`www.genie.lk`** still hosts promotions under “Pay by Dialog Pay” copyright 2026.

### Promotions pages

| URL | Role | Probe |
|-----|------|-------|
| `https://www.ezcash.lk/` | Wallet product FAQ / services | **200**; **no** promotions index; news mostly 2018-era |
| `https://www.genie.lk/promotions/` | Listing shell (`comp-promotions-listing`) | **200**; listing cards not reliably in SSR (MixItUp UI); **use page index via REST + detail HTML** |
| `https://www.genie.lk/promotions/{slug}/` | Full T&Cs | **200**; rich HTML terms (REST `content.rendered` is **empty**) |
| `https://www.genie.lk/wp-json/wp/v2/pages` | Catalog | **~423 pages** total; **~237** under `/promotions/` (titles, slugs, `modified`) |
| `https://dialog.lk/dialog-pay` | Product + **Earn free data** (1GB/txn, daily ≤3GB, monthly ≤10GB, data valid 3 days) | **200** Drupal |
| `https://dialog.lk/dialog-pay/merchants` | Category marketing (F&B, retail, e-comm…) | **200**; **no** machine merchant directory |

**Promo kinds observed (titles + sampled T&Cs, 2025–2026):**

| Kind | Examples | Notes |
|------|----------|-------|
| Prepaid **reload bonus** (Dialog / Airtel) | Rs.500 → 2GB+Rs.150; 20% Airtel bonus via **genie or eZ Cash `#111#`** | Channel promos — align with `TELCO_PACKS_RESEARCH.md` “skip as COL metric” |
| **Utility / highway cashback** via Dialog Finance SMART | 10% utility up to Rs.500; highway QR 10% up to Rs.100 | Short windows; SMART account required |
| **Spend & win / Rewards week** raffles | Glomark e-vouchers; min txn count + cumulative value | Not guaranteed cashback |
| Merchant / lifestyle | Uber Eats, DSI, PickMe creatives in media library | Often image-led; confirm T&C page |

Sample detail (`genie-rewards-week`, modified 2026-07-06): campaign **25–30 Jun 2026**, DF savings only, ≥2 utility bills + ≥2 bank transfers, cumulative ≥ Rs.4,000 → chance at Glomark Rs.2,500 vouchers (20 winners).

Sample eZ Cash channel (`20-bonus-reload-on-airtel…`): **12 / 19 / 26 Mar 2026**, reload Rs.1,000 via genie **or eZ Cash**, 20% bonus (max Rs.200), once per customer.

### APIs

| Surface | Public? | Lankawa use |
|---------|---------|-------------|
| `GET https://www.genie.lk/wp-json/wp/v2/pages?per_page=100&page=N` | **Yes** | Discover promo slugs/titles/`modified`; filter `link` contains `/promotions/` |
| Same endpoint `?slug=` | **Yes** but **empty body** | Do not rely on `content.rendered` |
| Detail HTML `/promotions/{slug}/` | Public SSR | **Primary** for T&Cs / dates / caps |
| Media `wp-json/wp/v2/media?search=…` | Yes | Weak signal (creative filenames); prefer page HTML |
| eZ Cash IPG `ipg.dialog.lk/ezCashIPGExtranet/servlet_sentinal` | Merchant form POST + public/private keys | Payment only; unreachable without merchant flow; **out of scope** |
| Dialog `jsonapi` | **404** | Same as telco packs research |

Open-source IPG clients (e.g. `sahanh/EZCash`) document encrypted `invoice` field + `merchantReciept` return — confirms **no promo API**.

### Merchant cashback

- **Dialog Pay Business** marketing claims customer rewards on scan-and-pay — **not** a public merchant cashback configuration API.
- Consumer cashback is funded/run by **Dialog Finance / Dialog Axiata** on eligible rails (SMART account, eZ Cash wallet, etc.).
- `dialog.lk/dialog-pay/merchants` is category chrome, not SKU-level deals.

### Lankawa ingest

```
P1  genie.lk wp-json pages → filter /promotions/ → HTML detail scrape
P1  dialog.lk/dialog-pay free-data strip (stable product reward; T&C apply)
P2  Cross-link Airtel/Dialog reload promos to telco pack context (not COL price)
Skip ezcash.lk as offer source
Skip IPG / Dialog Pay Business dashboards
```

---

## 3. Mobitel mCash

### Promotions pages

| URL | Role | Probe |
|-----|------|-------|
| `https://www.mobitel.lk/mcash` | Main hub (Drupal): how-to, billers, FAQ anchors, partner offers | **200** |
| `https://www.mobitel.lk/node/1117` | B2B “mCash Services” (wallets, LANKAQR accept, IPG, agency banking) | **200** |
| `https://www.mobitel.lk/10-cashback-mobitel-bill-payments-reloads-mcash` | 10% on Mobitel bill/reload via **own wallet** | **200** — confirm if still active (no clear end date in older copy; treat as **verify**) |
| `https://www.mobitel.lk/25-cashback-utility-bills-mcash-promo` | 25% utility draw-style (400 customers/mo) | **200** — “from 15 Sep 2022”; **likely stale** |
| `https://www.mobitel.lk/mcash-2` | Railway LANKAQR **15%** cashback FAQ | **200** — valid until **31 Dec 2022** → **expired** |
| `https://www.mobitel.lk/sites/default/files/files/MerchantListmCashPayments.pdf` | Merchant / payee list | **PDF ~752 KB** — directory, not cashback rates |
| `https://www.mobitel.lk/mrewards-offers` | Telco mRewards (adjacent, not mCash wallet) | Separate loyalty |

`robots.txt` present; **no** useful sitemap for offers.

### APIs

| Surface | Public? | Notes |
|---------|---------|-------|
| mCash IPG | **Merchant-gated** | OpenCart plugin URLs: `https://ipg.mobitel.lk/mcash/payment.html` + token auth URLs; `www.mcash.lk` currently **redirects to** `mobitel.lk/mcash`. Flow: mobile + PIN + SMS OTP. |
| LANKAQR acceptance / biller platform | B2B sales | Described on `node/1117`; no public REST catalog |
| `developer.mobitel.lk` | Unreachable here | Telco packs research: SMS/CaaS — **out of scope** for offers |
| Norwegian `dev.mca.sh` | Wrong product | **Do not cite** as Mobitel |

### Merchant cashback

- Historical **consumer** cashback (bills, reloads, utilities, railway) published as Drupal FAQ pages — **validity often missing or expired**.
- Merchants get **acceptance** (LANKAQR / IPG / biller), not a public API to configure cashback %.
- Agency banking (HNB, Union Bank, etc.) is bank deposit/repay rails via mCash — not household cashback catalogs.

### Lankawa ingest

| Priority | Action |
|----------|--------|
| P2 | If wallet strip ships: scrape `mcash` hub + known cashback node URLs; **drop rows without parseable end date or past end date** |
| Reference | Merchant PDF only as “where to pay”, not offers |
| Skip | IPG integration; mRewards conflation; expired railway promo as live |

---

## Suggested normalized record

```ts
{
  sourceId: "wallet_mobile_money_offer";
  wallet: "frimi" | "ez_cash" | "dialog_pay" | "mcash";
  operator: "ntb" | "dialog" | "dialog_finance" | "mobitel";
  offerId: string;           // slug or stable hash of URL
  url: string;
  title: string;
  kind:
    | "merchant_cashback_pct"
    | "utility_cashback"
    | "reload_bonus"
    | "highway_cashback"
    | "free_data_reward"
    | "raffle_spend_win"
    | "justpay_funding_comp"
    | "other";
  cashbackPercent: number | null;
  bonusReloadPercent: number | null;
  maxBenefitLkr: number | null;
  minSpendLkr: number | null;
  caps: string | null;       // "1 txn/day", "first 2 bills", …
  channels: ("app" | "ussd" | "lankaqr" | "ipg" | "justpay")[];
  fundingSource: ("wallet_balance" | "df_smart" | "linked_bank" | "any")[];
  validFrom: string | null;
  validUntil: string | null;
  expired: boolean;          // true if validUntil < today or explicit ended copy
  termsExcerpt: string;
  fetchedAt: string;
  provenance: "frimi_blog_html" | "genie_promo_html" | "genie_wp_json" | "dialog_pay_html" | "mobitel_mcash_html";
}
```

Honesty rules:

- Prefer **Dialog Pay free-data** and **dated Genie T&Cs** over undated mCash FAQs.
- Never show expired FriMi merchant-offers (2023) or railway mCash (2022) as live.
- Reload bonuses ≠ lower pack list price — label as **channel promo** (same spirit as telco packs research).

---

## Recommended scrape targets (priority)

```
P1  genie.lk  wp-json/wp/v2/pages (paginate) → /promotions/* HTML T&Cs
P1  dialog.lk/dialog-pay  free-data reward block (product-level)
P2  frimi.lk/blog + blog-post/*  (competitions; rare merchant cashback)
P2  mobitel.lk/mcash + cashback node URLs  (strict expiry filter)
Skip ezcash.lk marketing home as catalog
Skip payment IPGs / merchant portals / NTB Open API credentials
Skip dev.mca.sh (wrong mCASH)
Skip MyPromo / aggregators as primary (see CARD_OFFER_AGGREGATORS_RESEARCH.md)
```

### Ops / compliance

- Cadence: Genie promos **2–3× weekly** in campaign seasons; FriMi blog **weekly**; mCash nodes **monthly** re-validate.
- UA: `LankawaBot/1.0 (+https://github.com/ArdenoStudio/lankawa)` — match other research docs.
- Rate limit WP-JSON (423 pages) + ≤1 detail/sec; backoff on WAF.
- Legal: public marketing HTML only; stop on owner request.

---

## Lankawa product mapping

| Surface idea | Data | Notes |
|--------------|------|-------|
| “Wallet / Pay promos this week” | Genie `/promotions/*` + Dialog Pay free-data | Secondary to **bank supermarket days**; one strip max |
| Telco reload context | Genie/eZ Cash bonus-reload pages | Link from packs UI as channel tip — not COL basket |
| Utility bill tip | SMART/mCash utility cashback **if unexpired** | Pair with CEB/LECO/NWSDB bill context later |
| Remittance / TT | **Not here** | Existing bank remittance path |
| National QR adoption stats | LankaPay / CBSL bulletin | `LANKAPAY_JUSTPAY_LANKAQR_RESEARCH.md` |

Sister-style catalog entry (when wired):

| Source | URL / endpoint | API? | Lankawa path |
|--------|----------------|------|--------------|
| Dialog Pay / Genie promos | `genie.lk/wp-json/…/pages` + `/promotions/{slug}` HTML | REST index + HTML body | Planned `dialog-pay-offers.ts` → seed |
| Dialog Pay free data | `dialog.lk/dialog-pay` | HTML | Same module, `kind: free_data_reward` |
| FriMi blog | `frimi.lk/blog-post/*` | HTML | Optional |
| mCash cashback nodes | `mobitel.lk/*mcash*` | HTML | Optional, expiry-strict |
| FriMi / eZ Cash / mCash IPG | Merchant gateways | N/A | **Out of scope** |

---

## Open risks

1. **Genie REST empty content** — must HTML-scrape details; listing page SSR may show zero cards.
2. **Brand drift** — Genie vs Dialog Pay vs eZ Cash in copy; normalize to `wallet` + `operator` fields.
3. **Stale Mobitel Drupal** — expired promos remain HTTP 200.
4. **FriMi `/offers` hollow** — blog is the real surface; pagination may not expose full history.
5. **Raffles vs cashback** — spend-and-win is not a calculable household saving; label clearly.
6. **IPG / Open API confusion** — payment acceptance ≠ promotional catalog.

---

## Agent note

Researched Jul 2026 against live `frimi.lk` (offers/blog/business), `ezcash.lk`, `genie.lk` (WP-JSON + promo HTML samples), `dialog.lk/dialog-pay` (+ merchants), `mobitel.lk/mcash` (+ cashback nodes, merchant PDF, node/1117), and public OpenCart/PHP IPG references. Medium thoroughness: no authenticated FriMi/Dialog Pay/mCash app sessions, no merchant MID signup, no APK capture. Norwegian `dev.mca.sh` excluded as non-SL.
