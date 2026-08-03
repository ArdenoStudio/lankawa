# Original User Request

## 2026-08-03T08:08:22Z

# Teamwork Project Prompt

Implement and integrate the next-wave Sri Lanka public data modules into Lankawa using autonomous subagents, committing and pushing each feature, followed by deployment and verification.

Working directory: c:\Users\suven\Desktop\OneDriveBackupFiles\Documents\ARDENO STUDIO\3 - Platforms & Apps\lankawa-main\lankawa-main
Integrity mode: development

## Requirements

### R1. Location & District Hierarchy Integration (SLCities.live & location-api-sl)
- Implement live location adapters in src/lib/integrations/slcities.ts consuming slcities.live/api and locatesrilanka.herokuapp.com.
- Expose city search, postal code lookup, and radius proximity resolution (/cities/nearby) to district pages (/districts/[slug]) and assistant context.
- Fallback gracefully to src/data/districts.json seed when upstream APIs are unreachable.

### R2. Utilities & Energy Outage Monitoring (CEB Care Incognito)
- Implement src/lib/integrations/ceb-outages.ts parsing CEB Care Incognito outage map (cebcare.ceb.lk/Incognito/OutageMap) and load-shedding letter groups (A–Y).
- Surface live power status and scheduled load-shedding breakdown on /economy and /disaster.

### R3. Transport & Aviation Live Operations (Aviation Edge CMB Airport)
- Implement src/lib/integrations/aviation.ts consuming Aviation Edge CMB schedules (iataCode=CMB) and SriLankan Airlines fleet status (airlineIata=UL).
- Surface live flight arrivals/departures and delay status on /transport and /api/v1/transport.

### R4. Citizen Identity & Holidays Engine (Sri Lanka Holidays & NIC Decoder)
- Implement src/lib/integrations/holidays.ts fetching Sri Lanka Holidays API (srilanka-holidays.vercel.app/api/v1/holidays).
- Implement client-side and API NIC validator (src/lib/nic-decoder.ts) parsing 9-digit (V/X) and 12-digit NIC formats into birthdate, gender, and voting eligibility.
- Surface holiday calendar and NIC utility on /services and /brief/[date].

### R5. Version Control, Build & Deployment Pipeline
- Execute git commit and git push for each completed feature module.
- Run node build verification and deploy canary/production update.

## Acceptance Criteria

### Integration & Data Contracts
- [ ] Every new adapter implements AbortController timeout (10s max) and revalidate caching.
- [ ] Every displayed metric registers its sourceId and links to /sources/[id].
- [ ] Upstream API failures fall back cleanly to static seeds with explicit disclaimers ("Seed fallback — live API unavailable").

### Verification & Automated Testing
- [ ] Unit test runner verifies adapters with node --experimental-strip-types.
- [ ] node ./node_modules/next/dist/bin/next build builds clean with zero errors across all locales.
- [ ] Git commit and push succeeded for all feature steps.
