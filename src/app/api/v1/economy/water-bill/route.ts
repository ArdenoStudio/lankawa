import { jsonWithCache } from "@/lib/api-cache";
import {
  estimateWaterBill,
  fetchLiveWaterBillEstimate,
  getNwsdbTariffSnapshot,
} from "@/lib/nwsdb";
import { getSourceProvenancePath } from "@/lib/sources";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const unitsRaw = url.searchParams.get("units");
  const daysRaw = url.searchParams.get("days");
  const trackId = url.searchParams.get("track") ?? "domestic";

  const unitsM3 = unitsRaw == null ? 20 : Number(unitsRaw);
  const noOfDays = daysRaw == null ? 30 : Number(daysRaw);
  const snapshot = getNwsdbTariffSnapshot();
  const seedEstimate = Number.isFinite(unitsM3)
    ? estimateWaterBill(unitsM3, trackId)
    : null;

  const liveEstimate =
    seedEstimate && Number.isFinite(noOfDays) && noOfDays > 0
      ? await fetchLiveWaterBillEstimate({
          unitsM3: seedEstimate.unitsM3,
          trackId,
          noOfDays,
        })
      : null;

  return jsonWithCache(
    {
      generatedAt: new Date().toISOString(),
      sourceId: snapshot.sourceId,
      effectiveFrom: snapshot.effectiveFrom,
      methodologyNote: snapshot.methodologyNote,
      tracks: snapshot.tracks,
      seedEstimate,
      liveEstimate,
      liveAvailable: liveEstimate != null,
      billCalculatorUrl: snapshot.billCalculatorUrl,
      provenancePath: getSourceProvenancePath(snapshot.sourceId),
    },
    { maxAge: 3600, staleWhileRevalidate: 86400, request },
  );
}
