import tendersData from "@/data/tenders-seed.json";
import type { TenderNotice, TenderStatus } from "./types";

const snapshot = tendersData as { notices: TenderNotice[]; sourceId: string; sourceName: string; asOf: string };

export function getTendersSnapshot() {
  return snapshot;
}

export function getAllTenders(): TenderNotice[] {
  return snapshot.notices;
}

export function filterTenders(options: {
  q?: string;
  district?: string;
  province?: string;
  category?: string;
  status?: TenderStatus;
}): TenderNotice[] {
  const normalizedQuery = options.q?.trim().toLowerCase() ?? "";

  return snapshot.notices.filter((notice) => {
    if (options.district && notice.district !== options.district) {
      return false;
    }
    if (options.province && notice.province !== options.province) {
      return false;
    }
    if (options.category && notice.category !== options.category) {
      return false;
    }
    if (options.status && notice.status !== options.status) {
      return false;
    }
    if (normalizedQuery) {
      const haystack = [
        notice.title,
        notice.reference,
        notice.ministry,
        notice.district,
        notice.province,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });
}
