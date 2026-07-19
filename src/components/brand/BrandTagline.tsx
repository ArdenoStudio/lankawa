import clsx from "clsx";
import { getTranslations } from "next-intl/server";

interface BrandTaglineProps {
  short?: boolean;
  className?: string;
}

export async function BrandTagline({ short = false, className }: BrandTaglineProps) {
  const t = await getTranslations("brand");
  const text = short ? t("taglineShort") : t("tagline");

  return (
    <p
      className={clsx(
        "text-sm leading-relaxed text-slate-400",
        "[&:lang(si)]:font-[family-name:var(--font-noto-sinhala)]",
        "[&:lang(ta)]:font-[family-name:var(--font-noto-tamil)]",
        className,
      )}
    >
      {text}
    </p>
  );
}
