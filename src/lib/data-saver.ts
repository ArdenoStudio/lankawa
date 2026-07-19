export const DATA_SAVER_STORAGE_KEY = "lankawa_data_saver";

export function parseDataSaverValue(value: string | null | undefined): boolean {
  return value === "1" || value === "true";
}

