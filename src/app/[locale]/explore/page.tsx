import { setRequestLocale } from "next-intl/server";
import { ExploreHub } from "@/components/ExploreHub";

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ExploreHub locale={locale} />;
}
