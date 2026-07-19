import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLandChangeSnapshot } from "@/lib/land-change";
import { getSourceProvenancePath } from "@/lib/sources";

const LAND_CHANGE_CSV_PATH = "/api/v1/export/land-change?format=csv";

export default async function LandChangeMethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landChangeMethodology");
  const snapshot = getLandChangeSnapshot();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm text-neutral-400">
          <Link href="/environment" className="hover:text-white">
            ← {t("back")}
          </Link>
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white">
          {t("title")}
        </h1>
        <p className="mt-3 text-neutral-400">{t("subtitle")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          {t("whatTitle")}
        </h2>
        <p className="text-neutral-300">{t("whatBody")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          {t("watchdogTitle")}
        </h2>
        <p className="text-neutral-300">{t("watchdogBody")}</p>
        <ul className="list-disc space-y-2 pl-5 text-neutral-300">
          <li>{t("watchdogPoint1")}</li>
          <li>{t("watchdogPoint2")}</li>
          <li>{t("watchdogPoint3")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          {t("honestyTitle")}
        </h2>
        <p className="text-neutral-300">{t("honestyBody")}</p>
        <p className="text-sm text-neutral-500">
          {t("asOf", { date: snapshot.asOf })} ·{" "}
          <Link
            href={getSourceProvenancePath(snapshot.sourceId)}
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {snapshot.sourceName}
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          {t("apiTitle")}
        </h2>
        <p className="text-neutral-300">{t("apiBody")}</p>
        <code className="block rounded-xl border border-white/15 bg-black/40 p-3 text-sm text-white">
          GET /api/v1/environment/land-change
        </code>
        <p className="text-sm text-neutral-500">
          <a
            href={LAND_CHANGE_CSV_PATH}
            download="lankawa-land-change.csv"
            className="text-white underline decoration-white/30 hover:decoration-white"
          >
            {t("csvLink")}
          </a>
        </p>
      </section>
    </div>
  );
}
