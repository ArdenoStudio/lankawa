import clsx from "clsx";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "./BrandMark";

type LogoVariant = "full" | "mark" | "wordmark";

interface LogoProps {
  variant?: LogoVariant;
  linkToHome?: boolean;
  className?: string;
  markSize?: number;
}

function WordmarkText({ className }: { className?: string }) {
  return (
    <span className={clsx("font-semibold tracking-tight text-white", className)}>
      Lank<span className="text-[var(--lk-teal-bright)]">awa</span>
    </span>
  );
}

export function Logo({
  variant = "full",
  linkToHome = true,
  className,
  markSize = 28,
}: LogoProps) {
  const content = (() => {
    switch (variant) {
      case "mark":
        return <BrandMark size={markSize} />;
      case "wordmark":
        return <WordmarkText className="text-lg" />;
      case "full":
        return (
          <span className="inline-flex items-center gap-2">
            <BrandMark size={markSize} />
            <WordmarkText className="text-lg" />
          </span>
        );
      default: {
        const _exhaustive: never = variant;
        return _exhaustive;
      }
    }
  })();

  if (!linkToHome) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link href="/" className={clsx("inline-flex items-center", className)}>
      {content}
    </Link>
  );
}

/** Static logo image for contexts where inline SVG is not ideal (e.g. OG fallbacks). */
export function LogoImage({
  variant = "full",
  className,
  width = 180,
  height = 40,
}: {
  variant?: "full" | "stacked";
  className?: string;
  width?: number;
  height?: number;
}) {
  const src = variant === "stacked" ? "/brand/logo-stacked.svg" : "/brand/logo.svg";
  return (
    <Image
      src={src}
      alt="Lankawa"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
