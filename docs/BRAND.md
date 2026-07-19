# Lankawa Brand Guidelines

Lankawa is Sri Lanka's all-in-one civic intelligence platform. This document defines how the brand should be represented across product, marketing, and communications.

**Tagline:** Built for Sri Lankans, by Sri Lankans.

---

## Logo

### Mark

The Lankawa mark is a stylized Sri Lanka island silhouette with a pulse/wave line through the center and a gold accent dot near the west coast (Colombo area). It uses a teal gradient fill and works at sizes as small as 32px.

**Files:**
- `public/brand/mark.svg` — icon only
- `public/brand/wordmark.svg` — typography only
- `public/brand/logo.svg` — horizontal lockup
- `public/brand/logo-stacked.svg` — vertical lockup

### React components

```tsx
import { BrandMark } from "@/components/brand/BrandMark";
import { Logo } from "@/components/brand/Logo";
import { BrandTagline } from "@/components/brand/BrandTagline";
```

- `<Logo variant="full" />` — mark + wordmark (default)
- `<Logo variant="mark" />` — icon only
- `<Logo variant="wordmark" />` — text only
- `<BrandTagline short />` — localized tagline

### Do

- Use the provided SVG assets or React components
- Maintain clear space equal to the height of the mark around the logo
- Use the horizontal lockup in headers and navigation
- Use the stacked lockup in square or vertical contexts

### Don't

- Stretch, rotate, or skew the logo
- Change the mark colors outside the defined palette
- Place the logo on busy backgrounds without sufficient contrast
- Use tourism clichés (elephants, tea leaves, beaches) as substitutes
- Reference or reuse lanka-monitor branding

---

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--lk-teal` | `#0d9488` | Primary brand, buttons, links |
| `--lk-teal-bright` | `#2dd4bf` | Accents, hover states, "awa" in wordmark |
| `--lk-maroon` | `#8b2635` | Flag-inspired accent (sparingly) |
| `--lk-gold` | `#d4a24c` | Flag-inspired accent, mark dot |
| `--lk-saffron` | `#e8a838` | Secondary warm accent |
| `--lk-surface` | `#020617` | Page background |
| `--lk-surface-elevated` | `#0f172a` | Cards, elevated panels |
| `--lk-border` | `rgba(255,255,255,0.1)` | Borders, dividers |

Colors are defined in `src/lib/brand.ts` and exposed as CSS variables in `src/app/globals.css`.

The tricolor stripe (maroon / teal / gold) appears in the footer and OG image — use sparingly as a subtle national accent, not as a dominant pattern.

---

## Typography

| Role | Font | Notes |
|------|------|-------|
| Latin UI | Noto Sans | Primary interface text |
| Sinhala | Noto Sans Sinhala | Automatic via locale |
| Tamil | Noto Sans Tamil | Automatic via locale |

Use `BrandTagline` for taglines to ensure correct script rendering per locale.

---

## Voice & Tone

Lankawa speaks as a **trustworthy civic companion** — not a government agency, not a tourist brochure.

- **Clear** — plain language, no jargon unless the domain requires it
- **Grounded** — cite sources, show provenance, acknowledge limitations
- **Proud but not performative** — Sri Lankan identity through substance, not cliché
- **Inclusive** — trilingual (en / si / ta) parity on all user-facing copy

### Example copy

| Context | Good | Avoid |
|---------|------|-------|
| Tagline | Built for Sri Lankans, by Sri Lankans | Discover paradise data |
| Hero | One platform for the entire island | Your gateway to Sri Lanka |
| Disclaimer | Aggregated from public sources | Official government data |

---

## CSS Utilities

Defined in `globals.css`:

| Class | Purpose |
|-------|---------|
| `.lk-card` | Standard card surface |
| `.lk-card-hover` | Interactive card with hover state |
| `.lk-btn-primary` | Primary CTA button |
| `.lk-btn-secondary` | Secondary/outline button |
| `.lk-gradient-text` | Teal gradient text |
| `.lk-brand-pattern` | Subtle palmyra/geo background |
| `.lk-brand-stripe` | Tricolor accent bar |
| `.lk-icon-ring` | Icon container with brand gradient ring |
| `.hero-surface` | Hero section background |

---

## Social / OG

Default Open Graph image: `/brand/og-default.svg` (1200×630).

Referenced in `src/app/[locale]/layout.tsx` metadata and `src/lib/brand.ts`.

---

## PWA

- Theme color: `#0d9488`
- Background: `#020617`
- Icons: `/icons/icon-192.svg`, `/icons/icon-512.svg`
- Manifest: `public/manifest.json`
