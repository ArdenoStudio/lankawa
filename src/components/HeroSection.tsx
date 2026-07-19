import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function HeroSection() {
  const t = await getTranslations("home");

  return (
    <section className="hero-surface lk-brand-pattern relative -mx-4 overflow-hidden md:mx-0 md:rounded-3xl md:border md:border-white/15">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_45%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative space-y-6 p-6 md:p-10 lg:p-12 animate-[lk-fade-up_0.45s_ease-out]">
        <p className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Lankawa
        </p>

        <div className="space-y-3">
          <h1 className="font-display max-w-xl text-xl font-medium tracking-tight text-neutral-100 sm:text-2xl lg:text-3xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/districts" className="lk-btn-primary">
            {t("exploreDistricts")}
          </Link>
          <Link href="/status" className="lk-btn-secondary">
            {t("viewStatus")}
          </Link>
        </div>
      </div>
    </section>
  );
}
