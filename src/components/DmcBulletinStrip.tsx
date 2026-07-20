import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fetchNewsPulse, type NewsHeadline } from "@/lib/integrations/news";

const DMC_SOURCE = "dmc_rss";

export async function DmcBulletinStrip({
  headlines: injected,
  limit = 5,
}: {
  headlines?: NewsHeadline[];
  limit?: number;
}) {
  const t = await getTranslations("disaster");

  let headlines: NewsHeadline[] = injected ?? [];

  if (!injected) {
    try {
      const pulse = await fetchNewsPulse();
      headlines = pulse.headlines.filter(
        (headline) => headline.source === DMC_SOURCE,
      );
    } catch {
      headlines = [];
    }
  } else {
    headlines = injected.filter((headline) => headline.source === DMC_SOURCE);
  }

  const shown = headlines.slice(0, limit);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("dmcTitle")}</h2>
          <p className="mt-1 text-sm text-slate-400">{t("dmcSubtitle")}</p>
        </div>
        <Link
          href="/news"
          className="text-sm text-teal-300 hover:text-teal-200"
        >
          {t("dmcViewAll")}
        </Link>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-500">
          {t("dmcEmpty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {shown.map((headline) => (
            <li key={headline.url}>
              <a
                href={headline.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-medium text-slate-100">
                  {headline.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(headline.publishedAt).toLocaleString()}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-500">{t("dmcHonesty")}</p>
    </section>
  );
}
