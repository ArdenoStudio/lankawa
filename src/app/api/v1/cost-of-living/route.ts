import { jsonWithCache } from "@/lib/api-cache";
import { getCostOfLivingData } from "@/lib/cost-of-living";

export async function GET(request: Request) {
  const snapshot = await getCostOfLivingData();
  return jsonWithCache(snapshot, { request, maxAge: 3600 });
}
