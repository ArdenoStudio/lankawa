import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExplainerCard } from "@/components/explainers/ExplainerCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EXPLAINERS } from "@/lib/explainers";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("learn");

  return (
    <div className="space-y-10">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <section className="rounded-2xl border border-teal-500/15 bg-teal-500/5 p-5">
        <p className="max-w-2xl text-sm text-slate-300">{t("trustPreamble")}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {EXPLAINERS.map((explainer) => (
          <ExplainerCard key={explainer.slug} explainer={explainer} />
        ))}
      </div>
    </div>
  );
}
