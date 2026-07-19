import { jsonWithCache } from "@/lib/api-cache";
import { buildMorningBrief } from "@/lib/integrations/brief";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brief = await buildMorningBrief(searchParams.get("locale") ?? "en");

  return jsonWithCache(
    {
      ...brief,
    },
    { maxAge: 1800, staleWhileRevalidate: 3600, request },
  );
}
