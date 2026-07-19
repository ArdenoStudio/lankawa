"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  DATA_SAVER_STORAGE_KEY,
  parseDataSaverValue,
} from "@/lib/data-saver";

interface DataSaverContextValue {
  enabled: boolean;
  hydrated: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
}

const DataSaverContext = createContext<DataSaverContextValue | null>(null);

function persistDataSaverPreference(enabled: boolean) {
  const value = enabled ? "1" : "0";
  window.localStorage.setItem(DATA_SAVER_STORAGE_KEY, value);
  document.cookie = `${DATA_SAVER_STORAGE_KEY}=${value}; path=/; max-age=31536000; samesite=lax`;
}

export function DataSaverProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return parseDataSaverValue(
      window.localStorage.getItem(DATA_SAVER_STORAGE_KEY),
    );
  });
  const [hydrated] = useState(() => typeof window !== "undefined");

  const setEnabled = useCallback((nextEnabled: boolean) => {
    setEnabledState(nextEnabled);
    persistDataSaverPreference(nextEnabled);
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((current) => {
      const nextEnabled = !current;
      persistDataSaverPreference(nextEnabled);
      return nextEnabled;
    });
  }, []);

  const value = useMemo(
    () => ({ enabled, hydrated, setEnabled, toggle }),
    [enabled, hydrated, setEnabled, toggle],
  );

  return (
    <DataSaverContext.Provider value={value}>
      {children}
    </DataSaverContext.Provider>
  );
}

export function useDataSaver() {
  const context = useContext(DataSaverContext);
  if (!context) {
    throw new Error("useDataSaver must be used within DataSaverProvider");
  }
  return context;
}
