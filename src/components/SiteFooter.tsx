import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>{t("built")}</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/about" className="text-teal-300 hover:text-teal-200">
            {t("about")}
          </Link>
          <Link href="/sources" className="text-teal-300 hover:text-teal-200">
            {t("sources")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
