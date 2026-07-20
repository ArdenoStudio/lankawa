import type { GdacsEvent, GdacsSnapshot } from "@/lib/integrations/gdacs";

export interface CycloneWatchSnapshot {
  active: boolean;
  events: GdacsEvent[];
  asOf: string;
  sourceId: string;
  sourceName: string;
  provenancePath: string;
  error: string | null;
}

const TC_TYPES = new Set(["TC", "CY", "TS"]);

export function isTropicalCycloneEvent(event: GdacsEvent): boolean {
  const type = event.eventType.toUpperCase();
  if (TC_TYPES.has(type)) {
    return true;
  }
  return /cyclone|typhoon|hurricane|tropical\s*storm/i.test(event.name);
}

export function buildCycloneWatch(
  gdacs: GdacsSnapshot,
): CycloneWatchSnapshot {
  const events = gdacs.events.filter(isTropicalCycloneEvent);
  return {
    active: events.length > 0,
    events,
    asOf: gdacs.asOf,
    sourceId: gdacs.sourceId,
    sourceName: gdacs.sourceName,
    provenancePath: gdacs.provenancePath,
    error: gdacs.error,
  };
}
