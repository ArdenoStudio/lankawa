import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ExplainerDemoFlood } from "@/components/explainers/ExplainerDemoFlood";
import { ExplainerDemoFreshness } from "@/components/explainers/ExplainerDemoFreshness";
import { ExplainerDemoFx } from "@/components/explainers/ExplainerDemoFx";
import { ExplainerDemoProvenance } from "@/components/explainers/ExplainerDemoProvenance";
import { ExplainerDemoSeedLive } from "@/components/explainers/ExplainerDemoSeedLive";
import {
  explainerTranslationKey,
  type ExplainerDefinition,
} from "@/lib/explainers";

function ExplainerDemo({ slug }: { slug: ExplainerDefinition["slug"] }) {
  switch (slug) {
    case "fx-rates":
      return <ExplainerDemoFx />;
    case "flood-levels":
      return <ExplainerDemoFlood />;
    case "freshness":
      return <ExplainerDemoFreshness />;
    case "provenance":
      return <ExplainerDemoProvenance />;
    case "seed-vs-live":
      return <ExplainerDemoSeedLive />;
    default:
      return null;
  }
}

export async function ExplainerDetail({ explainer }: { explainer: ExplainerDefinition }) {
  const t = await getTranslations("learn");
  const itemKey = explainerTranslationKey(explainer.slug);
  const sections = t.raw(`items.${itemKey}.sections`) as string[];

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <Link href="/learn" className="text-sm text-teal-300 hover:text-teal-200">
          ← {t("back")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-300">
            {t(`topics.${explainer.topic}`)}
          </span>
          <span className="text-xs text-slate-500">
            {t("readTime", { minutes: explainer.readMinutes })}
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white">
          {t(`items.${itemKey}.title`)}
        </h1>
        <p className="max-w-2xl text-slate-400">{t(`items.${itemKey}.intro`)}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">{t("demoTitle")}</h2>
        <p className="max-w-2xl text-sm text-slate-400">
          {t(`items.${itemKey}.demoIntro`)}
        </p>
        <ExplainerDemo slug={explainer.slug} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">{t("explainerTitle")}</h2>
        <div className="space-y-4">
          {sections.map((body, index) => (
            <p key={index} className="max-w-2xl text-slate-300">
              {body}
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-lg font-semibold text-white">{t("trustTitle")}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          {t(`items.${itemKey}.trustNote`)}
        </p>
      </section>

      {explainer.relatedPaths.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">{t("relatedTitle")}</h2>
          <ul className="flex flex-wrap gap-2">
            {explainer.relatedPaths.map((path) => (
              <li key={path}>
                <Link
                  href={path}
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:border-teal-500/30 hover:text-teal-200"
                >
                  {t(`relatedPaths.${path}`)}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
