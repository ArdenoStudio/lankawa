import { setRequestLocale } from "next-intl/server";
import { ExploreHub } from "@/components/ExploreHub";

export default async function ExplorePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { locale } = await params;
  const { view } = await searchParams;
  setRequestLocale(locale);

  return <ExploreHub locale={locale} view={view} />;
}
