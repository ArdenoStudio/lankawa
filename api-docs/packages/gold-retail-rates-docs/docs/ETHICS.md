# Ethics & limits

- **Unofficial.** Not affiliated with the upstream operator.
- **Public reads only.** No credential stuffing, no captcha farms, no authenticated loyalty/OTP portals.
- **Polite rate limits.** Default ≥1s between probes; backoff on 429/403.
- **No PII in samples.** Redact phones, emails, addresses, account numbers.
- **Indicative data.** Not financial, medical, or legal advice.
- **Upstream ToS wins.** If a site bans scraping, park that surface and document why.
- **Server-side fetch preferred** for production consumers (CORS/WAF).
