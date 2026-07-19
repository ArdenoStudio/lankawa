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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--lk-teal-bright)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        <div className="lk-brand-stripe w-16 rounded-full" aria-hidden="true" />
      </div>
      {subtitle ? (
        <p className="max-w-2xl text-slate-400">{subtitle}</p>
      ) : null}
    </header>
  );
}
