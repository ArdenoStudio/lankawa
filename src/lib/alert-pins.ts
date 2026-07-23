import { DISTRICTS } from "@/lib/districts";

export const ALERT_PIN_IDS = [
  "fx_move",
  "flood",
  "flood_rising",
  "power",
  "met",
  "landslide",
  "fire",
  "gdacs",
  "fuel_revision",
  "met_flood",
  "dengue_spike",
  "cse_move",
  "col_basket",
  "news_cluster",
  "tender_closing",
  "card_day",
] as const;

export type AlertPinId = (typeof ALERT_PIN_IDS)[number];

export interface AlertSignalContext {
  fxAbsDeltaLkr: number | null;
  fxThresholdLkr: number;
  fxUnusual: boolean;
  fxAnomalyDetail: string | null;
  floodElevated: boolean;
  floodDetail: string | null;
  floodRising: boolean;
  floodRisingDetail: string | null;
  powerAttention: boolean;
  powerDetail: string | null;
  metWarning: boolean;
  metDetail: string | null;
  landslideAttention: boolean;
  landslideDetail: string | null;
  fireAttention: boolean;
  fireDetail: string | null;
  gdacsAttention: boolean;
  gdacsDetail: string | null;
  fuelRevisionAttention: boolean;
  fuelRevisionDetail: string | null;
  metFloodAttention: boolean;
  metFloodDetail: string | null;
  dengueSpikeAttention: boolean;
  dengueSpikeDetail: string | null;
  cseMoveAttention: boolean;
  cseMoveDetail: string | null;
  colBasketAttention: boolean;
  colBasketDetail: string | null;
  newsClusterAttention: boolean;
  newsClusterDetail: string | null;
  tenderClosingAttention: boolean;
  tenderClosingDetail: string | null;
  cardDayAttention: boolean;
  cardDayDetail: string | null;
}

export interface FiredAlert {
  id: AlertPinId;
  detail: string;
}

export function isAlertPinId(value: string): value is AlertPinId {
  return (ALERT_PIN_IDS as readonly string[]).includes(value);
}

export function evaluateAlertPins(
  pins: AlertPinId[],
  context: AlertSignalContext,
): FiredAlert[] {
  const fired: FiredAlert[] = [];

  for (const pin of pins) {
    switch (pin) {
      case "fx_move": {
        const byThreshold =
          context.fxAbsDeltaLkr != null &&
          context.fxAbsDeltaLkr >= context.fxThresholdLkr;
        if (byThreshold || context.fxUnusual) {
          fired.push({
            id: pin,
            detail:
              context.fxAnomalyDetail ??
              (context.fxAbsDeltaLkr != null
                ? `USD/LKR moved ${context.fxAbsDeltaLkr.toFixed(2)} LKR (≥ ${context.fxThresholdLkr})`
                : "Unusual FX move"),
          });
        }
        break;
      }
      case "flood": {
        if (context.floodElevated) {
          fired.push({
            id: pin,
            detail: context.floodDetail ?? "Elevated flood station alerts",
          });
        }
        break;
      }
      case "flood_rising": {
        if (context.floodRising) {
          fired.push({
            id: pin,
            detail: context.floodRisingDetail ?? "River level rising quickly",
          });
        }
        break;
      }
      case "power": {
        if (context.powerAttention) {
          fired.push({
            id: pin,
            detail: context.powerDetail ?? "Power schedule/outage attention",
          });
        }
        break;
      }
      case "met": {
        if (context.metWarning) {
          fired.push({
            id: pin,
            detail: context.metDetail ?? "Met Dept weather warning active",
          });
        }
        break;
      }
      case "landslide": {
        if (context.landslideAttention) {
          fired.push({
            id: pin,
            detail:
              context.landslideDetail ?? "Landslide watch/warning districts active",
          });
        }
        break;
      }
      case "fire": {
        if (context.fireAttention) {
          fired.push({
            id: pin,
            detail: context.fireDetail ?? "Active fire detections in Sri Lanka",
          });
        }
        break;
      }
      case "gdacs": {
        if (context.gdacsAttention) {
          fired.push({
            id: pin,
            detail: context.gdacsDetail ?? "Regional GDACS hazard alert",
          });
        }
        break;
      }
      case "fuel_revision": {
        if (context.fuelRevisionAttention) {
          fired.push({
            id: pin,
            detail:
              context.fuelRevisionDetail ?? "CPC fuel revision window active",
          });
        }
        break;
      }
      case "met_flood": {
        if (context.metFloodAttention) {
          fired.push({
            id: pin,
            detail:
              context.metFloodDetail ??
              "Met warning with elevated or rising flood",
          });
        }
        break;
      }
      case "dengue_spike": {
        if (context.dengueSpikeAttention) {
          fired.push({
            id: pin,
            detail:
              context.dengueSpikeDetail ?? "Dengue week-over-week spike",
          });
        }
        break;
      }
      case "cse_move": {
        if (context.cseMoveAttention) {
          fired.push({
            id: pin,
            detail: context.cseMoveDetail ?? "ASPI session move ≥ 1%",
          });
        }
        break;
      }
      case "col_basket": {
        if (context.colBasketAttention) {
          fired.push({
            id: pin,
            detail:
              context.colBasketDetail ?? "Household basket input moved sharply",
          });
        }
        break;
      }
      case "news_cluster": {
        if (context.newsClusterAttention) {
          fired.push({
            id: pin,
            detail:
              context.newsClusterDetail ?? "Multi-outlet news cluster active",
          });
        }
        break;
      }
      case "tender_closing": {
        if (context.tenderClosingAttention) {
          fired.push({
            id: pin,
            detail:
              context.tenderClosingDetail ??
              "e-GP tenders closing within 7 days",
          });
        }
        break;
      }
      case "card_day": {
        if (context.cardDayAttention) {
          fired.push({
            id: pin,
            detail:
              context.cardDayDetail ??
              "Supermarket card offer active today",
          });
        }
        break;
      }
      default: {
        const _exhaustive: never = pin;
        void _exhaustive;
      }
    }
  }

  return fired;
}

export function floodIsElevated(
  levels: Array<{ alertLevel: string; count: number }>,
): { elevated: boolean; detail: string | null } {
  const elevated = levels.filter((level) => {
    const key = level.alertLevel.toUpperCase();
    return (
      level.count > 0 &&
      key !== "NORMAL" &&
      key !== "NONE" &&
      key !== "UNKNOWN" &&
      key !== "NO ALERT"
    );
  });

  if (elevated.length === 0) {
    return { elevated: false, detail: null };
  }

  const detail = elevated
    .map((level) => `${level.alertLevel}: ${level.count}`)
    .join(" · ");
  return { elevated: true, detail };
}

function normalizeDistrictToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Resolve Met advisory district names (or slugs) to Lankawa district slugs. */
export function resolveDistrictSlugs(values: string[]): string[] {
  const slugs = new Set<string>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }
    const asSlug = trimmed.toLowerCase().replace(/\s+/g, "-");
    if (DISTRICTS.some((district) => district.slug === asSlug)) {
      slugs.add(asSlug);
      continue;
    }
    const normalized = ` ${normalizeDistrictToken(trimmed)} `;
    for (const district of DISTRICTS) {
      const names = [
        district.name,
        district.capital,
        district.slug.replace(/-/g, " "),
        district.nameSi,
        district.nameTa,
      ];
      if (
        names.some((name) =>
          normalized.includes(` ${normalizeDistrictToken(name)} `),
        )
      ) {
        slugs.add(district.slug);
        break;
      }
    }
  }

  return [...slugs].sort((a, b) => a.localeCompare(b));
}

/**
 * Met∩flood compound signal. When both Met warning districts and elevated/rising
 * flood station districts are available, require a non-empty intersection.
 * If either side lacks district geo, falls back to coarse Met AND flood.
 * Return shape stays `{ metFloodAttention, metFloodDetail }`.
 */
export function computeMetFloodAttention(input: {
  metWarning: boolean;
  metDetail: string | null;
  metDistricts: string[];
  floodElevated: boolean;
  floodDetail: string | null;
  floodRising: boolean;
  floodRisingDetail: string | null;
  floodDistricts: string[];
}): { metFloodAttention: boolean; metFloodDetail: string | null } {
  const floodSide = input.floodElevated || input.floodRising;
  if (!input.metWarning || !floodSide) {
    return { metFloodAttention: false, metFloodDetail: null };
  }

  const metSlugs = resolveDistrictSlugs(input.metDistricts);
  const floodSlugs = resolveDistrictSlugs(input.floodDistricts);
  const bothHaveDistricts = metSlugs.length > 0 && floodSlugs.length > 0;

  if (bothHaveDistricts) {
    const floodSet = new Set(floodSlugs);
    const intersection = metSlugs.filter((slug) => floodSet.has(slug));
    if (intersection.length === 0) {
      return { metFloodAttention: false, metFloodDetail: null };
    }

    const floodPart = input.floodRising
      ? input.floodRisingDetail
      : input.floodDetail;
    const metFloodDetail =
      [
        input.metDetail,
        floodPart,
        `overlap ${intersection.slice(0, 3).join(", ")}`,
      ]
        .filter(Boolean)
        .join(" · ") || null;

    return { metFloodAttention: true, metFloodDetail };
  }

  const metFloodDetail =
    [input.metDetail, input.floodRising ? input.floodRisingDetail : input.floodDetail]
      .filter(Boolean)
      .join(" · ") || null;

  return { metFloodAttention: true, metFloodDetail };
}

export function powerNeedsAttention(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();
  return (
    normalized.includes("outage") ||
    normalized.includes("scheduled") ||
    normalized.includes("load")
  );
}
