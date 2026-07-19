import { getTranslations, setRequestLocale } from "next-intl/server";
import { CivicAssistant } from "@/components/CivicAssistant";

export default async function AssistantPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("assistant");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-400">{t("subtitle")}</p>
      </div>

      <CivicAssistant />

      <p className="text-sm text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
