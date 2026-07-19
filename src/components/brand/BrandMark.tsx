import clsx from "clsx";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

/**
 * Deprecated — monochrome Lankawa uses a text wordmark only.
 * Kept as a no-op shim so any lingering imports compile cleanly.
 */
export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <span
      className={clsx("inline-block shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
