# Lankawa Brand Guidelines

Lankawa is Sri Lanka's all-in-one civic intelligence platform.

**Tagline:** Built for Sri Lankans, by Sri Lankans.

---

## Logo

Monochrome **wordmark only** — the text “Lankawa”. No icon mark, island silhouette, or colored lockup.

### React

```tsx
import { Logo } from "@/components/brand/Logo";
```

- `<Logo />` / `<Logo variant="wordmark" />` — white “Lankawa” text
- Mark/icon variants are deprecated and render the wordmark

### Do

- Use the wordmark in headers, hero, and footer
- Keep the wordmark white on black (or black on white for print/export)

### Don't

- Reintroduce a decorative mark, island silhouette, or teal accent
- Use tourism clichés as substitutes
- Reference or reuse lanka-monitor branding

---

## Colors

Strict black-and-white system:

| Token | Hex | Usage |
|-------|-----|-------|
| `--lk-surface` | `#000000` | Page background |
| `--lk-surface-elevated` | `#0a0a0a` | Panels |
| `--lk-ink` / white | `#ffffff` | Primary text, primary buttons |
| `--lk-muted` | `#a3a3a3` | Secondary text |
| `--lk-border` | `rgba(255,255,255,0.14)` | Borders |

Legacy `--lk-teal*` / maroon / gold tokens exist for compatibility and resolve to white/gray.

Freshness badges use weight/opacity (solid white vs outline), not hue.

---

## Typography

| Role | Font | Notes |
|------|------|-------|
| Latin display | Cal Sans | Brand, hero, section titles (`.font-display`) |
| Latin UI | Inter | Body copy and UI chrome |
| Sinhala | Noto Sans Sinhala | Automatic via `html:lang(si)` |
| Tamil | Noto Sans Tamil | Automatic via `html:lang(ta)` |

---

## Voice

Direct, civic, provenance-first. Prefer “morning check” language over dashboard jargon.
