import clsx from "clsx";
import { Link } from "@/i18n/navigation";

type LogoVariant = "full" | "mark" | "wordmark";

interface LogoProps {
  variant?: LogoVariant;
  linkToHome?: boolean;
  className?: string;
  /** Retained for call-site compatibility; mark is not rendered. */
  markSize?: number;
}

function WordmarkText({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "font-display font-semibold tracking-tight text-white",
        className,
      )}
    >
      Lankawa
    </span>
  );
}

export function Logo({
  variant = "full",
  linkToHome = true,
  className,
}: LogoProps) {
  // Monochrome wordmark only — no icon/mark.
  const content =
    variant === "mark" ? (
      <WordmarkText className="text-base" />
    ) : (
      <WordmarkText className="text-lg" />
    );

  if (!linkToHome) {
    return <span className={className}>{content}</span>;
  }

  return (
    <Link href="/" className={clsx("inline-flex items-center", className)}>
      {content}
    </Link>
  );
}
