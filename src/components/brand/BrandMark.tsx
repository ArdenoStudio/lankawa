import clsx from "clsx";
import { useId } from "react";

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export function BrandMark({ size = 32, className }: BrandMarkProps) {
  const gradId = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role="img"
      aria-label="Lankawa"
      className={clsx("shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <path
        d="M16 4c-4 2-7 6-8 10-1.5 5 0 10 3 14 2.5 3.5 5 4.5 5 4.5s2.5-1 5-4.5c3-4 4.5-9 3-14-1-4-4-8-8-10z"
        fill={`url(#${gradId})`}
      />
      <path
        d="M10 16c2-3 4-4 6-4s4 1 6 4"
        fill="none"
        stroke="#f8fafc"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="9" cy="15" r="1.75" fill="#d4a24c" />
    </svg>
  );
}
