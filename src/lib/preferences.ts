export const HOME_DISTRICT_KEY = "lankawa_home_district";

export function readHomeDistrict(storage: Storage): string | null {
  const slug = storage.getItem(HOME_DISTRICT_KEY);
  return slug && slug.trim() ? slug.trim() : null;
}

export function writeHomeDistrict(storage: Storage, slug: string | null) {
  if (!slug) {
    storage.removeItem(HOME_DISTRICT_KEY);
    return;
  }
  storage.setItem(HOME_DISTRICT_KEY, slug);
}
