import clsx from "clsx";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ eyebrow, title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={clsx("space-y-3", className)}>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        <div className="lk-brand-stripe w-16" aria-hidden="true" />
      </div>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-neutral-400">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
