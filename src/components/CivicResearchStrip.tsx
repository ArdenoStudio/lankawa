import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCivicResearchSnapshot } from "@/lib/civic-research";
import { getSourceProvenancePath } from "@/lib/sources";

export async function CivicResearchStrip({ locale }: { locale: string }) {
  const t = await getTranslations("civic");
  const snapshot = getCivicResearchSnapshot();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("researchTitle")}</h2>
          <p className="mt-1 text-sm text-neutral-400">{t("researchSubtitle")}</p>
        </div>
        <Link
          href={getSourceProvenancePath(snapshot.sourceId)}
          className="text-sm text-white underline decoration-white/30 hover:decoration-white"
        >
          {snapshot.sourceName}
        </Link>
      </div>

      <ul className="space-y-2">
        {snapshot.items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-white/10 px-4 py-3 transition hover:border-white/30"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
                {item.org}
              </p>
              <p className="mt-1 text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {new Date(item.publishedAt).toLocaleDateString(locale)} ·{" "}
                {item.summary}
              </p>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-neutral-500">
        {snapshot.isSeed ? t("researchSeed") : t("researchLive")}
      </p>
    </section>
  );
}
