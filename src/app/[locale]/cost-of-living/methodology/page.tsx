import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CostOfLivingMethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("costOfLivingMethodology");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm text-teal-300">
          <Link href="/cost-of-living" className="hover:text-teal-200">
            ← {t("back")}
          </Link>
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white">
          {t("title")}
        </h1>
        <p className="mt-3 text-slate-400">{t("subtitle")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          {t("inputsTitle")}
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-300">
          <li>{t("inputFuel")}</li>
          <li>{t("inputProperty")}</li>
          <li>{t("inputFood")}</li>
          <li>{t("inputCoconut")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          {t("methodTitle")}
        </h2>
        <p className="leading-relaxed text-slate-300">{t("methodBody")}</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-white">
          {t("limitsTitle")}
        </h2>
        <p className="leading-relaxed text-slate-300">{t("limitsBody")}</p>
      </section>
    </div>
  );
}
