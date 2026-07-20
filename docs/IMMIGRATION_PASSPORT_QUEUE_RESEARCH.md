# Sri Lanka Immigration / passport appointment & queue status — research (Lankawa)

**Status:** Research (quick), Jul 2026  
**Product rule:** Public status / directory surfaces only. No authenticated citizen sessions, SMS booking proxies, or reverse-engineering of personal application lookups (NIC / reference + DOB). Server-side fetch + honest provenance.

**Sisters:** `/services` directory · `PHARMACY_HOSPITAL_OFFERS_RESEARCH.md` (SPC outlet P2 pattern) · civic link-outs on `/civic`.

---

## Verdict

| Question | Answer |
|----------|--------|
| Public **queue length / wait-time / appointment slot availability** API? | **No.** Nothing aggregate and machine-readable. |
| Official passport **appointment** portal? | Announced Nov 2024 as `eservices.immigration.gov.lk/MakeAppointments/` — **404** as of this check. Hub page `pages_e.php?id=65` says the online appointment system is **under maintenance**. |
| Online passport **apply** surface? | Live SPA: `https://eservices.immigration.gov.lk/onlinetd/OnlineTD` — citizen workflow, not a public feed. |
| Application / visa **status inquiry**? | **Personal lookup only** (JSF + captcha / reference numbers). Not cron-friendly, not civic-aggregate. |
| Fit for Lankawa **live civic pulse** (home / disaster / economy style)? | **Low / skip.** No public numbers to show without inventing or scraping PII gates. |
| Fit for Lankawa **services / civic link-out**? | **Optional P3** — static “Immigration & Emigration” card with official URLs + regional office contacts; optional authorized photo-studio directory (HTML AJAX). |

**Bottom line:** High citizen demand, **zero public queue/status API**. Do not build a passport-queue product surface until DIE publishes aggregate openness (or a stable non-PII status page). At most, seed a link-out + studios directory.

---

## Landscape (probed Jul 2026)

| Surface | URL | HTTP | Role | Structured public data? |
|---------|-----|------|------|-------------------------|
| DIE hub | `https://www.immigration.gov.lk/` / `index_e.php` | 200 | Official site; links into eservices | HTML only |
| Appointment notice | `https://www.immigration.gov.lk/pages_e.php?id=65` | 200 | States appointment system **under maintenance** | Copy only |
| Make appointments (news URL) | `https://eservices.immigration.gov.lk/MakeAppointments/` | **404** | Was public booking entry (Nov 2024 press) | Dead |
| Online TD / passport apply | `https://eservices.immigration.gov.lk/onlinetd/OnlineTD` | 200 | Online passport application | SPA; no public API sniffed |
| Dual citizenship status | `https://eservices.immigration.gov.lk/DualCitVisaStatus/index.faces` | 200 | Reference no. + DOB → “Current Status” | JSF personal form |
| Visa authenticity / inquiry | `https://eservices.immigration.gov.lk/InfOVA/captcha.xhtml` | 200 | Captcha-gated visa status | JSF + captcha |
| ETA | `https://eta.gov.lk/` | (external) | Travel authorization | Out of scope for passport queue |
| Authorized photo studios | `https://www.immigration.gov.lk/studio_e.php` | 200 | District filter → studio table | `POST json/function.php` returns **HTML rows** (`action_type=view\|search`) |
| Regional offices / contacts | `https://www.immigration.gov.lk/pages_e.php?id=32` | 200 | Head office + Matara, Kandy, Vavuniya, Kurunegala, Jaffna | Static HTML |
| Hackathon “queue system” | Devpost / AWS demo | n/a | **Not** government; not production | Ignore for ingest |

---

## What is *not* available

- Live office queue tokens / “now serving”
- Public appointment calendar / next available date by office
- Passport application status JSON by reference without interactive session
- OpenAPI / `wp-json` / RSS for DIE operational status
- Official mobile SDK or partner API for third-party dashboards

Press (Nov 2024) described SMS-confirmed appointment dates after online registration. That flow is **transactional and private**, not a scrape target for Lankawa.

---

## Civic fit for Lankawa

Lankawa’s civic layer is **district pulse, services directory, tenders, research drops, elections, outages** — public aggregates with provenance. Passport/immigration demand is civic in spirit, but:

1. **No aggregate signal** → a “queue card” would be empty or dishonest.
2. **Status pages are PII-keyed** → wrong product shape (and wrong to proxy).
3. **Appointment URL is currently dead / under maintenance** → brittle link-out; must label honestly if shown.
4. Closest analogy that *does* fit: **SPC outlets / photo studios** — curated directory, not live ops.

| Product idea | Priority | Notes |
|--------------|----------|-------|
| Live passport queue / wait chip | **Skip** | No source |
| Proxy personal status lookup | **Skip** | PII, captcha, ToS risk |
| Civic link-out: DIE + OnlineTD + appointment notice | **P3** | Update when maintenance ends |
| Authorized photo studios → services-adjacent seed | **P3** | `POST …/json/function.php`; HTML parse; district map |
| Regional DIE offices into services / local-gov contacts | **P3** | Parse contact page once; static seed |

---

## Recommended next step

**None for ingest.** Revisit only if DIE restores `MakeAppointments` *and* exposes a non-personal public board (slot counts, office closed notices, etc.). Until then, keep Immigration off the live-data backlog (`DATA_EXPANSION_RESEARCH.md` civic table).
