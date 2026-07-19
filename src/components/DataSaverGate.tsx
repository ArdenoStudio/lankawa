"use client";

import { useDataSaver } from "@/components/DataSaverProvider";

export function DataSaverGate({
  children,
  fallback = null,
  hideUntilHydrated = false,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hideUntilHydrated?: boolean;
}) {
  const { enabled, hydrated } = useDataSaver();

  if ((hideUntilHydrated && !hydrated) || (hydrated && enabled)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

