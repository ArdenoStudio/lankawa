import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getCitySearch,
  lookupPostcode,
  getNearbyCities,
  getDistrictCities,
  getDistrictCities as getCitiesForDistrict,
  CityHit,
  SEED_FALLBACK_DISCLAIMER,
  SLCITIES_API_SOURCE_ID,
  SLCITIES_SEED_SOURCE_ID,
} from "@/lib/integrations/slcities";
import { getSourceProvenancePath } from "@/lib/sources";
import { DISTRICTS } from "@/lib/districts";

export const metadata: Metadata = {
  title: "Sri Lanka Cities & Postal Directory | Nearby Search",
  description:
    "Explore Sri Lanka's 25 districts, cities, 5-digit postal codes, and radius proximity search.",
};

interface NearbyCitiesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    postal?: string;
    district?: string;
    lat?: string;
    lng?: string;
    radius?: string;
  }>;
}

export default async function NearbyCitiesPage({
  params,
  searchParams,
}: NearbyCitiesPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const query = sp.q?.trim() ?? "";
  const postalCode = sp.postal?.trim() ?? "";
  const districtSlug = sp.district?.trim() ?? "";
  const latParam = sp.lat ? parseFloat(sp.lat) : NaN;
  const lngParam = sp.lng ? parseFloat(sp.lng) : NaN;
  const radiusParam = sp.radius ? parseFloat(sp.radius) : 25;

  let activeMode: "postal" | "search" | "district" | "nearby" = "nearby";
  let postalResult = null;
  let cityHits: CityHit[] = [];
  let isFallback = false;
  let disclaimer: string | null = null;
  let sourceId: "slcities_api" | "slcities_seed" = SLCITIES_API_SOURCE_ID;
  let activeDistrictName = "";

  if (postalCode) {
    activeMode = "postal";
    const res = await lookupPostcode(postalCode);
    postalResult = res.city;
    isFallback = res.isFallback;
    disclaimer = res.disclaimer;
    sourceId = res.sourceId;
  } else if (query) {
    activeMode = "search";
    const res = await getCitySearch(query);
    cityHits = res.hits;
    isFallback = res.isFallback;
    disclaimer = res.disclaimer;
    sourceId = res.sourceId;
  } else if (districtSlug) {
    activeMode = "district";
    const res = await getCitiesForDistrict(districtSlug);
    cityHits = res.cities;
    activeDistrictName = res.districtName;
    isFallback = res.isFallback;
    disclaimer = res.disclaimer;
    sourceId = res.sourceId;
  } else {
    activeMode = "nearby";
    const lat = !isNaN(latParam) ? latParam : 6.9271; // Default Colombo
    const lng = !isNaN(lngParam) ? lngParam : 79.8612;
    const res = await getNearbyCities(lat, lng, radiusParam);
    cityHits = res.cities;
    isFallback = res.isFallback;
    disclaimer = res.disclaimer;
    sourceId = res.sourceId;
  }

  const provenancePath = getSourceProvenancePath(sourceId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          eyebrow="Location & Hierarchy (R1)"
          title="Sri Lanka Cities & Postal Directory"
          subtitle="Search major urban centers, lookup 5-digit postal codes, or discover cities by proximity radius across all 25 districts."
        />
        <Link
          href={provenancePath as any}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-300 border border-teal-500/30 hover:bg-teal-500/20"
        >
          <span>Source: {sourceId}</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {isFallback && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold">{SEED_FALLBACK_DISCLAIMER}</span>
          </div>
          <Link
            href={provenancePath as any}
            className="text-xs text-amber-200 underline hover:text-amber-100 font-medium"
          >
            View Seed Provenance
          </Link>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Find Locations & Postcodes</h2>
        
        <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="q" className="block text-xs font-medium text-slate-400 mb-1">
              City / Place Name Search
            </label>
            <input
              type="text"
              id="q"
              name="q"
              defaultValue={query}
              placeholder="e.g. Dehiwala, Katugastota..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="postal" className="block text-xs font-medium text-slate-400 mb-1">
              5-Digit Postal Code Lookup
            </label>
            <input
              type="text"
              id="postal"
              name="postal"
              defaultValue={postalCode}
              placeholder="e.g. 00100, 20000..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="district" className="block text-xs font-medium text-slate-400 mb-1">
              Filter by Administrative District
            </label>
            <select
              id="district"
              name="district"
              defaultValue={districtSlug}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="">-- All 25 Districts --</option>
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name} ({d.province})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end gap-3 pt-2">
            <Link
              href="/cities/nearby"
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Clear Filters
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-500"
            >
              Search Directory
            </button>
          </div>
        </form>
      </div>

      {/* Postal Code Result */}
      {activeMode === "postal" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Postal Code Lookup Result</h2>
          {postalResult ? (
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/20 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-teal-300">{postalResult.name}</span>
                <span className="rounded-md bg-teal-500/20 px-3 py-1 text-sm font-mono font-semibold text-teal-200 border border-teal-500/40">
                  {postalResult.postcode}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-xs">District</span>
                  <Link
                    href={`/districts/${postalResult.districtSlug}`}
                    className="font-medium text-teal-400 hover:underline"
                  >
                    {postalResult.districtName}
                  </Link>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Province</span>
                  <span className="font-medium text-white">{postalResult.province}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Latitude</span>
                  <span className="font-mono text-white">{postalResult.latitude.toFixed(4)}° N</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Longitude</span>
                  <span className="font-mono text-white">{postalResult.longitude.toFixed(4)}° E</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
              No matching city found for postal code <span className="font-mono text-teal-300">{postalCode}</span>.
            </div>
          )}
        </div>
      )}

      {/* City Listing Results */}
      {activeMode !== "postal" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {activeMode === "search" && `Search Results for "${query}"`}
              {activeMode === "district" && `Cities in ${activeDistrictName || districtSlug}`}
              {activeMode === "nearby" && "Nearby Cities & Coordinates"}
              <span className="ml-2 text-sm text-slate-400 font-normal">({cityHits.length} places)</span>
            </h2>
          </div>

          {cityHits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cityHits.map((city) => (
                <div
                  key={`${city.districtSlug}-${city.slug}-${city.postcode}`}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{city.name}</h3>
                      <Link
                        href={`/districts/${city.districtSlug}`}
                        className="text-xs text-teal-400 hover:underline"
                      >
                        {city.districtName} District ({city.province})
                      </Link>
                    </div>
                    {city.postcode && (
                      <span className="rounded bg-slate-800 px-2 py-1 text-xs font-mono font-semibold text-teal-300 border border-slate-700">
                        {city.postcode}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="font-mono text-slate-500">
                      {city.latitude.toFixed(3)}°N, {city.longitude.toFixed(3)}°E
                    </span>
                    {city.distanceKm !== undefined && (
                      <span className="rounded bg-teal-950/60 px-2 py-0.5 text-teal-300 font-medium border border-teal-800/50">
                        {city.distanceKm} km away
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
              No city records found matching your criteria. Try expanding search or selecting another district.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
