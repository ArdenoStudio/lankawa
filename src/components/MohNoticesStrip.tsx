import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMohNotices } from "@/lib/moh-notices";

export async function MohNoticesStrip({ limit = 5 }: { limit?: number }) {
  const t = await getTranslations("health");
  const snapshot = await getMohNotices(limit);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("moh.title")}</h2>
          <p className="mt-1 text-sm text-neutral-400">{t("moh.subtitle")}</p>
        </div>
        {snapshot.isSeed ? (
          <span className="text-xs uppercase tracking-wide text-neutral-500">
            {t("moh.seed")}
          </span>
        ) : null}
      </div>

      {snapshot.notices.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-500">
          {t("moh.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {snapshot.notices.map((notice) => (
            <li key={notice.id}>
              <a
                href={notice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/25 hover:bg-white/[0.05]"
              >
                <p className="text-sm font-medium text-neutral-100">
                  {notice.title}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(notice.publishedAt).toLocaleString()}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-neutral-500">{t("moh.honesty")}</p>
      <p className="text-xs text-neutral-500">
        <Link
          href={`/sources/${snapshot.sourceId}`}
          className="text-white underline decoration-white/30 hover:decoration-white"
        >
          {snapshot.sourceName}
        </Link>
      </p>
    </section>
  );
}
