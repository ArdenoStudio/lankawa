import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Brand-first morning hero.
 * Full-bleed monochrome atmosphere (not a logo mark) + wordmark as the
 * dominant signal — headline stays quieter than “Lankawa”.
 */
export async function HeroSection() {
  const t = await getTranslations("home");

  return (
    <section className="hero-surface relative -mx-4 min-h-[min(72vh,36rem)] overflow-hidden md:mx-0 md:min-h-[min(68vh,34rem)] md:rounded-[1.75rem] md:border md:border-white/12">
      {/* Soft light wells */}
      <div
        className="pointer-events-none absolute -left-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/[0.07] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-[-10%] h-[32rem] w-[32rem] rounded-full bg-white/[0.04] blur-3xl"
        aria-hidden="true"
      />

      {/* Abstract coastline / contour atmosphere — not a brand mark */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.55]"
        viewBox="0 0 1200 720"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lk-hero-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.0" />
            <stop offset="35%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#fff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.0" />
          </linearGradient>
          <radialGradient id="lk-hero-glow" cx="72%" cy="38%" r="45%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="720" fill="url(#lk-hero-glow)" />
        <path
          d="M180 520 C 260 420, 320 380, 420 360 C 540 335, 620 300, 700 250 C 780 200, 860 170, 980 140"
          fill="none"
          stroke="url(#lk-hero-line)"
          strokeWidth="1.25"
        />
        <path
          d="M140 580 C 240 500, 340 470, 460 450 C 600 425, 690 390, 780 320 C 860 265, 940 230, 1080 200"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
        />
        <path
          d="M220 640 C 340 580, 450 560, 580 540 C 740 515, 840 470, 960 390 C 1040 335, 1110 300, 1180 280"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
        <circle cx="860" cy="210" r="3.5" fill="#fff" fillOpacity="0.55" />
        <circle cx="860" cy="210" r="18" fill="none" stroke="#fff" strokeOpacity="0.18" />
        <circle
          className="lk-hero-pulse"
          cx="860"
          cy="210"
          r="28"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.12"
        />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative flex min-h-[min(72vh,36rem)] flex-col justify-end p-6 pb-10 md:min-h-[min(68vh,34rem)] md:p-10 md:pb-12 lg:p-14 lg:pb-14">
        <div className="max-w-2xl space-y-6 animate-[lk-fade-up_0.55s_ease-out]">
          <p className="font-display text-[clamp(2.75rem,8vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-white">
            Lankawa
          </p>

          <div className="space-y-3">
            <h1 className="font-display max-w-xl text-xl font-medium tracking-tight text-neutral-100 sm:text-2xl lg:text-[1.75rem] lg:leading-snug">
              {t("title")}
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-neutral-400 sm:text-lg">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href="/districts" className="lk-btn-primary">
              {t("exploreDistricts")}
            </Link>
            <Link href="/#today" className="lk-btn-secondary">
              {t("pulseTitle")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
