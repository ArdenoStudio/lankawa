import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ExplainerDetail } from "@/components/explainers/ExplainerDetail";
import {
  EXPLAINER_SLUGS,
  getExplainer,
  isExplainerSlug,
} from "@/lib/explainers";

export function generateStaticParams() {
  return EXPLAINER_SLUGS.map((slug) => ({ slug }));
}

export default async function LearnDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!isExplainerSlug(slug)) {
    notFound();
  }

  const explainer = getExplainer(slug);
  if (!explainer) {
    notFound();
  }

  return <ExplainerDetail explainer={explainer} />;
}
