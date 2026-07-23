import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const DEPTH_ITEMS = [
  {
    href: "/districts",
    key: "depthDistricts" as const,
    hintKey: "depthDistrictsHint" as const,
    icon: (
      <path
        d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/economy",
    key: "depthEconomy" as const,
    hintKey: "depthEconomyHint" as const,
    icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
  },
  {
    href: "/disaster",
    key: "depthDisaster" as const,
    hintKey: "depthDisasterHint" as const,
    icon: (
      <path
        d="M12 3l8 14H4L12 3zm0 6v4m0 3h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/explore",
    key: "depthExplore" as const,
    hintKey: "depthExploreHint" as const,
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: "/learn",
    key: "depthLearn" as const,
    hintKey: "depthLearnHint" as const,
    icon: (
      <path
        d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4v15.5M6.5 4H20v13H6.5A2.5 2.5 0 004 14.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
] as const;

export async function DepthRail() {
  const t = await getTranslations("home");

  return (
    <section className="space-y-5 border-t border-white/10 pt-10">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
          {t("depthTitle")}
        </h2>
        <div className="lk-brand-stripe w-14" aria-hidden="true" />
        <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
          {t("depthSubtitle")}
        </p>
      </div>

      <nav
        aria-label={t("depthTitle")}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {DEPTH_ITEMS.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="lk-card lk-card-interactive group flex flex-col gap-3 p-4 animate-[lk-fade-up_0.4s_ease-out_both]"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className="lk-icon-ring h-10 w-10 text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
            </span>
            <div>
              <p className="font-medium text-white transition group-hover:text-neutral-100">
                {t(item.key)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                {t(item.hintKey)}
              </p>
            </div>
          </Link>
        ))}
      </nav>
    </section>
  );
}
