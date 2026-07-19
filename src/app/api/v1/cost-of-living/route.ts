import { jsonWithCache } from "@/lib/api-cache";
import { getCostOfLivingSnapshot } from "@/lib/cost-of-living";

export async function GET(request: Request) {
  const snapshot = getCostOfLivingSnapshot();
  return jsonWithCache(snapshot, { request, maxAge: 86400 });
}
