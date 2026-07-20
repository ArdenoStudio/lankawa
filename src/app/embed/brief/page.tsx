import { buildMorningBrief } from "@/lib/integrations/brief";

export const dynamic = "force-dynamic";

export default async function EmbedBriefPage() {
  const brief = await buildMorningBrief("en");

  return (
    <div className="min-h-screen p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-white">
          Lankawa Brief
        </p>
        <p className="text-[11px] text-slate-500">
          {new Date(brief.generatedAt).toLocaleString("en-LK", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      {brief.bullets.length > 0 ? (
        <ul className="space-y-2" role="list">
          {brief.bullets.slice(0, 4).map((bullet, index) => (
            <li
              key={`${brief.generatedAt}-${index}`}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm leading-5 text-slate-100"
            >
              {bullet}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">
          Morning brief unavailable — check Lankawa for the latest.
        </p>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Quality: {brief.quality}
        {brief.mode ? ` · ${brief.mode}` : ""}
      </p>
    </div>
  );
}
