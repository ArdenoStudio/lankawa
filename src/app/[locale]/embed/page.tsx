import { getTranslations, setRequestLocale } from "next-intl/server";
import { EmbedPreview } from "@/components/EmbedPreview";
import { Link } from "@/i18n/navigation";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("embed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
        <p className="mt-3 text-sm text-slate-500">
          <Link href="/developers" className="text-teal-300 hover:text-teal-200">
            {t("developersLink")}
          </Link>
        </p>
      </div>

      <EmbedPreview />

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
