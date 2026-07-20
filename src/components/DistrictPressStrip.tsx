import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { District } from "@/lib/types";
import { fetchNewsPulse } from "@/lib/integrations/news";
import { filterDistrictPressHeadlines } from "@/lib/news-press";

export async function DistrictPressStrip({
  district,
  locale,
  limit = 4,
}: {
  district: District;
  locale: string;
  limit?: number;
}) {
  const t = await getTranslations("districts");

  let headlines: Awaited<ReturnType<typeof filterDistrictPressHeadlines>> = [];
  try {
    const pulse = await fetchNewsPulse();
    headlines = filterDistrictPressHeadlines(pulse.headlines, district, limit);
  } catch {
    headlines = [];
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("pressTitle")}</h2>
          <p className="mt-1 text-sm text-neutral-400">{t("pressSubtitle")}</p>
        </div>
        <Link
          href="/news"
          className="text-sm text-white underline decoration-white/30 hover:decoration-white"
        >
          {t("pressViewAll")}
        </Link>
      </div>

      {headlines.length === 0 ? (
        <p className="border border-white/10 px-4 py-3 text-sm text-neutral-500">
          {t("pressEmpty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {headlines.map((headline) => (
            <li key={headline.url}>
              <a
                href={headline.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-white/10 px-4 py-3 transition hover:border-white/30"
              >
                <p className="text-sm font-medium text-white">{headline.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {headline.source}
                  {headline.publishedAt
                    ? ` · ${new Date(headline.publishedAt).toLocaleString(locale)}`
                    : null}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-neutral-500">{t("pressHonesty")}</p>
    </section>
  );
}
